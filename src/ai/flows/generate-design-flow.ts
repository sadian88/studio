
'use server';
/**
 * @fileOverview A flow for generating images based on a text prompt using Runware API.
 *
 * - generateDesign - Generates an image from a prompt using Runware.
 * - GenerateDesignInput - The input type for the generateDesign function.
 * - GenerateDesignOutput - The return type for the generateDesign function.
 */

import {z} from 'genkit';

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
  // The output is expected to be a base64 data URI.
  imageDataUri: z.string().describe("The generated image as a base64 data URI from Runware API."),
});
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

// IMPORTANT: User needs to replace these placeholders or set environment variables.
// For Firebase App Hosting, use Secret Manager for production API keys.
const RUNWAY_API_ENDPOINT = process.env.RUNWAY_API_ENDPOINT || 'YOUR_RUNWARE_SDXL_APP_RUNSYNC_ENDPOINT_HERE'; // e.g., 'https://your-sdxl-app.runware.ai/runsync'
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY; // Your Runware API Token

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
    console.error("Runware API Key (Token) is not configured. Please set the RUNWAY_API_KEY environment variable.");
    throw new Error("La configuración para la generación de imágenes IA no está completa (API Key). Por favor, contacta al administrador.");
  }
  if (RUNWAY_API_ENDPOINT === 'YOUR_RUNWARE_SDXL_APP_RUNSYNC_ENDPOINT_HERE' || !RUNWAY_API_ENDPOINT.includes('runware.ai/runsync')) {
    console.error("Runware API Endpoint is not configured correctly. Please set the RUNWAY_API_ENDPOINT environment variable to your Runware app's /runsync URL.");
    throw new Error("La configuración para la generación de imágenes IA no está completa (endpoint). Por favor, contacta al administrador.");
  }

  generatedDesigns.push({ timestamp: Date.now(), userId });

  try {
    const requestBody = {
      inputs: {
        prompt: input.prompt.trim(),
        width: 512, // Default width, adjust as needed
        height: 512, // Default height, adjust as needed
        seed: Date.now(), // For variability
        // Add other Runware SDXL parameters if needed, e.g.:
        // negative_prompt: "blurry, low quality",
        // num_inference_steps: 50,
        // guidance_scale: 7.5,
      }
    };

    console.log("Sending request to Runware:", RUNWAY_API_ENDPOINT, "with prompt:", input.prompt.trim());

    const response = await fetch(RUNWAY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json(); // Try to parse JSON regardless of response.ok for error details

    if (!response.ok) {
      let errorDetails = `Runware API request failed with status: ${response.status}.`;
      if (result && result.error && result.error.message) {
        errorDetails += ` Details: ${result.error.message}`;
      } else if (result && result.detail) { // Some APIs might use 'detail'
         errorDetails += ` Details: ${typeof result.detail === 'string' ? result.detail : JSON.stringify(result.detail)}`;
      } else {
        errorDetails += ` Response: ${JSON.stringify(result)}`;
      }
      console.error(errorDetails);
      throw new Error(`La IA de Runware no pudo generar una imagen. ${errorDetails}`);
    }
    
    if (result.status !== 'SUCCEEDED' || !result.outputs || !result.outputs.image_base64) {
      let errorReason = "La respuesta de Runware no fue exitosa o no contenía los datos de imagen esperados.";
      if (result.status && result.status !== 'SUCCEEDED') {
        errorReason += ` Estado: ${result.status}.`;
      }
      if (result.error && result.error.message) {
        errorReason += ` Error: ${result.error.message}.`;
      }
      console.error("Runware API call did not succeed or returned unexpected data. Response:", result);
      throw new Error(errorReason);
    }

    const imageDataUri = result.outputs.image_base64; 

    if (!imageDataUri || typeof imageDataUri !== 'string' || !imageDataUri.startsWith('data:image')) {
      console.error("Runware API did not return a valid base64 image data URI. Received:", imageDataUri);
      throw new Error("La IA de Runware no devolvió una URI de datos de imagen válida.");
    }
    
    return { imageDataUri: imageDataUri };

  } catch (error) {
    console.error("Error in generateDesignFlow with Runware:", error);
    if (error instanceof Error) {
      const knownErrors = ["Has alcanzado el límite", "La IA de Runware no pudo", "La IA de Runware no devolvió", "La respuesta de Runware no fue exitosa"];
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
