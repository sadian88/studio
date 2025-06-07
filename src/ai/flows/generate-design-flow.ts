
'use server';
/**
 * @fileOverview A flow for generating images based on a text prompt using RunwayML API.
 *
 * - generateDesign - Generates an image from a prompt using RunwayML.
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
  // The output is expected to be a direct URL to the image.
  imageDataUri: z.string().describe("The generated image as a direct URL from RunwayML API."),
});
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

// IMPORTANT: User needs to replace these placeholders with actual RunwayML details.
// You should store your API key securely, preferably in an environment variable.
// For Firebase App Hosting, use Secret Manager for production API keys.
const RUNWAY_API_ENDPOINT = process.env.RUNWAY_API_ENDPOINT || 'YOUR_RUNWAYML_API_ENDPOINT_HERE'; // e.g., 'https://api.runwayml.com/v1/...'
const RUNWAY_API_KEY = process.env.RUNWAY_API_KEY; // Ensure this environment variable is set

async function generateDesignFlow(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  const userId = 'simulated-user-id'; 

  cleanUpOldRecords();

  const userDesignsInWindow = generatedDesigns.filter(record => record.userId === userId).length;

  if (userDesignsInWindow >= MAX_DESIGNS_PER_USER_PER_WINDOW) {
    throw new Error("Has alcanzado el límite de 3 diseños por IA en las últimas 24 horas. Si necesitas ayuda adicional con tu diseño, por favor contáctanos por WhatsApp.");
  }
  
  if (!input.prompt || input.prompt.trim() === "") {
    throw new Error("El prompt para generar la imagen no puede estar vacío.");
  }

  if (!RUNWAY_API_KEY) {
    console.error("RunwayML API Key is not configured. Please set the RUNWAY_API_KEY environment variable.");
    throw new Error("La configuración para la generación de imágenes IA no está completa. Por favor, contacta al administrador.");
  }
  if (RUNWAY_API_ENDPOINT === 'YOUR_RUNWAYML_API_ENDPOINT_HERE') {
    console.error("RunwayML API Endpoint is not configured. Please set the RUNWAY_API_ENDPOINT environment variable or update the default in the code.");
    throw new Error("La configuración para la generación de imágenes IA no está completa (endpoint). Por favor, contacta al administrador.");
  }

  generatedDesigns.push({ timestamp: Date.now(), userId });

  try {
    // IMPORTANT: Customize the requestBody to match what your specific RunwayML model/endpoint expects.
    // This is a generic example.
    const requestBody = {
      prompt: input.prompt.trim(),
      // Common parameters you might need to add:
      // width: 512,
      // height: 512,
      // model_id: 'your-runwayml-model-id', // If applicable
      // seed: Date.now(), // For reproducibility, if supported
      // n_samples: 1, // Number of images
      // ... any other parameters required by RunwayML
    };

    console.log("Sending request to RunwayML:", RUNWAY_API_ENDPOINT, "with prompt:", input.prompt.trim());

    const response = await fetch(RUNWAY_API_ENDPOINT, {
      method: 'POST', // Or 'GET', or other method as required by RunwayML
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RUNWAY_API_KEY}`, // Common authentication method, adjust if needed
        // Add any other headers required by RunwayML
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorDetails = `RunwayML API request failed with status: ${response.status}.`;
      try {
        const errorResponse = await response.json(); // Try to parse error response from RunwayML
        errorDetails += ` Details: ${JSON.stringify(errorResponse.detail || errorResponse.message || errorResponse)}`;
      } catch (e) {
        const errorText = await response.text().catch(() => "");
        errorDetails += ` Response: ${errorText || "(Could not retrieve error text)"}`;
      }
      console.error(errorDetails);
      throw new Error(`La IA de RunwayML no pudo generar una imagen. ${errorDetails}`);
    }
    
    const result = await response.json();

    // IMPORTANT: Adapt the line below to correctly extract the image URL from the RunwayML API response.
    // Check the RunwayML API documentation for the response structure.
    // Examples: result.imageUrl, result.outputs[0].url, result.asset.url, etc.
    const imageUrl = result.url || result.imageUrl || result.image_url || (result.outputs && result.outputs[0]?.url); 

    if (!imageUrl || typeof imageUrl !== 'string') {
      console.error("RunwayML API did not return a valid image URL in the expected format. Response:", result);
      throw new Error("La IA de RunwayML no devolvió una URL de imagen válida. Revisa la estructura de la respuesta.");
    }
    
    return { imageDataUri: imageUrl };

  } catch (error) {
    console.error("Error in generateDesignFlow with RunwayML:", error);
    if (error instanceof Error) {
      // Prepend a user-friendly message if it's not already one from our checks
      const knownErrors = ["Has alcanzado el límite", "La IA de RunwayML no pudo", "La IA de RunwayML no devolvió"];
      if (!knownErrors.some(knownError => error.message.startsWith(knownError))) {
        throw new Error(`Error generando diseño con RunwayML: ${error.message}`);
      } else {
        throw error; // Re-throw if it's already a user-friendly error
      }
    }
    throw new Error('Ocurrió un error inesperado durante la generación de la imagen con RunwayML.');
  }
}

export async function generateDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}
