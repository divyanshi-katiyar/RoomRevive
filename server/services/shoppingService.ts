import { GoogleGenAI } from '@google/genai';

export interface DetectedShopItem {
  id: string;
  name: string;
  category: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';
  style: string;
  material: string;
  dominantColor: string;
  shape: string;
  description: string;
  importance: 'focal' | 'primary' | 'accent' | 'essential';
  searchQuery: string;
}

export interface ShopProduct {
  id: string;
  title: string;
  category: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';
  price: string;
  retailer: string;
  imageUrl: string;
  productUrl: string;
  sourceQuery: string;
  matchReason: string;
  detectedItemId?: string;
  specs?: {
    color?: string;
    material?: string;
    style?: string;
  };
  isSimilar: boolean;
}

export interface ShoppingProvider {
  name: string;
  isDemoData: boolean;
  note: string;
  search(query: string, item?: Partial<DetectedShopItem>): Promise<ShopProduct[]>;
}

// -----------------------------------------------------------------------------
// Curated Inspiration Catalog for Demonstration Provider
// High-resolution architectural furniture & decor photography from verified CDN
// -----------------------------------------------------------------------------
interface CatalogItem {
  id: string;
  keywords: string[];
  category: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories';
  title: string;
  price: string;
  retailer: string;
  style: string;
  material: string;
  color: string;
  imageUrl: string;
  matchNote: string;
}

const CURATED_CATALOG: CatalogItem[] = [
  // --- FURNITURE: SEATING & SOFAS ---
  {
    id: 'prod-sofa-1',
    keywords: ['sofa', 'couch', 'boucle', 'beige', 'contemporary', 'curved', 'cream', '3 seater'],
    category: 'Furniture',
    title: 'Curvilinear Bouclé 3-Seater Sofa',
    price: '$1,380',
    retailer: 'CB2 Inspired',
    style: 'Contemporary',
    material: 'Textured Bouclé Fabric',
    color: 'Warm Beige',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Matches the organic curved silhouette and warm neutral bouclé texture.',
  },
  {
    id: 'prod-sofa-2',
    keywords: ['sofa', 'sectional', 'scandinavian', 'minimalist', 'fabric', 'grey', 'modular'],
    category: 'Furniture',
    title: 'Nordic Modular Low-Profile Sectional',
    price: '$1,650',
    retailer: 'Nordic Living Inspired',
    style: 'Scandinavian',
    material: 'Linen Wool Blend',
    color: 'Muted Sand',
    imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Matches the clean horizontal proportions and tailored linen upholstery.',
  },
  {
    id: 'prod-chair-1',
    keywords: ['chair', 'armchair', 'accent chair', 'lounge chair', 'oak', 'boucle', 'wood'],
    category: 'Furniture',
    title: 'Solid White Oak Sculptural Accent Chair',
    price: '$540',
    retailer: 'West Elm Inspired',
    style: 'Japandi',
    material: 'Solid Oak & Tactile Weave',
    color: 'Natural Wood & Oatmeal',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Complements the natural timber grain and gentle curved backrest.',
  },
  {
    id: 'prod-chair-2',
    keywords: ['office chair', 'desk chair', 'task chair', 'ergonomic', 'workspace', 'study'],
    category: 'Furniture',
    title: 'Ergonomic Executive Mesh & Aluminum Task Chair',
    price: '$420',
    retailer: 'Herman Miller Style',
    style: 'Modern Executive',
    material: 'Breathable Polymer & Matte Black Steel',
    color: 'Matte Graphite',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c3a821a58875?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Designed to match functional workspace ergonomics and low-profile modern contours.',
  },

  // --- FURNITURE: TABLES & DESKS ---
  {
    id: 'prod-coffee-1',
    keywords: ['coffee table', 'table', 'round', 'oak', 'wood', 'plinth', 'low table'],
    category: 'Furniture',
    title: 'Round Fluted White Oak Coffee Table',
    price: '$490',
    retailer: 'Crate & Barrel Inspired',
    style: 'Scandinavian Minimalist',
    material: 'FSC Solid White Oak',
    color: 'Light Natural Oak',
    imageUrl: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Replicates the low-profile circular silhouette and subtle fluted wood base.',
  },
  {
    id: 'prod-coffee-2',
    keywords: ['coffee table', 'travertine', 'stone', 'marble', 'slab', 'plinth', 'monolith'],
    category: 'Furniture',
    title: 'Monolithic Honed Travertine Plinth Table',
    price: '$790',
    retailer: 'Design Within Reach Inspired',
    style: 'Modern Minimalist',
    material: 'Natural Honed Travertine Stone',
    color: 'Warm Ivory Stone',
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Matches the organic stone veining and monolithic low-profile plinth style.',
  },
  {
    id: 'prod-desk-1',
    keywords: ['desk', 'study desk', 'work desk', 'writing desk', 'workspace', 'laptop table', 'wood desk'],
    category: 'Furniture',
    title: 'Minimalist Solid Timber Floating Workstation Desk',
    price: '$680',
    retailer: 'Muuto Inspired',
    style: 'Japandi',
    material: 'Solid Oak & Cable Chamber',
    color: 'Natural White Oak',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Captures the minimalist workspace footprint with concealed wire pathways.',
  },
  {
    id: 'prod-dining-1',
    keywords: ['dining table', 'dining', 'table', 'round dining', 'wood table'],
    category: 'Furniture',
    title: 'Pedestal Round Oak Dining Table',
    price: '$920',
    retailer: 'Pottery Barn Inspired',
    style: 'Contemporary',
    material: 'Solid Oak Timber',
    color: 'Natural Dune',
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Features a central fluted pedestal that mirrors the dining room architecture.',
  },
  {
    id: 'prod-side-1',
    keywords: ['side table', 'end table', 'nightstand', 'bedside', 'small table'],
    category: 'Furniture',
    title: 'Cylindrical Ribbed Bedside & Accent Table',
    price: '$210',
    retailer: 'Zara Home Inspired',
    style: 'Contemporary',
    material: 'Ceramic & Ash Wood Top',
    color: 'Soft Alabaster',
    imageUrl: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Ideal compact footprint matching the bedside or sofa flank placement.',
  },

  // --- LIGHTING: LAMPS & PENDANTS ---
  {
    id: 'prod-light-floor-1',
    keywords: ['floor lamp', 'lamp', 'black lamp', 'standing lamp', 'arc lamp', 'lighting'],
    category: 'Lighting',
    title: 'Minimalist Matte Black Arc Floor Lamp',
    price: '$260',
    retailer: 'Artemide Style',
    style: 'Modern Minimalist',
    material: 'Powder-Coated Steel & Frosted Glass',
    color: 'Matte Charcoal Black',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Matches the graceful slender arch and gentle ambient downlighting.',
  },
  {
    id: 'prod-light-table-1',
    keywords: ['table lamp', 'desk lamp', 'ceramic lamp', 'mushroom lamp', 'ambient lamp'],
    category: 'Lighting',
    title: 'Sculptural Ceramic Dome Table Lamp',
    price: '$145',
    retailer: 'Menu Inspired',
    style: 'Japandi',
    material: 'Matte Textured Ceramic',
    color: 'Warm Sand',
    imageUrl: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Emits a soft 2700K downward glow reflecting off side consoles or desks.',
  },
  {
    id: 'prod-light-pendant-1',
    keywords: ['pendant', 'chandelier', 'ceiling light', 'paper lantern', 'hanging lamp'],
    category: 'Lighting',
    title: 'Wabi-Sabi Paper Lantern Sphere Pendant',
    price: '$180',
    retailer: 'Noguchi Akari Style',
    style: 'Japandi / Organic Modern',
    material: 'Mulberry Washi Paper & Bamboo Ribbing',
    color: 'Warm Ivory',
    imageUrl: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Diffuses soft warm light across the center of the redesigned room.',
  },

  // --- TEXTILES: RUGS, CURTAINS & THROWS ---
  {
    id: 'prod-rug-1',
    keywords: ['rug', 'area rug', 'geometric rug', 'wool rug', 'carpet', 'neutral rug', 'berber'],
    category: 'Textiles',
    title: 'Hand-Tufted Moroccan High-Pile Wool Area Rug (8x10)',
    price: '$460',
    retailer: 'Ruggable Inspired',
    style: 'Transitional Modern',
    material: '100% Organic New Zealand Wool',
    color: 'Ivory Cream & Charcoal Accent',
    imageUrl: 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Provides acoustic softness and grounds the central seating grouping.',
  },
  {
    id: 'prod-rug-2',
    keywords: ['flatweave rug', 'jute rug', 'natural rug', 'earthy rug'],
    category: 'Textiles',
    title: 'Organic Flatweave Jute & Chenille Rug',
    price: '$280',
    retailer: 'Nordic Weave Style',
    style: 'Scandi Boho',
    material: 'Spun Natural Jute & Soft Cotton',
    color: 'Warm Oatmeal',
    imageUrl: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Matches the organic floor texture and earthy neutral palette.',
  },
  {
    id: 'prod-curtain-1',
    keywords: ['curtains', 'drapery', 'sheer curtains', 'window treatment', 'linen curtains'],
    category: 'Textiles',
    title: 'Belgian Washed Linen Floor-to-Ceiling Drapery Panels',
    price: '$135 pair',
    retailer: 'Restoration Hardware Inspired',
    style: 'Luxury Minimalist',
    material: '100% Pure Washed Linen',
    color: 'Bleached Chalk',
    imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Diffuses natural window daylight while preserving clean vertical sightlines.',
  },
  {
    id: 'prod-cushions-1',
    keywords: ['cushions', 'pillows', 'throw pillows', 'accent cushions', 'textile'],
    category: 'Textiles',
    title: 'Textured Bouclé & Slub Cotton Throw Pillow Duo',
    price: '$65 pair',
    retailer: 'H&M Home Style',
    style: 'Modern Organic',
    material: 'Cotton Slub & Wool Bouclé',
    color: 'Terracotta & Taupe',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Adds textural tactile interest to the sofa or accent chair.',
  },

  // --- DECOR & ACCESSORIES: ART, MIRRORS, PLANTS & VASES ---
  {
    id: 'prod-art-1',
    keywords: ['wall art', 'art', 'abstract art', 'painting', 'framed art', 'canvas'],
    category: 'Decor',
    title: 'Framed Minimalist Abstract Architectural Canvas (36x48)',
    price: '$220',
    retailer: 'Minted Inspired',
    style: 'Contemporary Minimalist',
    material: 'Textured Giclée on Canvas with Oak Frame',
    color: 'Warm Beige, Charcoal & Ochre',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Mirrors the focal artwork above the lounge or credenza.',
  },
  {
    id: 'prod-mirror-1',
    keywords: ['mirror', 'wall mirror', 'round mirror', 'arched mirror', 'accent mirror'],
    category: 'Decor',
    title: 'Oversized Curved Brass Wall Accent Mirror',
    price: '$290',
    retailer: 'CB2 Inspired',
    style: 'Modern Luxury',
    material: 'Brushed Brass Finished Iron & Beveled Glass',
    color: 'Antique Brass',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Reflects daylight into the room to amplify perceived spatial depth.',
  },
  {
    id: 'prod-plant-1',
    keywords: ['plant', 'plants', 'ficus', 'olive tree', 'planter', 'greenery', 'biophilic'],
    category: 'Accessories',
    title: 'Potted Mediterranean Faux Olive Tree in Fluted Stone Basin',
    price: '$180',
    retailer: 'Terrain Inspired',
    style: 'Organic Modern',
    material: 'Real-Touch Silk Foliage & Honed Concrete Pot',
    color: 'Olive Green & Fossil Grey',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Introduces the organic biophilic greenery shown near the window or corner.',
  },
  {
    id: 'prod-vase-1',
    keywords: ['vase', 'ceramics', 'decorative object', 'bowl', 'pottery', 'accessories'],
    category: 'Accessories',
    title: 'Handmade Matte Ceramic Sculptural Vessels (Set of 2)',
    price: '$75 set',
    retailer: 'Ferm Living Inspired',
    style: 'Japandi Craft',
    material: 'Unglazed Earthenware Ceramic',
    color: 'Raw Terracotta & Stone White',
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
    matchNote: 'Provides tactile shelf and coffee table styling accents.',
  },
];

// Helper to generate legitimate Google Shopping search URL
function buildGoogleShoppingUrl(query: string): string {
  const encoded = encodeURIComponent(query.trim());
  return `https://www.google.com/search?tbm=shop&q=${encoded}`;
}

/**
 * Demo provider that uses semantic matching on our curated design catalog.
 * Note: Clearly labeled as Demo Provider; points users and engineers to
 * exactly where a real shopping integration (e.g. SerpApi, Google Shopping)
 * is hooked up.
 */
export class CuratedCatalogShoppingProvider implements ShoppingProvider {
  name = 'RoomRevive Curated Inspiration Catalog';
  isDemoData = true;
  note =
    'Demo shopping catalog active. To connect live shopping providers such as SerpApi or Google Shopping API, set SERPAPI_API_KEY in the environment.';

  async search(query: string, item?: Partial<DetectedShopItem>): Promise<ShopProduct[]> {
    const rawTokens = (query || '')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 2);

    const targetCategory = item?.category;
    const targetStyle = item?.style?.toLowerCase();

    // Score catalog items by keyword overlap, category, and style
    const scored = CURATED_CATALOG.map((prod) => {
      let score = 0;

      // Category match boost
      if (targetCategory && prod.category.toLowerCase() === targetCategory.toLowerCase()) {
        score += 5;
      }

      // Keyword token matches
      for (const token of rawTokens) {
        if (prod.keywords.some((k) => k.includes(token) || token.includes(k))) {
          score += 3;
        }
        if (prod.title.toLowerCase().includes(token)) {
          score += 2;
        }
        if (prod.material.toLowerCase().includes(token)) {
          score += 2;
        }
        if (prod.color.toLowerCase().includes(token)) {
          score += 2;
        }
      }

      // Style match bonus
      if (targetStyle && prod.style.toLowerCase().includes(targetStyle)) {
        score += 2;
      }

      return { prod, score };
    });

    // Sort by descending score
    scored.sort((a, b) => b.score - a.score);

    // Filter to positive matches or fall back to high-ranked items
    const matches = scored.filter((s) => s.score > 1).slice(0, 4);
    const finalSelection = matches.length > 0 ? matches.map((m) => m.prod) : CURATED_CATALOG.slice(0, 4);

    return finalSelection.map((c) => ({
      id: `${c.id}-${Date.now().toString(36)}`,
      title: c.title,
      category: c.category,
      price: c.price,
      retailer: c.retailer,
      imageUrl: c.imageUrl,
      productUrl: buildGoogleShoppingUrl(query || c.title),
      sourceQuery: query,
      matchReason: c.matchNote,
      detectedItemId: item?.id,
      specs: {
        color: c.color,
        material: c.material,
        style: c.style,
      },
      isSimilar: true,
    }));
  }
}

/**
 * Optional Live Shopping Provider: If an external shopping search API is configured
 * (e.g. SerpApi Google Shopping engine or custom proxy), this provider will query it.
 */
export class LiveGoogleShoppingProvider implements ShoppingProvider {
  name = 'Google Shopping (Live Provider)';
  isDemoData = false;
  note = 'Live Google Shopping results retrieved via API.';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async search(query: string, item?: Partial<DetectedShopItem>): Promise<ShopProduct[]> {
    try {
      console.log(`[ShoppingService] Querying Live Shopping API for: "${query}"...`);
      // Standard SerpApi Google Shopping engine endpoint
      const url = new URL('https://serpapi.com/search.json');
      url.searchParams.set('engine', 'google_shopping');
      url.searchParams.set('q', query);
      url.searchParams.set('api_key', this.apiKey);
      url.searchParams.set('num', '6');

      const res = await fetch(url.toString());
      if (!res.ok) {
        throw new Error(`Shopping API response error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const shoppingResults = data.shopping_results || [];

      if (!Array.isArray(shoppingResults) || shoppingResults.length === 0) {
        console.warn('[ShoppingService] Live shopping API returned no items; falling back to curated matches.');
        const fallbackProvider = new CuratedCatalogShoppingProvider();
        return await fallbackProvider.search(query, item);
      }

      return shoppingResults.slice(0, 4).map((p: any, idx: number) => ({
        id: `live-${p.product_id || idx}-${Date.now()}`,
        title: p.title || 'Similar Product',
        category: item?.category || 'Furniture',
        price: p.price || p.extracted_price ? `${p.price || '$' + p.extracted_price}` : 'Price on request',
        retailer: p.source || 'Online Retailer',
        imageUrl: p.thumbnail || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        productUrl: p.link || buildGoogleShoppingUrl(query),
        sourceQuery: query,
        matchReason: `Matches visual characteristics: ${item?.dominantColor || ''} ${item?.material || ''} ${item?.style || ''}`.trim(),
        detectedItemId: item?.id,
        specs: {
          color: item?.dominantColor,
          material: item?.material,
          style: item?.style,
        },
        isSimilar: true,
      }));
    } catch (err: any) {
      console.error('[ShoppingService] Live Shopping API call failed:', err?.message || err);
      // Seamlessly fall back to curated catalog
      const fallbackProvider = new CuratedCatalogShoppingProvider();
      return await fallbackProvider.search(query, item);
    }
  }
}

// -----------------------------------------------------------------------------
// Core Shopping Service
// -----------------------------------------------------------------------------
export class ShoppingService {
  private ai: GoogleGenAI;
  private provider: ShoppingProvider;
  private textModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || '';
    this.ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    // Check if live shopping provider key is available in environment
    const serpApiKey = process.env.SERPAPI_API_KEY || process.env.GOOGLE_SHOPPING_API_KEY;
    if (serpApiKey) {
      console.log('[ShoppingService] Initializing with Live Shopping Provider.');
      this.provider = new LiveGoogleShoppingProvider(serpApiKey);
    } else {
      console.log('[ShoppingService] Initializing with Curated Inspiration Catalog Provider.');
      this.provider = new CuratedCatalogShoppingProvider();
    }
  }

  getProviderInfo() {
    return {
      providerName: this.provider.name,
      isDemoData: this.provider.isDemoData,
      note: this.provider.note,
    };
  }

  private async resolveImageData(imageData: string): Promise<{ cleanData: string; mimeType: string }> {
    if (!imageData) {
      throw new Error('Image data is required.');
    }
    if (imageData.startsWith('data:')) {
      const matches = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return { mimeType: matches[1], cleanData: matches[2] };
      }
    }
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      const response = await fetch(imageData);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${imageData} (${response.status})`);
      }
      const contentType = response.headers.get('content-type') || 'image/jpeg';
      const mimeType = contentType.split(';')[0].trim();
      const arrayBuffer = await response.arrayBuffer();
      const cleanData = Buffer.from(arrayBuffer).toString('base64');
      return { mimeType, cleanData };
    }
    return { mimeType: 'image/jpeg', cleanData: imageData };
  }

  private parseJsonFromText<T>(text: string, fallback: T): T {
    if (!text) return fallback;
    try {
      return JSON.parse(text.trim());
    } catch {
      const clean = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      try {
        return JSON.parse(clean);
      } catch {
        const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(match[0]);
          } catch {
            // fallback
          }
        }
      }
    }
    return fallback;
  }

  /**
   * Analyzes an AI-generated room image using Gemini Vision to detect visible furniture and decor items
   */
  async analyzeGeneratedRoomImage(
    imageData: string,
    context?: { roomType?: string; style?: string }
  ): Promise<{ items: DetectedShopItem[]; categories: string[] }> {
    const { cleanData, mimeType } = await this.resolveImageData(imageData);

    const prompt = `You are an expert interior design product identifier and visual merchandising analyst.
Examine this AI-generated room design photograph with precision.
Identify the major visible furniture, lighting, textiles, wall art, and decor items in this room.

Focus on identifiable pieces such as:
- Seating: Sofa, Couch, Sectional, Accent chair, Lounge chair, Office chair, Dining chairs, Pouf
- Tables & Surfaces: Coffee table, Side table, Dining table, Study desk, Workstation, Console table, Nightstand
- Storage & Architecture: Credenza, TV unit, Bookshelf, Floating shelves, Wardrobe
- Lighting: Floor lamp, Table lamp, Pendant light, Chandelier, Wall sconce
- Textiles: Area rug, Floor-to-ceiling curtains, Throw pillows, Bedding, Wool throw
- Wall Art & Mirrors: Framed canvas, Round mirror, Arched mirror, Gallery frame
- Decor & Accessories: Indoor potted plant (olive tree, ficus, monstera), Sculptural ceramic vase, Decorative bowl

CRITICAL INSTRUCTIONS:
1. Do NOT claim exact brand names or exact commercial products from the generated image unless explicitly visible. The generated room is an inspiration image.
2. For each item determine:
   - name: clear descriptive name (e.g. "Modern 3-seater sofa", "Round fluted oak coffee table", "Textured wool area rug")
   - category: must be EXACTLY ONE of: "Furniture", "Lighting", "Decor", "Textiles", "Accessories"
   - style: approximate style (e.g., "Contemporary", "Japandi", "Scandinavian", "Minimalist", "Mid-Century Modern", "Industrial")
   - material: visible materials (e.g. "Bouclé fabric", "Solid white oak", "Brushed brass", "Honed travertine", "Hand-tufted wool", "Washed linen")
   - dominantColor: dominant visible color (e.g. "Warm Beige", "Light Oak", "Charcoal Black", "Ivory Cream", "Muted Sage")
   - shape: approximate shape/type (e.g. "Curved 3-seater", "Round low plinth", "8x10 rectangular", "Slender arch")
   - description: visual characteristics (e.g. "Beige fabric 3-seater sofa with clean modern lines and low profile")
   - importance: "focal" | "primary" | "accent" | "essential"
   - searchQuery: a high-utility, natural shopping search query describing the visual characteristics (e.g. "beige contemporary 3 seater fabric sofa", "round oak wood coffee table modern", "neutral geometric area rug", "black modern floor lamp").
3. Identify between 4 and 8 major visible pieces so the customer has a complete look to shop.
4. Ensure variety across categories (e.g. at least 1-2 Furniture pieces, 1 Lighting piece, 1 Textile piece, 1 Decor/Accessory piece).

Return ONLY valid JSON matching this schema:
{
  "items": [
    {
      "name": "Modern 3-seater sofa",
      "category": "Furniture",
      "style": "Contemporary",
      "material": "Bouclé fabric",
      "dominantColor": "Beige",
      "shape": "Curvilinear 3-seater",
      "description": "Beige fabric 3-seater sofa with clean modern lines and organic curve",
      "importance": "focal",
      "searchQuery": "beige contemporary 3 seater fabric sofa"
    }
  ]
}`;

    const fallbackItems: DetectedShopItem[] = [
      {
        id: 'item-1',
        name: `${context?.style || 'Contemporary'} Lounge Sofa`,
        category: 'Furniture',
        style: context?.style || 'Contemporary',
        material: 'Linen Bouclé Fabric',
        dominantColor: 'Warm Beige',
        shape: 'Low-profile Sectional',
        description: 'Neutral low-profile seating with tactile woven upholstery and clean lines.',
        importance: 'focal',
        searchQuery: `neutral ${context?.style?.toLowerCase() || 'modern'} low profile fabric sofa`,
      },
      {
        id: 'item-2',
        name: 'Round Fluted Oak Coffee Table',
        category: 'Furniture',
        style: context?.style || 'Scandinavian',
        material: 'Solid White Oak',
        dominantColor: 'Light Natural Oak',
        shape: 'Round Low Plinth',
        description: 'Low-profile circular timber table with subtle vertical fluting.',
        importance: 'primary',
        searchQuery: 'round oak wood coffee table modern',
      },
      {
        id: 'item-3',
        name: 'Minimalist Matte Arc Floor Lamp',
        category: 'Lighting',
        style: 'Modern Minimalist',
        material: 'Matte Steel & Frosted Glass',
        dominantColor: 'Matte Charcoal Black',
        shape: 'Slender Arc',
        description: 'Tall curving metallic floor lamp with downward diffuse ambient glow.',
        importance: 'accent',
        searchQuery: 'black modern arc floor lamp',
      },
      {
        id: 'item-4',
        name: 'Textured Geometric Wool Area Rug',
        category: 'Textiles',
        style: 'Transitional',
        material: 'Hand-Tufted Wool',
        dominantColor: 'Ivory Cream',
        shape: '8x10 Rectangular',
        description: 'Subtle high-low pile neutral rug with understated organic geometry.',
        importance: 'primary',
        searchQuery: 'neutral geometric area rug 8x10',
      },
      {
        id: 'item-5',
        name: 'Handcrafted Sculptural Ceramic Vessels',
        category: 'Decor',
        style: 'Japandi',
        material: 'Earthenware Ceramic',
        dominantColor: 'Warm Sand',
        shape: 'Organic Sculptural',
        description: 'Artisan ceramic vessels with matte mineral wash texture.',
        importance: 'accent',
        searchQuery: 'wabi sabi ceramic vase set neutral',
      },
    ];

    let detected: any[] = [];

    for (const model of this.textModels) {
      try {
        console.log(`[ShoppingService] Analyzing generated room image with model: ${model}...`);
        const response = await this.ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanData,
                },
              },
              { text: prompt },
            ],
          },
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text || '';
        const parsed = this.parseJsonFromText<any>(text, null);
        if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
          detected = parsed.items;
          break;
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          detected = parsed;
          break;
        }
      } catch (err: any) {
        console.warn(`[ShoppingService] Model ${model} analysis warning:`, err?.message || err);
      }
    }

    if (!detected || detected.length === 0) {
      detected = fallbackItems;
    }

    // Sanitize and validate items
    const validCategories = ['Furniture', 'Lighting', 'Decor', 'Textiles', 'Accessories'] as const;

    const items: DetectedShopItem[] = detected.map((it: any, index: number) => {
      // Map category
      let cat: 'Furniture' | 'Lighting' | 'Decor' | 'Textiles' | 'Accessories' = 'Furniture';
      const rawCat = String(it.category || '').toLowerCase();
      if (rawCat.includes('light') || rawCat.includes('lamp')) cat = 'Lighting';
      else if (rawCat.includes('text') || rawCat.includes('rug') || rawCat.includes('curtain') || rawCat.includes('pillow')) cat = 'Textiles';
      else if (rawCat.includes('art') || rawCat.includes('mirror') || rawCat.includes('decor')) cat = 'Decor';
      else if (rawCat.includes('plant') || rawCat.includes('vase') || rawCat.includes('access')) cat = 'Accessories';
      else if (validCategories.includes(it.category)) cat = it.category;

      const name = String(it.name || `Design Item ${index + 1}`).trim();
      const style = String(it.style || context?.style || 'Contemporary').trim();
      const material = String(it.material || 'Natural Materials').trim();
      const dominantColor = String(it.dominantColor || it.color || 'Neutral').trim();
      const shape = String(it.shape || 'Standard').trim();
      const description = String(it.description || `${dominantColor} ${material} ${name}`).trim();
      const importance = ['focal', 'primary', 'accent', 'essential'].includes(it.importance)
        ? it.importance
        : 'primary';

      // Ensure search query describes visual characteristics without claiming exact brand
      let searchQuery = String(it.searchQuery || '').trim();
      if (!searchQuery || searchQuery.length < 5) {
        searchQuery = `${dominantColor.toLowerCase()} ${style.toLowerCase()} ${material.toLowerCase()} ${name.toLowerCase()}`
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, ' ')
          .trim();
      }

      return {
        id: `detected-${index + 1}-${Date.now().toString(36)}`,
        name,
        category: cat,
        style,
        material,
        dominantColor,
        shape,
        description,
        importance,
        searchQuery,
      };
    });

    const categories = Array.from(new Set(items.map((i) => i.category)));

    return { items, categories };
  }

  /**
   * Search for products matching a detected item or search query
   */
  async searchProducts(
    query: string,
    item?: Partial<DetectedShopItem>,
    category?: string
  ): Promise<{ products: ShopProduct[]; provider: string; isDemoData: boolean; note: string }> {
    const products = await this.provider.search(query, item);
    return {
      products,
      provider: this.provider.name,
      isDemoData: this.provider.isDemoData,
      note: this.provider.note,
    };
  }

  /**
   * Complete Shop This Look analysis: identifies items and finds similar products in one step
   */
  async getCompleteShopLook(
    imageData: string,
    context?: { roomType?: string; style?: string }
  ): Promise<{
    items: DetectedShopItem[];
    products: ShopProduct[];
    categories: string[];
    provider: string;
    isDemoData: boolean;
    note: string;
  }> {
    const { items, categories } = await this.analyzeGeneratedRoomImage(imageData, context);

    // For each detected item, find similar products
    const productPromises = items.map((item) =>
      this.provider.search(item.searchQuery, item)
    );
    const productGroups = await Promise.all(productPromises);
    const allProducts = productGroups.flat();

    // Deduplicate products by title
    const seen = new Set<string>();
    const uniqueProducts: ShopProduct[] = [];
    for (const p of allProducts) {
      if (!seen.has(p.title.toLowerCase())) {
        seen.add(p.title.toLowerCase());
        uniqueProducts.push(p);
      }
    }

    return {
      items,
      products: uniqueProducts,
      categories,
      provider: this.provider.name,
      isDemoData: this.provider.isDemoData,
      note: this.provider.note,
    };
  }
}

export const shoppingService = new ShoppingService();
