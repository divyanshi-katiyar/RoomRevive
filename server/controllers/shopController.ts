import { Request, Response, NextFunction } from 'express';
import { shoppingService } from '../services/shoppingService.js';

export const analyzeShopLookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, roomType, style } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required for Shop This Look analysis.' });
    }

    const result = await shoppingService.analyzeGeneratedRoomImage(image, { roomType, style });
    res.json({
      success: true,
      items: result.items,
      categories: result.categories,
      providerInfo: shoppingService.getProviderInfo(),
    });
  } catch (err: any) {
    console.error('[ShopController] Analyze error:', err?.message || err);
    next(err);
  }
};

export const searchProductsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, item, category } = req.body;
    if (!query && !item?.name) {
      return res.status(400).json({ error: 'Search query or item specification is required.' });
    }

    const searchQuery = query || item?.searchQuery || `${item?.dominantColor || ''} ${item?.style || ''} ${item?.name || ''}`.trim();
    const result = await shoppingService.searchProducts(searchQuery, item, category);

    res.json({
      success: true,
      query: searchQuery,
      products: result.products,
      provider: result.provider,
      isDemoData: result.isDemoData,
      note: result.note,
    });
  } catch (err: any) {
    console.error('[ShopController] Search error:', err?.message || err);
    next(err);
  }
};

export const getShopLookController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { image, roomType, style } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Image data is required for Shop This Look.' });
    }

    const result = await shoppingService.getCompleteShopLook(image, { roomType, style });
    res.json({
      success: true,
      items: result.items,
      products: result.products,
      categories: result.categories,
      provider: result.provider,
      isDemoData: result.isDemoData,
      note: result.note,
    });
  } catch (err: any) {
    console.error('[ShopController] Complete look error:', err?.message || err);
    next(err);
  }
};

export const getProviderInfoController = async (req: Request, res: Response) => {
  res.json({
    success: true,
    ...shoppingService.getProviderInfo(),
    instructions:
      'To connect a live shopping API (e.g. SerpApi Google Shopping engine or custom product API), set SERPAPI_API_KEY in your server environment variables.',
  });
};
