import { Request, Response, NextFunction } from 'express';
import { designService } from '../services/designService.js';

export const analyzeRoomController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required' });
    }
    const result = await designService.analyzeRoom(image);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const generateDesignController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      originalImage,
      roomAnalysis,
      room,
      style,
      colorTone,
      colorMood,
      customColor,
      lighting,
      furniturePreference,
      budget,
      userInstructions,
      saveToStudio,
    } = req.body;

    if (!originalImage) {
      return res.status(400).json({ error: 'Original image is required' });
    }

    const result = await designService.generateDesign({
      originalImage,
      roomAnalysis,
      room,
      style: style || 'Modern',
      colorTone: colorTone || colorMood || 'Warm',
      colorMood: colorMood || colorTone || 'Warm',
      customColor,
      lighting: lighting || 'Warm',
      furniturePreference: furniturePreference || 'Keep existing',
      budget: budget || 'Moderate',
      userInstructions,
      saveToStudio: saveToStudio ?? true,
    });

    res.json(result);
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    console.error('[DesignController] AI image generation failed:', rawMsg);
    const userMessage =
      rawMsg && !rawMsg.includes('{') && rawMsg.length < 200
        ? rawMsg
        : 'AI image generation is currently unavailable. Please try again.';
    res.status(500).json({
      generationSuccess: false,
      generatedImage: null,
      error: userMessage,
      details: rawMsg,
    });
  }
};

export const refineDesignController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, currentImage, originalImage, refinementPrompt, currentStyle } = req.body;
    if (!currentImage || !refinementPrompt) {
      return res.status(400).json({ error: 'currentImage and refinementPrompt are required' });
    }
    const result = await designService.refineDesign({
      projectId,
      currentImage,
      originalImage,
      refinementPrompt,
      currentStyle,
    });
    res.json(result);
  } catch (err: any) {
    const rawMsg = err?.message || String(err);
    console.error('[DesignController] AI refine design failed:', rawMsg);
    const userMessage =
      rawMsg && !rawMsg.includes('{') && rawMsg.length < 200
        ? rawMsg
        : 'AI image generation is currently unavailable. Please try again.';
    res.status(500).json({
      generationSuccess: false,
      generatedImage: null,
      error: userMessage,
      details: rawMsg,
    });
  }
};
