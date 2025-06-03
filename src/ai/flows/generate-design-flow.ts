
'use server';
/**
 * @fileOverview A Genkit flow for generating images based on a text prompt.
 *
 * - generateDesign - Generates an image from a prompt using Gemini 2.0 Flash experimental.
 * - GenerateDesignInput - The input type for the generateDesign function.
 * - GenerateDesignOutput - The return type for the generateDesign function.
 */

import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from '@firebase/auth';
import {ai} from '@/ai/genkit';
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
  imageDataUri: z.string().describe("The generated image as a data URI. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type GenerateDesignOutput = z.infer<typeof GenerateDesignOutputSchema>;

export async function generateDesign(input: GenerateDesignInput): Promise<GenerateDesignOutput> {
  return generateDesignFlow(input);
}

const generateDesignFlow = ai.defineFlow(
  {
    name: 'generateDesignFlow',
    inputSchema: GenerateDesignInputSchema,
    outputSchema: GenerateDesignOutputSchema,
  },
  async (input) => {

    // Simulate authentication or get user ID from context/session
    // In a real application, you would get the user ID from the authenticated session
    // const userId = auth.currentUser?.uid || 'anonymous'; // Replace with actual user ID
    const userId = 'simulated-user-id'; // Using a placeholder for demonstration

    cleanUpOldRecords();

    const userDesignsInWindow = generatedDesigns.filter(record => record.userId === userId).length;

    if (userDesignsInWindow >= MAX_DESIGNS_PER_USER_PER_WINDOW) {
      throw new Error("Has alcanzado el límite de 3 diseños por IA en las últimas 24 horas. Si necesitas ayuda adicional con tu diseño, por favor contáctanos por WhatsApp.");
    }

    generatedDesigns.push({ timestamp: Date.now(), userId });

    let mediaUrl: string | undefined = undefined;
    let aiTextResponse: string | undefined = undefined;

    try {
      const {media, text} = await ai.generate({
        model: 'googleai/gemini-2.0-flash-exp', // MUST use this model for images
        prompt: input.prompt,
        config: {
          responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE
          safetySettings: [ // Adjust safety settings for more creative freedom
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        },
      });
      
      mediaUrl = media?.url;
      aiTextResponse = text;

      if (aiTextResponse) {
        console.log("AI Text response during image generation (server log):", aiTextResponse);
      }

      if (!mediaUrl) {
        let internalErrorMessage = 'Image generation failed: No media URL returned from AI.';
        if (aiTextResponse) {
          internalErrorMessage += ` AI Text (server log): "${aiTextResponse}"`;
        }
        console.error(internalErrorMessage); // For server logs

        // Construct a user-facing error message
        let userErrorMessage = 'La IA no pudo generar una imagen en este momento.';
        if (aiTextResponse && (aiTextResponse.toLowerCase().includes('block') || aiTextResponse.toLowerCase().includes('safety') || aiTextResponse.toLowerCase().includes('policy'))) {
            userErrorMessage = `Tu idea fue bloqueada por políticas de contenido de la IA. Intenta con otra descripción. (Detalle: ${aiTextResponse})`;
        } else if (aiTextResponse && aiTextResponse.trim() !== "" && aiTextResponse.trim().toLowerCase() !== "unknown") {
            // Try to provide a snippet of the AI's text response if it seems like an error/explanation
            const snippet = aiTextResponse.substring(0, 120);
            userErrorMessage = `La IA tuvo un problema: ${snippet}${aiTextResponse.length > 120 ? '...' : ''}`;
        }
        throw new Error(userErrorMessage);
      }

      return { imageDataUri: mediaUrl };

    } catch (flowError) {
      // Catch errors from ai.generate() or the explicit throw above.
      console.error("Error within generateDesignFlow (server log):", flowError);
      
      if (flowError instanceof Error) {
        // If the error message already seems user-friendly or is one we constructed, prefer it.
        // Otherwise, Next.js will likely obfuscate it in production anyway.
        // This specific message format helps distinguish it if not obfuscated.
        throw new Error(`Error en el flujo de IA: ${flowError.message}`);
      }
      // Fallback for non-Error objects thrown
      throw new Error('Ocurrió un error inesperado en el servidor durante la generación de la imagen por IA.');
    }
  }
);

