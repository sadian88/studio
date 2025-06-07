
'use server';
/**
 * @fileOverview A flow for generating images based on a text prompt using Runware API (batched task method).
 *
 * - generateDesign - Generates an image from a prompt using Runware.
 * - GenerateDesignInput - The input type for the generateDesign function.
 * - GenerateDesignOutput - The return type for the generateDesign function.
 */

import {z} from 'genkit';
import { randomUUID } from 'crypto'; // For generating taskUUID

interface DesignRecord {
  timestamp: number;
  userId: string;
}

let generatedDesigns: DesignRecord[] = [];
const WINDOW_SIZE_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_DESIGNS_PER_USER_PER_WINDOW = 3;

const cleanUpOldRecords = () => {
  const cutoff = Date.now() - WINDOW_SIZE_MS;
  generatedDesigns = generatedDesigns.filter(record => record.timestamp > cutoff);
};

const GenerateDesignInputSchema = z.object({
  prompt: z.string().describe('The text prompt to generate an image from.'),
});
export type GenerateDesignInput = z.infer<typeof GenerateDesignInputSchema>;

const GenerateDesignOutputSchema = z.object({
  // This will now contain the imageURL from Runware API.
  imageDataUri: z.string().describe("The generated image URL from Runware API."),
});
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

const RUNWAY_API_ENDPOINT = 'https://api.runware.ai/v1';
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY;
const DEFAULT_MODEL_ID = "runware:101@1"; // Updated model ID

async function generateDesignFlow(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  const userId = 'simulated-user-id'; // Replace with actual user ID in a real app

  cleanUpOldRecords();

  const userDesignsInWindow = generatedDesigns.filter(record => record.userId === userId).length;

  if (userDesignsInWindow >= MAX_DESIGNS_PER_USER_PER_WINDOW) {
    throw new Error("Has alcanzado el límite de 3 diseños por IA en las últimas 24 horas. Si necesitas ayuda adicional con tu diseño, por favor contáctanos por WhatsApp.");
  }
  
  if (!input.prompt || input.prompt.trim() === "") {
    throw new Error("El prompt para generar la imagen no puede estar vacío.");
  }

  if (!RUNWAY_API_KEY) {
    console.error("Runware API Key is not configured. Please set the RUNWAY_API_KEY environment variable.");
    throw new Error("La configuración para la generación de imágenes IA no está completa (API Key). Por favor, contacta al administrador.");
  }

  generatedDesigns.push({ timestamp: Date.now(), userId });

  const imageTaskUUID = randomUUID();

  try {
    const requestBody = [
      {
        taskType: "authentication",
        apiKey: RUNWAY_API_KEY
      },
      {
        taskType: "imageInference",
        taskUUID: imageTaskUUID,
        positivePrompt: input.prompt.trim(),
        width: 512, 
        height: 512, 
        model: DEFAULT_MODEL_ID, 
        numberResults: 1
        // Add other Runware parameters if needed from the documentation
        // e.g., negative_prompt, seed, guidance_scale, etc.
      }
    ];

    console.log("Sending request to Runware:", RUNWAY_API_ENDPOINT, "with tasks for prompt:", input.prompt.trim());

    const response = await fetch(RUNWAY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header needed, API key is in the body
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json(); 

    if (!response.ok) {
      let errorDetails = `Runware API request failed with status: ${response.status}.`;
      if (result && result.error && typeof result.error === 'string') {
        errorDetails += ` Details: ${result.error}`;
      } else if (result && result.error && result.error.message) {
         errorDetails += ` Details: ${result.error.message}`;
      } else if (result && result.detail) { 
         errorDetails += ` Details: ${typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail)}`;
      } else {
        errorDetails += ` Response: ${JSON.stringify(result)}`;
      }
      console.error(errorDetails);
      throw new Error(`La IA de Runware no pudo generar una imagen. ${errorDetails}`);
    }
    
    if (!result.data || !Array.isArray(result.data)) {
      console.error("Runware API call did not return the expected 'data' array. Response:", result);
      throw new Error("La respuesta de Runware no contenía los datos esperados.");
    }

    const inferenceResponse = result.data.find(
      (task: any) => task.taskType === "imageInference" && task.taskUUID === imageTaskUUID
    );

    if (!inferenceResponse || !inferenceResponse.imageURL) {
      console.error("Runware API did not return a valid imageURL for the inference task. Response:", result);
      throw new Error("La IA de Runware no devolvió una URL de imagen válida para la tarea de inferencia.");
    }
    
    const imageUrl = inferenceResponse.imageURL;
    return { imageDataUri: imageUrl }; // imageDataUri now holds the URL

  } catch (error) {
    console.error("Error in generateDesignFlow with Runware (batched task):", error);
    if (error instanceof Error) {
      const knownErrors = ["Has alcanzado el límite", "La IA de Runware no pudo", "La IA de Runware no devolvió", "La respuesta de Runware no contenía"];
      if (!knownErrors.some(knownError => error.message.startsWith(knownError))) {
        throw new Error(`Error generando diseño con Runware: ${error.message}`);
      } else {
        throw error; 
      }
    }
    throw new Error('Ocurrió un error inesperado durante la generación de la imagen con Runware.');
  }
}

export async function generateDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}

