
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, WorkoutPlan, Exercise, SetDetail } from "../types";
import { EXERCISE_FALLBACK_IMG } from "./storageService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateAIBackground(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `Professional fitness photography, high quality, cinematic lighting, dark gym aesthetic, ${prompt}. Ultra-realistic, 8k resolution, wide shot, atmospheric depth.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Nenhuma imagem gerada");
  } catch (error) {
    console.error("Erro ao gerar imagem de fundo:", error);
    return `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop`;
  }
}

const enrichExerciseData = (ex: any, prefs?: UserPreferences) => {
  const baseWeight = ex.initialWeight || (prefs?.gender === 'Feminino' ? "5kg" : "10kg");
  
  const setDetails: SetDetail[] = Array.from({ length: ex.sets || 3 }).map(() => ({
    id: Math.random().toString(36).substr(2, 9),
    weight: baseWeight,
    reps: (ex.reps || "12").split('-')[0].trim(),
    isCompleted: false
  }));

  let finalImageUrl = ex.imageUrl;
  if (!finalImageUrl || !finalImageUrl.includes('http')) {
      // Usamos tags mais genéricas para garantir que o serviço de placeholder retorne uma imagem válida
      const keywords = encodeURIComponent(`${ex.englishName || ex.name},fitness,gym`);
      finalImageUrl = `https://loremflickr.com/800/600/${keywords}/all`;
  }

  return {
    ...ex,
    id: Math.random().toString(36).substr(2, 9),
    imageUrl: finalImageUrl,
    initialWeight: baseWeight,
    setDetails
  };
};

export async function getExerciseAlternatives(oldExercise: Exercise, prefs: UserPreferences): Promise<Exercise[]> {
  const prompt = `
    Como personal trainer especialista em biomecânica, sugira exatamente 4 exercícios alternativos para "${oldExercise.name}".
    Contexto do Usuário: 
    - Gênero: ${prefs.gender} | Idade: ${prefs.age} | Nível: ${prefs.experienceLevel}
    - Equipamento: ${prefs.equipment} | Objetivo: ${prefs.goal}

    Regra de Peso: Sugira um "initialWeight" realista para este perfil específico (ex: "12kg", "30kg").
    Retorne um JSON com a lista 'alternatives' contendo: name, englishName, muscleGroup, sets, reps, rest, initialWeight, imageUrl, executionTip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  englishName: { type: Type.STRING },
                  muscleGroup: { type: Type.STRING },
                  sets: { type: Type.NUMBER },
                  reps: { type: Type.STRING },
                  rest: { type: Type.NUMBER },
                  initialWeight: { type: Type.STRING },
                  imageUrl: { type: Type.STRING },
                  executionTip: { type: Type.STRING }
                },
                required: ["name", "englishName", "muscleGroup", "sets", "reps", "rest", "initialWeight", "imageUrl", "executionTip"]
              }
            }
          },
          required: ["alternatives"]
        }
      }
    });

    const result = JSON.parse(response.text);
    return result.alternatives.map((ex: any) => enrichExerciseData(ex, prefs));
  } catch (error) {
    console.error("Erro ao buscar alternativas:", error);
    return [];
  }
}

export async function generateWorkoutPlan(prefs: UserPreferences): Promise<WorkoutPlan> {
  const prompt = `
    Aja como um personal trainer especialista e biomecânico. Gere um plano de treinamento completo em formato JSON.
    Perfil do Aluno:
    - Gênero: ${prefs.gender} | Idade: ${prefs.age} anos | Nível: ${prefs.experienceLevel}
    - Objetivo: ${prefs.goal} | Equipamento: ${prefs.equipment} | Foco: ${prefs.focusMuscles.join(', ')}

    Regras de Carga:
    1. Calcule o "initialWeight" para cada exercício baseando-se no gênero (${prefs.gender}), idade (${prefs.age}) e nível (${prefs.experienceLevel}).
    2. O warmup deve ter cargas mínimas (ex: "2kg" ou "10kg").
    3. Retorne um JSON com a lista 'days' contendo label, description e exercises.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            days: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  exercises: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        englishName: { type: Type.STRING },
                        muscleGroup: { type: Type.STRING },
                        sets: { type: Type.NUMBER },
                        reps: { type: Type.STRING },
                        rest: { type: Type.NUMBER },
                        initialWeight: { type: Type.STRING },
                        imageUrl: { type: Type.STRING },
                        executionTip: { type: Type.STRING }
                      },
                      required: ["name", "englishName", "muscleGroup", "sets", "reps", "rest", "initialWeight", "imageUrl", "executionTip"]
                    }
                  }
                },
                required: ["label", "description", "exercises"]
              }
            }
          },
          required: ["days"]
        }
      }
    });

    const result = JSON.parse(response.text);
    const enrichedDays = result.days.map((day: any) => ({
      ...day,
      exercises: day.exercises.map((ex: any) => enrichExerciseData(ex, prefs))
    }));

    return {
      id: Math.random().toString(36).substr(2, 9),
      name: `Treino IA - ${prefs.goal}`,
      isAI: true,
      createdAt: Date.now(),
      days: enrichedDays
    };
  } catch (error) {
    console.error("Erro ao gerar treino:", error);
    throw error;
  }
}
