'use server';
/**
 * @fileOverview A Genkit flow for generating images based on a text prompt.
 *
 * - generateDesign - Generates an image from a prompt using Gemini 2.0 Flash experimental.
 * - GenerateDesignInput - The input type for the generateDesign function.
 * - GenerateDesignOutput - The return type for the generateDesign function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

    if (!media || !media.url) {
      console.error('Image generation failed or did not return a media URL. AI Text response:', text);
      throw new Error('La generación de la imagen falló. No se recibió URL de la imagen.');
    }
    
    // Log any text response, it might contain useful info or error messages from the model
    if (text) {
        console.log("AI Text response during image generation:", text);
    }

    return { imageDataUri: media.url };
  }
);
