import { prisma } from '../config/database';

// Hairstyle recommendations keyed by curl pattern
const HAIRSTYLE_RECS: Record<string, { name: string; description: string; emoji: string; suitableFor: string[] }[]> = {
  TYPE_4C: [
    { name: 'Box Braids',      description: 'Low-manipulation protective style perfect for 4C hair', emoji: '🪢', suitableFor: ['TYPE_4C','TYPE_4B'] },
    { name: 'TWA (Teeny Weeny Afro)', description: 'Celebrate your natural shrinkage', emoji: '✊', suitableFor: ['TYPE_4C'] },
    { name: 'Faux Locs',       description: 'Get the loc look without commitment', emoji: '🌿', suitableFor: ['TYPE_4C','TYPE_4B','TYPE_4A'] },
    { name: 'Bantu Knots',     description: 'Classic style that doubles as a heat-free curl setter', emoji: '🌀', suitableFor: ['TYPE_4C','TYPE_4B'] },
  ],
  TYPE_4B: [
    { name: 'Twist-Out',       description: 'Define your coils with a beautiful twist-out', emoji: '🌀', suitableFor: ['TYPE_4B','TYPE_4A'] },
    { name: 'Cornrows',        description: 'Neat protective braids close to the scalp', emoji: '🪢', suitableFor: ['TYPE_4B','TYPE_4C'] },
    { name: 'Puff Updo',       description: 'Quick and stylish natural puff', emoji: '💫', suitableFor: ['TYPE_4B','TYPE_4A'] },
  ],
  TYPE_4A: [
    { name: 'Wash & Go',       description: 'Let your natural coils shine with defined curls', emoji: '✨', suitableFor: ['TYPE_4A','TYPE_3C'] },
    { name: 'Flat Twist-Out',  description: 'Elongated definition from flat twists', emoji: '🌀', suitableFor: ['TYPE_4A','TYPE_4B'] },
  ],
  TYPE_3C: [
    { name: 'Wash & Go',       description: 'Showcase your tight spiral curls', emoji: '💧', suitableFor: ['TYPE_3C','TYPE_3B'] },
    { name: 'Braid-Out',       description: 'Beautiful stretched waves from braids', emoji: '🌊', suitableFor: ['TYPE_3C','TYPE_3B','TYPE_3A'] },
    { name: 'Pineapple Updo',  description: 'Loose updo that preserves your curls overnight', emoji: '🍍', suitableFor: ['TYPE_3C','TYPE_3B'] },
  ],
  TYPE_3B: [
    { name: 'Diffused Curls',  description: 'Use a diffuser for voluminous natural curls', emoji: '💨', suitableFor: ['TYPE_3B','TYPE_3A'] },
    { name: 'Half-Up Half-Down', description: 'Versatile style showing off your curl length', emoji: '🎀', suitableFor: ['TYPE_3B','TYPE_3C'] },
  ],
  TYPE_3A: [
    { name: 'Scrunched Waves', description: 'Enhance your natural S-shaped waves', emoji: '🌊', suitableFor: ['TYPE_3A','TYPE_2C'] },
    { name: 'Boho Braids',     description: 'Effortless bohemian braided style', emoji: '🌸', suitableFor: ['TYPE_3A','TYPE_3B'] },
  ],
  TYPE_2C: [
    { name: 'Beachy Waves',    description: 'Tousled, effortless wave style', emoji: '🏄', suitableFor: ['TYPE_2C','TYPE_2B'] },
    { name: 'French Braid',    description: 'Classic braid that works with wavy texture', emoji: '🪢', suitableFor: ['TYPE_2C','TYPE_2B','TYPE_2A'] },
  ],
  DEFAULT: [
    { name: 'Natural Style',   description: 'Embrace your natural hair texture', emoji: '✨', suitableFor: [] },
    { name: 'Protective Style', description: 'Low-manipulation style to retain length', emoji: '🛡️', suitableFor: [] },
    { name: 'Braided Updo',    description: 'Elegant braided updo for any occasion', emoji: '👑', suitableFor: [] },
  ],
};

const DIY_RECIPES: Record<string, { name: string; description: string; emoji: string; ingredients: string[]; steps: string[] }[]> = {
  HIGH: [ // High porosity
    {
      name: 'Protein Moisture Mask',
      description: 'Seal those open cuticles with protein power',
      emoji: '🥚',
      ingredients: ['1 egg', '2 tbsp coconut oil', '1 tbsp honey', '1 tbsp apple cider vinegar'],
      steps: ['Mix all ingredients', 'Apply to damp hair', 'Cover with plastic cap 30min', 'Rinse with cool water'],
    },
    {
      name: 'ACV Rinse',
      description: 'Apple cider vinegar closes cuticles and restores pH',
      emoji: '🍎',
      ingredients: ['2 tbsp ACV', '1 cup water', '5 drops lavender oil'],
      steps: ['Mix ACV and water', 'Add essential oil', 'Pour over hair after shampooing', 'Leave 2 min, rinse well'],
    },
  ],
  LOW: [ // Low porosity
    {
      name: 'Steam Deep Conditioner',
      description: 'Heat opens cuticles to let moisture in',
      emoji: '♨️',
      ingredients: ['3 tbsp aloe vera gel', '2 tbsp shea butter', '1 tbsp jojoba oil', '5 drops peppermint oil'],
      steps: ['Melt shea butter', 'Mix all ingredients', 'Apply to clean hair', 'Cover with warm towel 45min'],
    },
    {
      name: 'Lightweight Moisture Mist',
      description: 'Light formula that won\'t weigh down low porosity hair',
      emoji: '💦',
      ingredients: ['1 cup distilled water', '1 tbsp aloe vera', '½ tbsp glycerin', '3 drops argan oil'],
      steps: ['Combine all in spray bottle', 'Shake well', 'Mist on damp hair', 'Seal with light oil'],
    },
  ],
  NORMAL: [
    {
      name: 'Avocado Moisture Bomb',
      description: 'Rich nutrients restore shine and softness',
      emoji: '🥑',
      ingredients: ['1 ripe avocado', '2 tbsp olive oil', '1 tbsp honey', '½ banana'],
      steps: ['Blend all until smooth', 'Apply from roots to tips', 'Cover with cap 30min', 'Rinse with lukewarm water'],
    },
    {
      name: 'Shea Butter Whip',
      description: 'Whipped butter for ultimate moisture sealing',
      emoji: '🧈',
      ingredients: ['4 tbsp shea butter', '2 tbsp coconut oil', '1 tbsp jojoba oil', '10 drops rose oil'],
      steps: ['Soften shea butter', 'Whip with mixer 5min', 'Add oils and blend', 'Apply to ends as leave-in'],
    },
  ],
};

export class RecommendationsService {
  async getHairstyles(userId: string) {
    const profile = await prisma.hairProfile.findUnique({ where: { userId } });
    const curlPattern = profile?.curlPattern ?? 'DEFAULT';
    const recs = HAIRSTYLE_RECS[curlPattern] ?? HAIRSTYLE_RECS['DEFAULT'];
    // Also add a few generic ones
    const extras = HAIRSTYLE_RECS['DEFAULT'].filter(r => !recs.find(x => x.name === r.name));
    return [...recs, ...extras].slice(0, 6);
  }

  async getProducts(userId: string) {
    const profile = await prisma.hairProfile.findUnique({ where: { userId } });

    const where: any = { inStock: true };
    if (profile?.curlPattern) {
      where.suitableFor = { has: profile.curlPattern };
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { rating: 'desc' },
      take: 8,
    });

    // Fallback to top-rated if no matches
    if (products.length < 4) {
      const fallback = await prisma.product.findMany({
        where: { inStock: true },
        include: { category: true },
        orderBy: { rating: 'desc' },
        take: 8,
      });
      return fallback;
    }

    return products;
  }

  async getDIYRecipes(userId: string) {
    const profile = await prisma.hairProfile.findUnique({ where: { userId } });
    const porosity = profile?.porosity ?? 'NORMAL';
    return DIY_RECIPES[porosity] ?? DIY_RECIPES['NORMAL'];
  }
}
