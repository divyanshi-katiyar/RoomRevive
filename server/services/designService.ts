import { geminiService, RoomAnalysisResult } from './geminiService.js';
import { imageGenerationService } from './imageGenerationService.js';
import { projectRepository, ProjectItem } from '../repositories/projectRepository.js';

export interface GenerateDesignInput {
  originalImage: string;
  roomAnalysis?: RoomAnalysisResult;
  room?: string;
  style: string;
  colorMood: string;
  customColor?: string;
  lighting: string;
  furniturePreference: string;
  budget: string;
  userInstructions?: string;
  saveToStudio?: boolean;
}

/**
 * Detailed style characteristic specifications matching the required style definitions:
 * - MUST USE: Dominant visual cues, materials, colors, silhouettes
 * - MUST AVOID: Elements that ruin or dilute the style
 */
export function getStyleCharacteristics(style: string): { use: string; avoid: string } {
  const norm = (style || '').toUpperCase().trim();

  if (norm.includes('SCANDINAVIAN')) {
    return {
      use: `The result MUST visibly and unmistakably look Scandinavian:
- Bright, airy, and light-filled atmosphere with soft natural daylight
- White, cream, and very light grey base wall and surface colors
- Light natural oak, birch, or ash wood with visible natural grain
- Simple clean-lined, functional Nordic furniture silhouettes
- Soft textiles (light wool, washed linen, subtle knitted throws)
- Cozy but minimal decor (hygge accents, curated ceramics)
- Natural materials and subtle indoor green plants
- Warm but light neutral palette with an uncluttered, serene arrangement`,
      avoid: `dark charcoal or black walls, predominantly black furniture, heavy dramatic interiors, excessive ornamentation, ornate traditional furniture, industrial metal-heavy appearance, excessive luxury gold styling, overly dark or moody lighting`
    };
  }

  if (norm.includes('JAPANDI')) {
    return {
      use: `The result MUST visibly look Japandi (Japanese minimalism meets Scandinavian warmth):
- Natural light timber (white oak, hinoki, pale ash)
- Warm neutral palette of beige, cream, oatmeal, and earthy neutrals
- Low-profile, clean-lined, unpretentious furniture
- Organic materials (linen, paper lanterns, tactile clay ceramics, light bamboo)
- Calm, uncluttered, balanced composition with negative space
- Subtle Japanese wabi-sabi craft and Scandinavian functionality
- Warm, gentle natural illumination`,
      avoid: `excessive decoration, flashy or saturated colors, ornate furniture, heavy industrial piping, shiny polished metals, cluttered surfaces`
    };
  }

  if (norm.includes('TRADITIONAL')) {
    return {
      use: `The result MUST visibly look Traditional:
- Rich natural wood (walnut, mahogany, warm cherry, dark oak)
- Classic furniture silhouettes with refined proportion
- Detailed architectural woodwork, crown moldings, and wainscoting
- Elegant tailored upholstery with classic traditional patterns or damask
- High-quality patterned or Oriental/Persian area rugs
- Symmetrical, balanced room composition
- Warm, sophisticated ambient lighting (brass fixtures, classic fabric shades)
- Classic decorative details (curated oil paintings in gilt frames, porcelain, brass hardware)`,
      avoid: `ultra-minimalist furniture, cold industrial styling, exposed concrete/ducts, overly futuristic furniture, plastic or acrylic finishes`
    };
  }

  if (norm.includes('BOHEMIAN') || norm.includes('BOHO')) {
    return {
      use: `The result MUST visibly look Bohemian:
- Richly layered textiles, textured cushions, and soft fringed throws
- Patterned vintage/tribal/Moroccan rugs layered over natural flooring
- Natural woven and rattan furniture (cane, wicker, rattan lounge chairs)
- Abundant lush indoor botanical plants (hanging pothos, fiddle leaf, monsteras)
- Macramé, woven wall tapestries, and artisanal handmade decor
- Eclectic, lived-in, curated furniture with artistic warmth
- Earthy warm colors (terracotta, ochre, warm sand, olive, rust)
- Layered, deeply cozy, inviting appearance`,
      avoid: `sterile minimalist appearance, cold monochromatic corporate interiors, rigid strict symmetry, high-tech industrial coldness`
    };
  }

  if (norm.includes('INDUSTRIAL')) {
    return {
      use: `The result MUST visibly look Industrial:
- Dark metal frameworks (blackened steel, cast iron, gunmetal)
- Warm raw wood and metal combination (reclaimed timber tabletops, iron legs)
- Architectural concrete or distressed brick wall textures where appropriate
- Black, charcoal, slate, and weathered bronze accents
- Factory-inspired industrial lighting (Edison pendants, articulated metal lamps)
- Raw, authentic, tactile materials (distressed leather, riveted iron, wire glass)
- Utilitarian, practical, robust furniture silhouettes`,
      avoid: `ornate traditional furniture, overly soft pastel colors, delicate feminine decor, glossy synthetic finishes, floral patterns`
    };
  }

  if (norm.includes('MINIMALIST') || norm.includes('MINIMAL')) {
    return {
      use: `The result MUST visibly look Minimalist:
- Very clean lines and pure geometric forms
- Strictly limited, purposeful furniture
- Cohesive neutral palette (soft off-white, light grey, warm alabaster)
- Completely uncluttered, clean flat surfaces
- Simple, honest, functional furniture with concealed storage
- Restrained, intentional decoration (single sculptural branch or vessel)
- Large, generous areas of visual negative space and calm circulation`,
      avoid: `excessive furniture, busy intricate patterns, visual clutter, decorative tchotchkes, heavy multiple accessories`
    };
  }

  if (norm.includes('MODERN')) {
    return {
      use: `The result MUST visibly look Modern:
- Contemporary furniture with clean, crisp geometry
- Sophisticated neutral color palette (crisp whites, slate, warm greys, rich black accents)
- Sleek architectural modern lighting (recessed linear lights, architectural pendants)
- Polished, refined materials (honed stone, smoked glass, matte powder-coated metals)
- Uncluttered, orderly, functional spatial arrangement`,
      avoid: `heavy traditional carvings, cluttered eclectic knick-knacks, busy rustic distressing, overly ornate frames`
    };
  }

  if (norm.includes('CONTEMPORARY')) {
    return {
      use: `The result MUST visibly look Contemporary:
- Current, state-of-the-art furniture designs with soft curves and rounded edges
- Balanced, warm neutral color tones with sophisticated subtle contrasts
- Sophisticated tactile materials (bouclé upholstery, fluted travertine, brushed brass)
- Clean, deeply comfortable, inviting furniture silhouettes
- Modern curated art and sculptural decorative lighting elements`,
      avoid: `dated antique pieces, harsh excessive industrial roughness, cluttered traditional styling`
    };
  }

  if (norm.includes('LUXURY')) {
    return {
      use: `The result MUST visibly look Luxury (refined upscale luxury, NOT gaudy):
- Premium architectural materials (honed Calacatta or Fior di Bosco marble, quarter-sawn oak)
- Sophisticated custom furniture with bespoke tailoring
- Refined textures (rich velvet, cashmere, bouclé, top-grain leather)
- Elegant, layered architectural illumination (cove lighting, dimmable designer fixtures)
- Tasteful, subtle metallic accents (brushed champagne bronze, satin brass)
- High-quality, flawless finishes and upscale, realistic elegance`,
      avoid: `gaudy excessive gold leaf, tacky overdone polished marble everywhere, excessive glittery chandeliers, cheap bling, overdone ornamentation`
    };
  }

  if (norm.includes('RUSTIC')) {
    return {
      use: `The result MUST visibly look Rustic:
- Heavy reclaimed timber and hand-hewn wooden beams/furniture
- Natural rough stone elements and lime wash finishes
- Textured, organic linens and thick wools
- Rugged, earthy warmth and honest artisanal craftsmanship
- Warm earthy color palette (warm cedar, forest moss, river stone, bark brown)`,
      avoid: `high-gloss plastic, ultra-futuristic cold chrome, clinical stark minimalism, glossy synthetic surfaces`
    };
  }

  if (norm.includes('MID-CENTURY') || norm.includes('MID CENTURY')) {
    return {
      use: `The result MUST visibly look Mid-Century Modern:
- Warm teak, walnut, and rosewood timbers with satin luster
- Iconic tapered splayed legs and organic, aerodynamic silhouettes
- Retro-modern lighting fixtures (sputnik pendants, tripod lamps, globe sconces)
- Graphic textiles and curated color pops of mustard, olive green, ochre, or burnt orange
- Clean mid-century furniture forms celebrating functional optimism`,
      avoid: `ornate Victorian carvings, heavy dark industrial piping, cold sterile white cubism, frilly country decor`
    };
  }

  return {
    use: `The result MUST visibly look ${style}:
- Bespoke ${style} furniture silhouettes and authentic ${style} materials
- Distinctive ${style} textures, lighting fixtures, and surface finishes
- Clear, dominant aesthetic reflecting the unique design vocabulary of ${style}`,
    avoid: `generic transitional filler furniture, clashing aesthetic elements from unrelated styles, visual clutter`
  };
}

/**
 * Functional specifications combining room type with style
 */
export function getRoomFunctionSpecification(roomType: string, style: string): string {
  const norm = (roomType || '').toLowerCase();
  const upperStyle = (style || '').toUpperCase();

  if (norm.includes('work') || norm.includes('office') || norm.includes('study')) {
    return `ROOM FUNCTION: WORKSPACE / HOME OFFICE (HARD CONSTRAINT)
The room MUST function as a dedicated WORKSPACE / HOME OFFICE.
Essential functional items required:
- Work desk styled in ${style} (generous work surface, ergonomic height, cable management)
- Ergonomic task chair / office chair
- Computer / laptop workstation setup and monitor
- Dedicated desk task lighting (focused directional illumination)
- Workspace storage (shelving, credenza, or drawers)
Do NOT turn this into a living room, dining room, or bedroom.`;
  }

  if (norm.includes('bed')) {
    return `ROOM FUNCTION: BEDROOM (HARD CONSTRAINT)
The room MUST function as a dedicated BEDROOM.
Essential functional items required:
- Bed as the central focal anchor with ${style} headboard and quality dressed linens
- Flanking bedside tables / nightstands
- Soft, glare-free ambient bedroom lighting
- Bedroom storage or wardrobe
Do NOT replace the bed with a sofa or dining table.`;
  }

  if (norm.includes('kitchen')) {
    return `ROOM FUNCTION: KITCHEN (HARD CONSTRAINT)
The room MUST function as a dedicated KITCHEN.
Essential functional items required:
- Custom cabinetry and worktop counters styled in ${style}
- Kitchen sink, cooktop, and appliances
- Functional under-cabinet task illumination and island seating where space allows`;
  }

  if (norm.includes('living')) {
    return `ROOM FUNCTION: LIVING ROOM (HARD CONSTRAINT)
The room MUST function as a dedicated LIVING ROOM.
Essential functional items required:
- Primary sofa, sectional, or conversational seating arrangement styled in ${style}
- Coffee table and accent side tables
- Accent lounge armchairs
- Living room media console / focal wall
- Cohesive area rug and warm ambient living-room illumination`;
  }

  if (norm.includes('dining')) {
    return `ROOM FUNCTION: DINING ROOM (HARD CONSTRAINT)
The room MUST function as a dedicated DINING ROOM.
Essential functional items required:
- Central dining table styled in ${style}
- Dining chairs (set of 4 to 8 chairs)
- Overhead statement dining chandelier / pendant
- Sideboard or console for dining ware`;
  }

  if (norm.includes('bath')) {
    return `ROOM FUNCTION: BATHROOM (HARD CONSTRAINT)
The room MUST function as a dedicated BATHROOM.
Essential functional items required:
- Bathroom vanity with integrated sink and mirror
- Moisture-resistant wall/tile finishes in ${style}
- Shower or bath enclosure and appropriate vanity illumination`;
  }

  return `ROOM FUNCTION: ${roomType} (HARD CONSTRAINT)
The room MUST function as a ${roomType}. Fulfill all functional furniture requirements of a ${roomType} while applying ${style} styling.`;
}

/**
 * Constructs the rigorous redesign prompt adhering to the required structure:
 * - Direct command: "Create a [Style] [Room Type] with a [Color Tone] tone."
 * - Separates ROOM FUNCTION (what it is) from STYLE (how it looks)
 * - Embeds explicit MUST USE and MUST AVOID design rules
 * - Preserves physical room architecture and camera perspective
 */
export function buildRoomRedesignPrompt(params: {
  roomType: string;
  style: string;
  colorMood: string;
  customColor?: string;
  lighting: string;
  furniturePreference: string;
  budget: string;
  userInstructions?: string;
  roomAnalysis?: any;
}): string {
  const styleSpec = getStyleCharacteristics(params.style);
  const roomFunctionSpec = getRoomFunctionSpecification(params.roomType, params.style);
  const colorSpec = params.customColor
    ? `${params.colorMood} tone with ${params.customColor} accent`
    : `${params.colorMood} tone`;

  const cameraDesc = params.roomAnalysis?.cameraPerspective ||
    'Eye-level perspective looking into the room, preserving identical viewpoint, field of view, and camera angle as the uploaded photo.';

  return `Create a ${params.style} ${params.roomType} with a ${colorSpec}.

================================================================================
PRIORITY 1: ROOM FUNCTION (HARD CONSTRAINT — WHAT THE ROOM IS)
================================================================================
${roomFunctionSpec}
The room function is an absolute hard constraint. The room MUST remain a functional ${params.roomType}. Do not transform it into any other room type.

================================================================================
PRIORITY 2: INTERIOR STYLE (HARD CONSTRAINT — HOW THE ROOM LOOKS)
================================================================================
The selected style is "${params.style}". The ${params.style} aesthetic must be visually obvious, dominant, and unmistakable in every piece of furniture, material, finish, and fixture.

MUST USE (${params.style}):
${styleSpec.use}

MUST AVOID (${params.style}):
${styleSpec.avoid}

================================================================================
PRIORITY 3: COLOR PALETTE & ATMOSPHERE
================================================================================
Apply a cohesive ${colorSpec} color palette across all walls, upholstery, and joinery.
Lighting specification: ${params.lighting} illumination with layered fixtures.
Furniture preference: ${params.furniturePreference}. Budget level: ${params.budget}.
${params.userInstructions ? `Client custom preference: ${params.userInstructions}` : ''}

================================================================================
PRIORITY 4: ARCHITECTURAL PRESERVATION
================================================================================
This is an interior redesign of the uploaded room photo.
PRESERVE the physical room architecture:
- Maintain structural perimeter walls, window openings and window positions
- Maintain doorway placements, ceiling height, and floor boundary lines
- Maintain the identical camera viewpoint, room proportions, and perspective: ${cameraDesc}

REDESIGN the interior contents:
- Replace/upgrade all furniture with authentic ${params.style} pieces
- Upgrade materials, surface finishes, area rug, drapery, lighting fixtures, and decor
- Do NOT add random new windows, extra doors, or warped geometry

================================================================================
PRIORITY 5: RENDERING QUALITY
================================================================================
Generate exactly ONE photorealistic redesigned room view. Single full-room architectural photograph.
NO multiple views, NO collage, NO split-screen, NO before/after split, NO text, NO watermarks. Professional Architectural Digest photography, 8k resolution.`;
}

export class DesignService {
  async analyzeRoom(imageData: string): Promise<RoomAnalysisResult> {
    return await geminiService.analyzeRoomImage(imageData);
  }

  async generateDesign(input: GenerateDesignInput) {
    if (!input.originalImage) {
      throw new Error('Original room image is required for image-to-image generation.');
    }

    let analysis = input.roomAnalysis;
    if (!analysis) {
      analysis = await geminiService.analyzeRoomImage(input.originalImage);
    }

    const roomType =
      input.room ||
      (analysis.roomType && analysis.roomType !== 'Unknown/Ambiguous'
        ? analysis.roomType
        : 'Workspace');

    // 1. Analyze redesign plan with Gemini multimodal model (preserves deep room analysis & insights)
    const redesignPlan = await geminiService.planInteriorRedesign({
      roomAnalysis: analysis,
      selectedRoomType: roomType,
      style: input.style,
      colorMood: input.colorMood,
      customColor: input.customColor,
      lighting: input.lighting,
      furniturePreference: input.furniturePreference,
      budget: input.budget,
      userInstructions: input.userInstructions,
    });

    // 2. Build the exact Image-to-Image redesign prompt combining room function + dynamic style characteristics
    const roomRedesignPrompt = buildRoomRedesignPrompt({
      roomType,
      style: input.style,
      colorMood: input.colorMood,
      customColor: input.customColor,
      lighting: input.lighting,
      furniturePreference: input.furniturePreference,
      budget: input.budget,
      userInstructions: input.userInstructions,
      roomAnalysis: analysis,
    });

    // 3. Generate the redesigned room image via true Image-to-Image model
    let generatedImage: string | null = null;
    const providerName = imageGenerationService.getProviderName();

    console.log(
      `[DesignService] Generating image-to-image redesign for ${roomType} in ${input.style} style using ${providerName}...`
    );

    const imageGenResult = await imageGenerationService.generateImage({
      sourceImage: input.originalImage,
      prompt: roomRedesignPrompt,
      negativePrompt:
        'changed room layout, changed architecture, missing windows, missing doors, extra windows, extra doors, wrong room type, incorrect furniture, distorted furniture, floating furniture, duplicate furniture, distorted walls, warped geometry, unrealistic perspective, low quality, blurry image, cartoon, illustration, CGI-looking result, text, watermark',
      roomType,
      style: input.style,
      aspectRatio: '4:3',
      strength: 0.65,
      mode: 'redesign',
    });

    if (!imageGenResult.success || !imageGenResult.generatedImage) {
      console.warn('[DesignService] Pixazo Image-to-Image failed:', imageGenResult.error);
      return {
        generationSuccess: false,
        success: false,
        error: imageGenResult.error || 'Pixazo image generation failed.',
        imageGenerationMessage: imageGenResult.error || 'Pixazo image generation failed.',
        imageUrl: null,
        generatedImage: null,
        isAiGeneratedImage: false,
        imageGenerationAvailable: false,
        project: null,
        projectId: undefined,
        generationPrompt: roomRedesignPrompt,
        analysis,
        designInsights: redesignPlan ? {
          changesMade: redesignPlan.changesMade || [],
          colorPalette: redesignPlan.colorPalette || [],
          recommendedFurniture: redesignPlan.recommendedFurniture || [],
          designSummary: redesignPlan.designSummary || '',
        } : undefined,
        variations: [],
      };
    }

    generatedImage = imageGenResult.generatedImage;
    const isAiGeneratedImage = true;

    // 4. Structure final design response with structured insights from Gemini analysis
    const designInsights = {
      changesMade: redesignPlan.changesMade || [
        `Refined ${roomType} surfaces with ${input.style} architectural finishes`,
        `Installed essential functional ${roomType} furniture tailored to room boundaries`,
        `Integrated layered ${input.lighting.toLowerCase()} illumination fixtures`,
        'Upgraded flooring boundaries with textured materials',
        'Preserved sightlines and natural window illumination',
      ],
      colorPalette: redesignPlan.colorPalette || [
        { name: 'Warm Whisper', hex: '#FAF7F2', role: 'Main Wall' },
        { name: 'Smoked Oak', hex: '#58493B', role: 'Cabinetry & Wood' },
        { name: 'Oatmeal Bouclé', hex: '#DED3C4', role: 'Textiles' },
        { name: 'Brushed Brass', hex: '#C2A36B', role: 'Hardware & Accent' },
        { name: 'Sage Stone', hex: '#879183', role: 'Natural Accent' },
      ],
      recommendedFurniture: redesignPlan.recommendedFurniture || [
        {
          item: `${input.style} ${roomType} Essential Piece`,
          style: input.style,
          placement: `Anchoring primary functional ${roomType} zone`,
          reason: `Fulfills the core utility of a functional ${roomType} while elevating aesthetics`,
          estimatedPrice: '$800 - $1,500',
        },
      ],
      designSummary:
        redesignPlan.designSummary ||
        `A harmonious ${input.style} ${roomType} redesign tailored for functional living, natural textures, and generous spatial flow.`,
    };

    const projectData = {
      title: `${input.style} ${roomType} Redesign`,
      type: 'room' as const,
      originalImage: input.originalImage,
      analysis,
      preferences: {
        room: roomType,
        style: input.style,
        colorMood: input.colorMood,
        customColor: input.customColor,
        lighting: input.lighting,
        furniturePreference: input.furniturePreference,
        budget: input.budget,
        userInstructions: input.userInstructions,
      },
      generatedImage,
      variations: [],
      refinementHistory: [],
      designInsights,
    };

    let project: ProjectItem | null = null;
    if (input.saveToStudio !== false) {
      project = await projectRepository.create(projectData);
    }

    return {
      generationSuccess: true,
      success: true,
      project,
      projectId: project?.id,
      generatedImage,
      imageUrl: generatedImage,
      isAiGeneratedImage,
      imageGenerationAvailable: true,
      imageGenerationMessage:
        imageGenResult.warning || 'AI redesign generated successfully via Pixazo Image-to-Image.',
      generationPrompt: roomRedesignPrompt,
      analysis,
      designInsights,
      variations: [],
    };
  }

  async refineDesign(params: {
    projectId?: string;
    currentImage: string;
    originalImage?: string;
    refinementPrompt: string;
    currentStyle?: string;
  }) {
    const sourceImage = params.currentImage || params.originalImage;
    if (!sourceImage) {
      throw new Error('Original or current room image is required for image-to-image refinement.');
    }

    let project: ProjectItem | null = null;
    if (params.projectId) {
      project = await projectRepository.getById(params.projectId);
    }

    const roomType = project?.preferences?.room || 'Living Room';
    const style = project?.preferences?.style || params.currentStyle || 'Modern';

    const refinePrompt = `Transform the provided room image by applying this specific refinement:
${params.refinementPrompt}

IMPORTANT:
This is an image-to-image interior refinement.
Preserve the room's function as a ${roomType} and aesthetic style as ${style}.
Preserve the original room architecture, camera viewpoint, walls, windows, doors, and proportions.
Do not replace with a stock image or change the room into a different room type.`;

    let newImage: string | null = null;
    const providerName = imageGenerationService.getProviderName();
    console.log(`[DesignService] Refining design using image-to-image with ${providerName}...`);

    const imageGenResult = await imageGenerationService.generateImage({
      sourceImage,
      prompt: refinePrompt,
      negativePrompt:
        'blurry, distorted, low quality, artifacts, wrong room type, cross-room furniture, unrelated room',
      roomType,
      style,
      aspectRatio: '4:3',
      mode: 'redesign',
    });

    if (imageGenResult.success && imageGenResult.generatedImage) {
      newImage = imageGenResult.generatedImage;
    } else {
      console.warn('[DesignService] Refinement image-to-image generation unavailable:', imageGenResult.error);
    }

    const historyEntry = {
      timestamp: new Date().toISOString(),
      prompt: params.refinementPrompt,
      image: newImage || sourceImage,
    };

    if (project) {
      const history = [...(project.refinementHistory || []), historyEntry];
      const updatedInsights = project.designInsights ? { ...project.designInsights } : undefined;
      if (updatedInsights && updatedInsights.changesMade) {
        updatedInsights.changesMade = [
          `Refinement: ${params.refinementPrompt}`,
          ...updatedInsights.changesMade.slice(0, 4),
        ];
      }

      await projectRepository.update(project.id, {
        refinementHistory: history,
        generatedImage: newImage || sourceImage,
        designInsights: updatedInsights,
      });
      project = await projectRepository.getById(project.id);
    }

    return {
      refinedImage: newImage || sourceImage,
      imageGenerationAvailable: imageGenResult.success,
      message: imageGenResult.success
        ? `Updated design with instruction: "${params.refinementPrompt}".`
        : (imageGenResult.error || 'Refinement preference logged. Image generation credit limit reached.'),
      project,
    };
  }
}

export const designService = new DesignService();
