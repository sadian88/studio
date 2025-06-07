
'use server';
/**
 * @fileOverview A flow for generating images based on a text prompt using Pollinations API.
 *
 * - generateDesign - Generates an image from a prompt using Pollinations.
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
  imageDataUri: z.string().describe("The generated image as a direct URL from Pollinations API."),
});
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

async function generateDesignFlow(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  // Simulate authentication or get user ID from context/session
  // In a real application, you would get the user ID from the authenticated session
  const userId = 'simulated-user-id'; // Using a placeholder for demonstration

  cleanUpOldRecords();

  const userDesignsInWindow = generatedDesigns.filter(record => record.userId === userId).length;

  if (userDesignsInWindow >= MAX_DESIGNS_PER_USER_PER_WINDOW) {
    throw new Error("Has alcanzado el límite de 3 diseños por IA en las últimas 24 horas. Si necesitas ayuda adicional con tu diseño, por favor contáctanos por WhatsApp.");
  }
  
  if (!input.prompt || input.prompt.trim() === "") {
    throw new Error("El prompt para generar la imagen no puede estar vacío.");
  }

  generatedDesigns.push({ timestamp: Date.now(), userId });

  try {
    const encodedPrompt = encodeURIComponent(input.prompt.trim());
    // Using Pollinations API. Requesting a 512x512 image.
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&seed=${Date.now()}`;
    // We could add a fetch here to verify the image URL is valid and returns a 200 with an image content-type,
    // but for simplicity, we'll return the URL directly. The browser will handle broken links.
    // If the API call itself fails (e.g. network error, or Pollinations is down),
    // the client-side calling function should catch this.

    // To make it behave somewhat like the previous Gemini flow, we will try to fetch
    // to see if an image is actually returned, otherwise Pollinations might return an error page.
    const response = await fetch(imageUrl, { method: 'GET' });

    if (!response.ok) {
        // Attempt to get some text from the response if it's not an image
        const errorText = await response.text().catch(() => "Pollinations API request failed.");
        console.error("Pollinations API error:", response.status, errorText);
        throw new Error(`La IA de Pollinations no pudo generar una imagen (estado: ${response.status}). Intenta con otra descripción o más tarde.`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
        console.error("Pollinations API did not return an image. Content-Type:", contentType);
        throw new Error("La IA de Pollinations no devolvió una imagen válida. Intenta con otra descripción.");
    }
    
    // The URL itself is what we need, as Pollinations serves the image directly.
    return { imageDataUri: response.url }; // or imageUrl, response.url handles potential redirects

  } catch (error) {
    console.error("Error in generateDesignFlow with Pollinations:", error);
    if (error instanceof Error) {
      throw new Error(`Error generando diseño con Pollinations: ${error.message}`);
    }
    throw new Error('Ocurrió un error inesperado durante la generación de la imagen con Pollinations.');
  }
}

export async function generateDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}
