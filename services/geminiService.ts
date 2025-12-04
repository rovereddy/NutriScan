import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, HealthLevel, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    productName: {
      type: Type.STRING,
      description: "Inferred name of the product or 'Unknown Product' if not visible.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief 1-2 sentence summary of the nutritional quality.",
    },
    ingredients: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          level: {
            type: Type.STRING,
            enum: ["HEALTHY", "MODERATE", "CONCERN", "UNKNOWN"],
            description: "Classification of the ingredient.",
          },
          reason: {
            type: Type.STRING,
            description: "Short explanation of why it fits this category (max 10 words).",
          },
          healthRisks: {
             type: Type.STRING,
             description: "For CONCERN items: detail specific physiological effects (e.g., 'Spikes insulin', 'Increases inflammation'). Leave empty for HEALTHY items."
          }
        },
        required: ["name", "level", "reason"],
      },
    },
  },
  required: ["summary", "ingredients", "productName"],
};

export const analyzeIngredients = async (base64Image: string, language: Language = 'en'): Promise<AnalysisResult> => {
  try {
    // Strip header if present (data:image/jpeg;base64,...)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const languageInstruction = language === 'zh' 
      ? "Provide the 'productName', 'summary', ingredient 'name', 'reason', and 'healthRisks' in Traditional Chinese (Hong Kong usage). Keep the 'level' enum values (HEALTHY, MODERATE, CONCERN) in English."
      : "Provide all text fields in English.";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze the image to find the ingredients list on the food packaging. 
            Ignore nutrition facts table numbers, focus on the ingredients text.
            If no ingredients are found, return an empty ingredient list with a summary stating 'No ingredients detected'.
            
            Classify each ingredient into HEALTHY, MODERATE, or CONCERN. 
            - HEALTHY: Whole foods, natural spices, vitamins.
            - MODERATE: Processed but okay in moderation, seed oils, starches.
            - CONCERN: High fructose corn syrup, artificial colors (Red 40, etc), preservatives like nitrates, partially hydrogenated oils.
            
            IMPORTANT: For any ingredient categorized as 'CONCERN', you MUST provide the 'healthRisks' field describing specific potential negative effects on the body (e.g. "Linked to hyperactivity in children", "May cause insulin resistance", "Can disrupt gut microbiome").
            
            ${languageInstruction}
            
            Be strict but fair.
            `,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0, // Set to 0 for deterministic results
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    const result = JSON.parse(text) as AnalysisResult;
    
    // Validate mapping to enum just in case
    result.ingredients = result.ingredients.map(ing => ({
      ...ing,
      level: Object.values(HealthLevel).includes(ing.level as HealthLevel) 
        ? (ing.level as HealthLevel) 
        : HealthLevel.UNKNOWN
    }));

    return result;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze ingredients. Please try again with a clearer image.");
  }
};