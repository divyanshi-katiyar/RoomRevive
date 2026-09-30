import { GoogleGenAI } from '@google/genai';
import axios from 'axios';

export interface GenerateImageOptions {
  sourceImage: string; // The uploaded room image (base64 Data URL or public image URL)
  prompt: string;      // The detailed Gemini redesign prompt
  roomType?: string;
  style?: string;
  colorTone?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9';
}

export interface ImageGenerationResult {
  success: boolean;
  generatedImage: string | null;
  imageUrl: string | null;
  provider: string;
  model: string;
  error?: string;
  details?: string;
}

export class ImageGenerationService {
  public readonly modelName = 'gemini-3.1-flash-image';

  private getClient(): GoogleGenAI {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  public get apiKey(): string | null {
    return process.env.GEMINI_API_KEY?.trim() || null;
  }

  public isConfigured(): boolean {
    return Boolean(this.apiKey);
  }

  public getProviderName(): string {
    return `Google Gemini (${this.modelName})`;
  }

  /**
   * Resolves raw base64 and standard MIME type from Data URL or remote image URL
   */
  private async resolveImageData(imageData: string): Promise<{ data: string; mimeType: string }> {
    if (!imageData) {
      throw new Error('Original room image is required.');
    }

    if (imageData.startsWith('data:')) {
      const match = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match && match.length === 3) {
        return { mimeType: match[1], data: match[2] };
      }
    }

    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      try {
        console.log(`[GeminiImageService] Downloading input image from URL: ${imageData.slice(0, 60)}...`);
        const res = await axios.get(imageData, {
          responseType: 'arraybuffer',
          timeout: 25000,
        });
        const rawType = res.headers['content-type'];
        const contentType = typeof rawType === 'string' ? rawType : 'image/jpeg';
        const mimeType = contentType.split(';')[0].trim();
        const base64 = Buffer.from(res.data).toString('base64');
        return { mimeType, data: base64 };
      } catch (err: any) {
        console.warn('[GeminiImageService] Could not fetch remote image URL:', err.message);
        throw new Error(`Failed to load source image from URL: ${err.message}`);
      }
    }

    return { mimeType: 'image/jpeg', data: imageData };
  }

  /**
   * Main image generation method utilizing Google Gemini `gemini-3.1-flash-image`
   */
  public async generateImage(options: GenerateImageOptions): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        generatedImage: null,
        imageUrl: null,
        provider: 'Google Gemini',
        model: this.modelName,
        error: 'GEMINI_API_KEY is not configured on the server. Please ensure your Gemini API key is configured.',
      };
    }

    if (!options.sourceImage) {
      return {
        success: false,
        generatedImage: null,
        imageUrl: null,
        provider: 'Google Gemini',
        model: this.modelName,
        error: 'Original room photo is required for image-to-image redesign.',
      };
    }

    try {
      const { data: cleanBase64, mimeType } = await this.resolveImageData(options.sourceImage);

      console.log('=======================================================');
      console.log(`[GeminiImageService] Generating redesign with ${this.modelName}`);
      console.log(`- Room Type: ${options.roomType || 'Unspecified'}`);
      console.log(`- Style: ${options.style || 'Unspecified'}`);
      console.log(`- Color Tone: ${options.colorTone || 'Unspecified'}`);
      console.log(`- Image Input MIME: ${mimeType}, Size: ${Math.round(cleanBase64.length / 1024)} KB`);
      console.log(`- Prompt Length: ${options.prompt.length} chars`);
      console.log('=======================================================');

      const ai = this.getClient();
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType,
              },
            },
            {
              text: options.prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: options.aspectRatio === '16:9' ? '16:9' : options.aspectRatio === '1:1' ? '1:1' : '4:3',
            imageSize: '1K',
          },
        },
      });

      // Find the generated image part
      const candidateParts = response.candidates?.[0]?.content?.parts || [];
      let generatedDataUrl: string | null = null;
      let textFeedback: string | null = null;

      for (const part of candidateParts) {
        if (part.inlineData && part.inlineData.data) {
          const outMime = part.inlineData.mimeType || 'image/jpeg';
          generatedDataUrl = `data:${outMime};base64,${part.inlineData.data}`;
          break;
        } else if (part.text) {
          textFeedback = part.text;
        }
      }

      if (!generatedDataUrl) {
        console.warn('[GeminiImageService] No inline image returned in candidate parts.', textFeedback);
        return {
          success: false,
          generatedImage: null,
          imageUrl: null,
          provider: 'Google Gemini',
          model: this.modelName,
          error: textFeedback
            ? `Gemini image response: ${textFeedback.slice(0, 200)}`
            : 'Gemini did not return an image part. Please try adjusting your prompt.',
        };
      }

      console.log(`[GeminiImageService] Successfully generated redesign with ${this.modelName}!`);
      return {
        success: true,
        generatedImage: generatedDataUrl,
        imageUrl: generatedDataUrl,
        provider: 'Google Gemini',
        model: this.modelName,
      };
    } catch (err: any) {
      console.warn('[GeminiImageService] Gemini image generation error:', err?.message || err);
      const rawMsg = err?.message || String(err);
      const status = err?.status || err?.response?.status;

      let userError = 'Gemini image generation encountered an error. Please try again.';

      if (status === 429 || rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED') || rawMsg.includes('quota')) {
        userError =
          'Gemini image-generation quota exceeded or billing not active. The gemini-3.1-flash-image model requires a paid Google Cloud project with billing enabled in AI Studio.';
      } else if (status === 403 || rawMsg.includes('403') || rawMsg.includes('PERMISSION_DENIED')) {
        userError =
          'Permission denied for gemini-3.1-flash-image. Please check your Gemini API key permissions in AI Studio.';
      } else if (status === 400 || rawMsg.includes('400') || rawMsg.includes('INVALID_ARGUMENT')) {
        userError = 'Invalid image or prompt argument submitted to Gemini. Please try with a standard JPG/PNG photo.';
      } else if (status === 503 || status === 500 || rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE')) {
        userError = 'Google Gemini image generation service is temporarily busy. Please try again in a few moments.';
      } else if (rawMsg) {
        userError = `Gemini generation error: ${rawMsg.slice(0, 200)}`;
      }

      return {
        success: false,
        generatedImage: null,
        imageUrl: null,
        provider: 'Google Gemini',
        model: this.modelName,
        error: userError,
        details: rawMsg,
      };
    }
  }
}

export const imageGenerationService = new ImageGenerationService();
