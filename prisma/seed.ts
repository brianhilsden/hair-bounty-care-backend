import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Routine Templates ─────────────────────────────────────
  const routineTemplates = [
    { name: 'Crown Hydration',   icon: '💧', description: 'Keep your crown moisturized and healthy',          category: 'hydrating',    isDefault: true },
    { name: 'Silk Refresh',      icon: '✨', description: 'Refresh your style and keep it looking fresh',      category: 'refreshing',   isDefault: true },
    { name: 'Golden Oil Ritual', icon: '🌟', description: 'Nourish your scalp with oil therapy',              category: 'oiling',       isDefault: true },
    { name: 'Freedom Day',       icon: '🦋', description: 'Time to undo your protective style',               category: 'undoing',      isDefault: true },
    { name: 'Cleanse & Shine',   icon: '🧼', description: 'Wash day for a fresh start',                       category: 'washing',      isDefault: true },
    { name: 'Deep Treatment',    icon: '💆', description: 'Deep conditioning for extra love',                  category: 'conditioning', isDefault: true },
    { name: 'Scalp Therapy',     icon: '🌿', description: 'Targeted scalp massage and treatment',             category: 'scalp',        isDefault: true },
    { name: 'Protective Set',    icon: '🛡️', description: 'Set your protective style for the week',           category: 'protective',   isDefault: true },
  ];

  for (const t of routineTemplates) {
    await prisma.routineTemplate.upsert({ where: { name: t.name }, update: {}, create: t });
  }
  console.log('✅ Routine templates seeded');

  // ─── Badges ────────────────────────────────────────────────
  const badges = [
    { name: 'First Step',       description: 'Complete your first routine',          iconUrl: '⭐', requirement: JSON.stringify({ type: 'routine_count', count: 1   }) },
    { name: 'Streak Warrior',   description: 'Maintain a 7-day streak',              iconUrl: '🔥', requirement: JSON.stringify({ type: 'streak',        days: 7    }) },
    { name: 'Crown Queen',      description: 'Maintain a 30-day streak',             iconUrl: '👑', requirement: JSON.stringify({ type: 'streak',        days: 30   }) },
    { name: 'Hydration Hero',   description: 'Complete 10 hydration routines',       iconUrl: '💧', requirement: JSON.stringify({ type: 'routine_count', count: 10  }) },
    { name: 'Oil Master',       description: 'Complete 25 routines total',           iconUrl: '🌿', requirement: JSON.stringify({ type: 'routine_count', count: 25  }) },
    { name: 'Growth Tracker',   description: 'Complete 50 routines total',           iconUrl: '📈', requirement: JSON.stringify({ type: 'routine_count', count: 50  }) },
    { name: 'Century Club',     description: 'Complete 100 routines',                iconUrl: '💯', requirement: JSON.stringify({ type: 'routine_count', count: 100 }) },
    { name: 'Iron Streak',      description: 'Maintain a 14-day streak',             iconUrl: '⚡', requirement: JSON.stringify({ type: 'streak',        days: 14   }) },
    { name: 'Longest Streak',   description: 'Reach a 60-day longest streak',        iconUrl: '🏆', requirement: JSON.stringify({ type: 'longest_streak',days: 60   }) },
  ];

  for (const b of badges) {
    await prisma.badge.upsert({ where: { name: b.name }, update: {}, create: b });
  }
  console.log('✅ Badges seeded');

  // ─── Community Groups ──────────────────────────────────────
  const communityGroups = [
    { name: 'Braids Lovers',      description: 'Everything about braids — box braids, cornrows, knotless and more!', category: 'braids',     coverUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800', memberCount: 1240 },
    { name: 'Natural Curls Gang', description: 'Embrace your natural texture, curl patterns, and shrinkage!',        category: 'natural',    coverUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=800', memberCount: 2150 },
    { name: 'Locs Journey',       description: 'Share your loc journey — starter locs to mature, we grow together.', category: 'locs',       coverUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800', memberCount: 980  },
    { name: 'Protective Styles',  description: 'Discuss wigs, weaves, twists and all protective hairstyles.',        category: 'protective', coverUrl: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800', memberCount: 1670 },
    { name: 'Relaxed Hair Hub',   description: 'Tips and care for chemically relaxed hair.',                         category: 'relaxed',    coverUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800', memberCount: 720  },
    { name: 'Color & Style',      description: 'Hair coloring, highlights, balayage and color maintenance.',         category: 'coloring',   coverUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800', memberCount: 540  },
  ];

  for (const g of communityGroups) {
    await prisma.communityGroup.upsert({ where: { name: g.name }, update: { memberCount: g.memberCount }, create: g });
  }
  console.log('✅ Community groups seeded');

  // ─── Product Categories ────────────────────────────────────
  const productCategories = [
    { name: 'Oils',             iconUrl: '🛢️' },
    { name: 'Shampoos',         iconUrl: '🧴' },
    { name: 'Conditioners',     iconUrl: '💆' },
    { name: 'Tools',            iconUrl: '🔧' },
    { name: 'DIY Ingredients',  iconUrl: '🌿' },
    { name: 'Styling Products', iconUrl: '💅' },
    { name: 'Treatments',       iconUrl: '✨' },
    { name: 'Scalp Care',       iconUrl: '🌱' },
  ];

  for (const c of productCategories) {
    await prisma.productCategory.upsert({ where: { name: c.name }, update: {}, create: c });
  }
  console.log('✅ Product categories seeded');

  // Get category IDs
  const catMap = new Map(
    (await prisma.productCategory.findMany()).map(c => [c.name, c.id])
  );

  // ─── Products ──────────────────────────────────────────────
  const products = [
    {
      name: 'Jamaican Black Castor Oil',
      description: 'Pure JBCO for scalp stimulation and hair growth. Rich in omega-9 fatty acids.',
      price: 850,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Oils')!,
      suitableFor: ['TYPE_4C','TYPE_4B','TYPE_4A','TYPE_3C'] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.8,
      reviewCount: 234,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
    },
    {
      name: 'Argan Oil Hair Serum',
      description: 'Lightweight Moroccan argan oil serum for frizz control and shine.',
      price: 1200,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Oils')!,
      suitableFor: ['TYPE_2A','TYPE_2B','TYPE_2C','TYPE_3A','TYPE_3B'] as any[],
      scalpTypes: ['normal','oily'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.5,
      reviewCount: 189,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
    },
    {
      name: 'Shea Butter (Raw, Unrefined)',
      description: '100% raw shea butter — perfect for DIY recipes, deep conditioning and sealing.',
      price: 450,
      productType: 'DIY_INGREDIENT' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('DIY Ingredients')!,
      suitableFor: ['TYPE_4C','TYPE_4B','TYPE_4A','TYPE_3C'] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: true,
      isZeroWaste: true,
      rating: 4.9,
      reviewCount: 412,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1600618527890-f5f5c6c7ef97?w=400'],
    },
    {
      name: 'Moisturizing Co-Wash',
      description: 'Conditioning cleanser that washes without stripping moisture. Perfect for wash days.',
      price: 780,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Shampoos')!,
      suitableFor: ['TYPE_3A','TYPE_3B','TYPE_3C','TYPE_4A','TYPE_4B','TYPE_4C'] as any[],
      scalpTypes: ['normal','dry'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.3,
      reviewCount: 97,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=400'],
    },
    {
      name: 'Deep Conditioning Mask',
      description: 'Intense hydration mask with avocado, honey and keratin for all hair types.',
      price: 1450,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Treatments')!,
      suitableFor: ['TYPE_4C','TYPE_4B','TYPE_4A','TYPE_3C','TYPE_3B'] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.7,
      reviewCount: 321,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400'],
    },
    {
      name: 'Wide-Tooth Detangling Comb',
      description: 'Seamless wide-tooth comb for gentle detangling without breakage.',
      price: 350,
      productType: 'READY_MADE' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Tools')!,
      suitableFor: [] as any[],
      scalpTypes: [],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.6,
      reviewCount: 156,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400'],
    },
    {
      name: 'Leave-In Conditioning Spray',
      description: 'Lightweight daily leave-in spray for moisture, detangling and shine.',
      price: 650,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Conditioners')!,
      suitableFor: ['TYPE_3A','TYPE_3B','TYPE_4A','TYPE_4B'] as any[],
      scalpTypes: ['normal','dry'],
      isEcoCertified: true,
      isZeroWaste: true,
      rating: 4.4,
      reviewCount: 208,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1556228853-923e38b56e73?w=400'],
    },
    {
      name: 'Rosemary Hair Growth Oil',
      description: 'Clinically proven rosemary oil blend to stimulate follicles and reduce shedding.',
      price: 1100,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Scalp Care')!,
      suitableFor: [] as any[],
      scalpTypes: ['dry','normal','oily'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.9,
      reviewCount: 567,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
    },
    {
      name: 'Aloe Vera Gel (Pure)',
      description: '100% pure aloe vera gel — moisturizing, soothing, excellent DIY base.',
      price: 320,
      productType: 'DIY_INGREDIENT' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('DIY Ingredients')!,
      suitableFor: [] as any[],
      scalpTypes: ['oily','normal','dry'],
      isEcoCertified: true,
      isZeroWaste: true,
      rating: 4.7,
      reviewCount: 389,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1607348677547-8e3d4af3a9d5?w=400'],
    },
    {
      name: 'Twist & Define Cream',
      description: 'Defines curls and coils, reduces frizz and provides hold for twist-outs.',
      price: 900,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Styling Products')!,
      suitableFor: ['TYPE_4A','TYPE_4B','TYPE_4C','TYPE_3C'] as any[],
      scalpTypes: ['normal','dry'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.5,
      reviewCount: 143,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'],
    },
    // ── New products ────────────────────────────────────────────
    {
      name: 'Sulfate-Free Clarifying Shampoo',
      description: 'Gently cleanses buildup without stripping moisture. Formulated for coily and kinky textures.',
      price: 920,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Shampoos')!,
      suitableFor: ['TYPE_4A','TYPE_4B','TYPE_4C','TYPE_3C','TYPE_3B'] as any[],
      scalpTypes: ['normal','oily','dry'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.6,
      reviewCount: 178,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=400'],
    },
    {
      name: 'Scalp Detox Shampoo',
      description: 'Activated charcoal and tea tree formula that purifies pores, relieves itchiness and removes buildup.',
      price: 1050,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Shampoos')!,
      suitableFor: [] as any[],
      scalpTypes: ['oily','normal'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.4,
      reviewCount: 95,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
    },
    {
      name: 'Protein Repair Conditioner',
      description: 'Hydrolyzed keratin and silk protein conditioner to restore strength and elasticity in damaged strands.',
      price: 1150,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Conditioners')!,
      suitableFor: ['TYPE_3A','TYPE_3B','TYPE_3C','TYPE_4A','TYPE_4B'] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.8,
      reviewCount: 263,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'],
    },
    {
      name: 'Moisture Seal Deep Conditioner',
      description: '30-minute deep conditioning mask with shea, mango butter and glycerin for maximum moisture retention.',
      price: 1380,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Conditioners')!,
      suitableFor: ['TYPE_4B','TYPE_4C','TYPE_4A','TYPE_3C'] as any[],
      scalpTypes: ['dry'],
      isEcoCertified: true,
      isZeroWaste: true,
      rating: 4.9,
      reviewCount: 441,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400'],
    },
    {
      name: 'Raw Honey (Hair Grade)',
      description: 'Unprocessed raw honey — a powerful humectant for DIY masks, co-washes and deep conditioning recipes.',
      price: 380,
      productType: 'DIY_INGREDIENT' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('DIY Ingredients')!,
      suitableFor: [] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: false,
      isZeroWaste: true,
      rating: 4.7,
      reviewCount: 218,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1587049352847-5aee17dd7c9a?w=400'],
    },
    {
      name: 'Bentonite Clay',
      description: 'Food-grade bentonite clay for clarifying washes and scalp detox. Rich in minerals that strengthen strands.',
      price: 420,
      productType: 'DIY_INGREDIENT' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('DIY Ingredients')!,
      suitableFor: ['TYPE_4A','TYPE_4B','TYPE_4C'] as any[],
      scalpTypes: ['oily','normal'],
      isEcoCertified: true,
      isZeroWaste: true,
      rating: 4.6,
      reviewCount: 174,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=400'],
    },
    {
      name: 'Scalp Massager Brush',
      description: 'Soft silicone scalp massager to stimulate circulation, exfoliate the scalp and enhance product absorption.',
      price: 480,
      productType: 'READY_MADE' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Tools')!,
      suitableFor: [] as any[],
      scalpTypes: ['dry','oily','normal'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.7,
      reviewCount: 312,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400'],
    },
    {
      name: 'Satin-Lined Bonnet',
      description: 'Premium satin-lined sleep bonnet to protect natural styles, reduce frizz and retain moisture overnight.',
      price: 650,
      productType: 'READY_MADE' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Tools')!,
      suitableFor: [] as any[],
      scalpTypes: [],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.8,
      reviewCount: 527,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1519340333755-56e9c1d04579?w=400'],
    },
    {
      name: 'Scalp Revival Serum',
      description: 'Targeted scalp serum with niacinamide and peppermint to soothe irritation and reduce flaking.',
      price: 1350,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Scalp Care')!,
      suitableFor: [] as any[],
      scalpTypes: ['dry','oily','normal'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.7,
      reviewCount: 189,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'],
    },
    {
      name: 'Tea Tree Scalp Oil',
      description: 'Lightweight antibacterial scalp oil with tea tree, eucalyptus and jojoba for a balanced, healthy scalp.',
      price: 780,
      productType: 'READY_MADE' as const,
      priceRange: 'MID_RANGE' as const,
      categoryId: catMap.get('Scalp Care')!,
      suitableFor: [] as any[],
      scalpTypes: ['oily','normal'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.5,
      reviewCount: 134,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
    },
    {
      name: 'Edge Control Gel',
      description: 'Long-lasting, non-flaking edge control with aloe and castor oil for a sleek, moisturized finish.',
      price: 580,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Styling Products')!,
      suitableFor: ['TYPE_4A','TYPE_4B','TYPE_4C','TYPE_3C'] as any[],
      scalpTypes: ['normal','dry'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.6,
      reviewCount: 291,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
    },
    {
      name: 'Curl Defining Mousse',
      description: 'Lightweight mousse for enhanced curl definition, volume and frizz control on wash days.',
      price: 720,
      productType: 'READY_MADE' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Styling Products')!,
      suitableFor: ['TYPE_2C','TYPE_3A','TYPE_3B','TYPE_3C'] as any[],
      scalpTypes: ['normal'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.3,
      reviewCount: 87,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1556228852-80b6e5eeff06?w=400'],
    },
    {
      name: 'Bond Repair Treatment',
      description: 'Professional-grade bond builder that repairs broken disulfide bonds from chemical processing and heat damage.',
      price: 2200,
      productType: 'HAIR_BOUNTY_OWN' as const,
      priceRange: 'PREMIUM' as const,
      categoryId: catMap.get('Treatments')!,
      suitableFor: ['TYPE_2A','TYPE_2B','TYPE_2C','TYPE_3A','TYPE_3B','TYPE_3C'] as any[],
      scalpTypes: ['normal','dry'],
      isEcoCertified: true,
      isZeroWaste: false,
      rating: 4.9,
      reviewCount: 156,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400'],
    },
    {
      name: 'Hot Oil Treatment Pack',
      description: 'Pre-mixed hot oil blend with coconut, olive and argan oils. Heat and apply for intense penetrating moisture.',
      price: 550,
      productType: 'READY_MADE' as const,
      priceRange: 'BUDGET' as const,
      categoryId: catMap.get('Treatments')!,
      suitableFor: ['TYPE_4A','TYPE_4B','TYPE_4C','TYPE_3C','TYPE_3B'] as any[],
      scalpTypes: ['dry','normal'],
      isEcoCertified: false,
      isZeroWaste: false,
      rating: 4.4,
      reviewCount: 203,
      inStock: true,
      imageUrls: ['https://images.unsplash.com/photo-1607348677547-8e3d4af3a9d5?w=400'],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }
  console.log('✅ Products seeded');

  // ─── Salons ────────────────────────────────────────────────
  const salons = [
    {
      name: 'The Crown Studio',
      description: 'Premium natural hair salon specializing in 4C hair, loc maintenance and protective styles.',
      address: 'Kimathi Street, CBD',
      city: 'Nairobi',
      latitude: -1.2841,
      longitude: 36.8155,
      phone: '+254711000001',
      email: 'hello@crowns tudio.ke',
      isHighEnd: true,
      isBudget: false,
      isKidsFriendly: true,
      isOrganic: true,
      isGreenCertified: false,
      specialties: ['braids', 'natural', 'locs'],
      rating: 4.8,
      reviewCount: 312,
      isAffiliate: true,
      imageUrls: [],
      coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800',
    },
    {
      name: 'Braids by Amara',
      description: 'Affordable braiding salon with expert stylists for box braids, cornrows and knotless.',
      address: 'Tom Mboya Street, CBD',
      city: 'Nairobi',
      latitude: -1.2878,
      longitude: 36.8219,
      phone: '+254722000002',
      isHighEnd: false,
      isBudget: true,
      isKidsFriendly: true,
      isOrganic: false,
      isGreenCertified: false,
      specialties: ['braids', 'cornrows', 'knotless'],
      rating: 4.6,
      reviewCount: 198,
      isAffiliate: false,
      imageUrls: [],
    },
    {
      name: 'Organic Roots Salon',
      description: 'Eco-certified salon using only organic and natural hair products.',
      address: 'Westlands, Rhapta Road',
      city: 'Nairobi',
      latitude: -1.2635,
      longitude: 36.8025,
      phone: '+254733000003',
      isHighEnd: false,
      isBudget: false,
      isKidsFriendly: false,
      isOrganic: true,
      isGreenCertified: true,
      specialties: ['natural', 'coloring', 'treatments'],
      rating: 4.7,
      reviewCount: 87,
      isAffiliate: true,
      imageUrls: [],
    },
    {
      name: 'Kids & Curls',
      description: 'Specialist children\'s hair salon — patient, fun, and expert with all textures.',
      address: 'Karen Shopping Centre',
      city: 'Nairobi',
      latitude: -1.3186,
      longitude: 36.7142,
      phone: '+254744000004',
      isHighEnd: false,
      isBudget: true,
      isKidsFriendly: true,
      isOrganic: false,
      isGreenCertified: false,
      specialties: ['natural', 'braids'],
      rating: 4.9,
      reviewCount: 234,
      isAffiliate: false,
      imageUrls: [],
    },
    {
      name: 'Luxe Loc Lounge',
      description: 'High-end loc salon specializing in starter locs, retwisting and loc styling.',
      address: 'Upper Hill, Hospital Road',
      city: 'Nairobi',
      latitude: -1.2989,
      longitude: 36.8132,
      phone: '+254755000005',
      isHighEnd: true,
      isBudget: false,
      isKidsFriendly: false,
      isOrganic: false,
      isGreenCertified: false,
      specialties: ['locs'],
      rating: 4.7,
      reviewCount: 156,
      isAffiliate: true,
      imageUrls: [],
    },
    {
      name: 'Curl & Color Bar',
      description: 'Specialists in hair coloring, balayage and highlights for all curl types.',
      address: 'Kilimani, Ngong Road',
      city: 'Nairobi',
      latitude: -1.2924,
      longitude: 36.7810,
      phone: '+254766000006',
      isHighEnd: false,
      isBudget: false,
      isKidsFriendly: false,
      isOrganic: false,
      isGreenCertified: false,
      specialties: ['coloring', 'relaxed', 'natural'],
      rating: 4.5,
      reviewCount: 112,
      isAffiliate: false,
      imageUrls: [],
    },
  ];

  for (const s of salons) {
    const existing = await prisma.salon.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.salon.create({ data: s });
  }
  console.log('✅ Salons seeded');

  // ─── Blog Posts ────────────────────────────────────────────
  const blogPosts = [
    {
      slug: 'moisture-protein-balance-4c-hair',
      title: 'The Moisture-Protein Balance: Why Your 4C Hair Needs Both',
      excerpt: 'Learn how to identify signs of moisture overload vs protein deficiency and restore balance.',
      content: `Understanding the moisture-protein balance is fundamental to healthy 4C hair care. Your hair strands are made of keratin protein, but they need water (moisture) to stay flexible and elastic.\n\n**Signs of Moisture Overload:**\n- Hair feels mushy or gummy when wet\n- Excessive stretching without snapping back\n- Limpness and lack of definition\n\n**Signs of Protein Deficiency:**\n- Excessive breakage\n- Hair feels like cotton or straw\n- Lack of elasticity\n\n**Finding Your Balance:**\nDo a simple strand test — take a strand and stretch it gently. Healthy hair should stretch about 30% before breaking. If it breaks immediately, you need moisture. If it stretches too much without breaking, you need protein.\n\nFor most 4C naturals, a monthly protein treatment followed by a deep conditioning session works perfectly.`,
      coverUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      author: 'Dr. Amina Osei',
      category: 'Hair Care Tips',
      tags: ['4C hair', 'moisture', 'protein', 'hair science'],
      readTime: 6,
      isPublished: true,
    },
    {
      slug: 'starter-locs-complete-guide',
      title: 'Starting Your Loc Journey: Everything You Need to Know',
      excerpt: 'From choosing your method to the first 6 months — your complete starter loc guide.',
      content: `Starting locs is one of the most beautiful hair decisions you can make. Here's everything you need to know to begin your journey successfully.\n\n**Loc Starting Methods:**\n1. **Two-strand twists** — Most common, great for 4A-4C hair\n2. **Interlocking** — Tighter method, works well for finer textures\n3. **Comb coils** — Great for shorter hair\n4. **Freeform** — Minimal manipulation, natural matting\n\n**What to Expect in Month 1-3 (Starter Phase):**\nYour locs will look loose and may unravel. This is normal. Resist the urge to retwist too often — every 4-6 weeks is ideal. Overwashing causes unraveling.\n\n**Essential Products:**\n- Lightweight locking gel (avoid heavy waxes)\n- Residue-free shampoo\n- Light oil for scalp (rosemary, tea tree)\n\n**Key Tip:** Stay patient. The budding phase (month 3-6) is when things start to look different — embrace the journey!`,
      coverUrl: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800',
      author: 'Kezia Wanjiru',
      category: 'Hair Care Tips',
      tags: ['locs', 'starter locs', 'loc journey', 'natural hair'],
      readTime: 8,
      isPublished: true,
    },
    {
      slug: 'diy-hair-recipes-for-growth',
      title: '5 DIY Hair Recipes That Actually Grow Your Hair',
      excerpt: 'Science-backed DIY treatments using kitchen ingredients for real hair growth.',
      content: `You don't need expensive products to grow healthy hair. These recipes use ingredients proven to support hair growth.\n\n**1. Rosemary & Peppermint Scalp Oil**\nRosemary oil has been shown in studies to be as effective as minoxidil for hair growth.\n- 30ml carrier oil (jojoba or coconut)\n- 10 drops rosemary essential oil\n- 5 drops peppermint oil\nMassage into scalp 3x weekly.\n\n**2. Egg & Olive Oil Protein Mask**\nEggs are rich in biotin and protein.\n- 2 eggs\n- 3 tbsp olive oil\n- 1 tbsp honey\nApply to hair, cover 30 min, rinse with cool water.\n\n**3. Onion Juice Scalp Treatment**\nHigh in sulfur which supports keratin production.\n- Blend 1 onion, strain juice\n- Apply to scalp, leave 30 min\n- Wash thoroughly\nUse weekly for best results.\n\n**4. Avocado & Banana Moisture Mask**\nPerfect for high-porosity hair.\n- 1 ripe avocado + 1 banana\n- 2 tbsp coconut oil\nBlend smooth, apply 45 min.\n\n**5. Aloe Vera & Castor Oil Growth Serum**\n- 3 tbsp aloe vera gel\n- 1 tbsp castor oil\n- 5 drops cedarwood oil\nMix, apply to scalp nightly.`,
      coverUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      author: 'Nadia Kamau',
      category: 'DIY Recipes',
      tags: ['DIY', 'hair growth', 'natural ingredients', 'recipes'],
      readTime: 7,
      isPublished: true,
    },
    {
      slug: 'hair-care-for-kids-natural',
      title: 'Gentle Hair Care Routines for Kids with Natural Hair',
      excerpt: 'Age-appropriate tips to make wash day fun and painless for your little ones.',
      content: `Kids' natural hair requires patience, gentleness and the right products. Here's how to make hair care a positive experience.\n\n**Key Principles:**\n- Always detangle on wet, conditioned hair\n- Use wide-tooth combs, never fine-tooth\n- Keep sessions short and fun\n- Use unscented, gentle products\n\n**Simple Weekly Routine:**\n1. Co-wash with a gentle cleanser\n2. Apply detangling conditioner, section hair\n3. Detangle from ends to roots\n4. Rinse and apply leave-in\n5. Style in protective style (braids, twists)\n\n**Best Protective Styles for Kids:**\n- Two-strand twists (quick, easy)\n- Cornrows (low maintenance, lasts 2 weeks)\n- Puffs and buns\n- Box braids (best for older kids)\n\n**Making It Fun:**\nLet them pick their accessories, play music, give them a small mirror to watch, and always celebrate their beautiful hair!`,
      coverUrl: 'https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800',
      author: 'Grace Achieng',
      category: 'Age-Specific',
      tags: ['kids', 'children', 'natural hair', 'wash day'],
      readTime: 5,
      isPublished: true,
    },
    {
      slug: 'sustainable-hair-care-guide',
      title: 'Building a Sustainable Hair Care Routine',
      excerpt: 'How to care for your hair while caring for the planet — eco swaps that work.',
      content: `Sustainable hair care is about making conscious choices that are good for your hair AND the environment. Here's how to build a routine that does both.\n\n**The Problem with Conventional Products:**\nMost shampoos contain sulfates that strip hair AND pollute waterways. Silicones build up and aren't biodegradable. Plastic packaging ends up in landfills.\n\n**Easy Eco Swaps:**\n\n1. **Shampoo bars** — Zero plastic, concentrated formula, lasts 80+ washes\n2. **Refillable bottles** — Buy in bulk, refill your bottles\n3. **DIY treatments** — Use raw ingredients (shea butter, oils, aloe)\n4. **Bamboo tools** — Swap plastic combs and brushes\n5. **Microfiber towels** — Reduce water use and frizz\n\n**Top Eco-Certified Ingredients to Look For:**\n- COSMOS-certified organic\n- Ecocert approved\n- Rainforest Alliance certified palm oil\n\n**Zero-Waste Protective Styles:**\nBraids, locs and twists actually require fewer products — making them naturally more sustainable!`,
      coverUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
      author: 'Amara Diallo',
      category: 'Sustainability',
      tags: ['sustainable', 'eco-friendly', 'zero waste', 'green beauty'],
      readTime: 6,
      isPublished: true,
    },
    {
      slug: 'community-stories-loc-journey-nairobi',
      title: 'My 3-Year Loc Journey: From Doubt to Crown',
      excerpt: 'Nairobi naturalist Zawadi shares her emotional and beautiful loc journey.',
      content: `Three years ago, I sat in my bathroom looking at my thin, over-processed hair and made a decision that would change my life: I was going to start locs.\n\nI was terrified. My family thought I was making a mistake. My office manager gave me a "concerned" look when I came in with fresh coils. But I had found the Hair Bounty community, and these women understood.\n\n**Month 1-3:** The baby stage is real. My locs looked like messy twists. I cried twice. I almost took them out. But the community kept saying "trust the process" and they were right.\n\n**Month 6:** Budding! I could see actual locs forming. The back was budding faster than the front. My confidence was growing too.\n\n**Year 1:** I had mid-neck length locs. I bought my first head wrap. I started going to Crown Studio for retwists every 6 weeks.\n\n**Year 2:** People started complimenting my locs everywhere. A stranger at the supermarket asked if they were extensions — they weren't! I started loving my hair for the first time.\n\n**Year 3 (Today):** My locs are shoulder length. They're thick, healthy and full of my journey. Every knot tells a story.\n\nTo anyone starting: trust the process. Your crown is worth it.`,
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      author: 'Zawadi Mwangi',
      category: 'Community',
      tags: ['loc journey', 'community', 'nairobi', 'natural hair story'],
      readTime: 9,
      isPublished: true,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({ where: { slug: post.slug }, update: {}, create: { ...post, publishedAt: new Date() } });
  }
  console.log('✅ Blog posts seeded');

  // ─── Offers / Promo Codes ──────────────────────────────────
  const now = new Date();
  const oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

  const offers = [
    {
      title: 'Welcome Discount',
      description: '20% off your first order when you join Hair Bounty Care',
      discountType: 'percentage',
      discountValue: 20,
      code: 'WELCOME20',
      minPurchase: 500,
      maxUses: 10000,
      usedCount: 0,
      validFrom: new Date('2025-01-01'),
      validUntil: oneYearLater,
      isActive: true,
    },
    {
      title: 'Referral Reward',
      description: '15% off for both referrer and referee',
      discountType: 'percentage',
      discountValue: 15,
      code: 'REFER15',
      minPurchase: 300,
      maxUses: null,
      usedCount: 0,
      validFrom: new Date('2025-01-01'),
      validUntil: oneYearLater,
      isActive: true,
    },
    {
      title: 'Eco Beauty Sale',
      description: 'KES 200 off on all eco-certified products',
      discountType: 'fixed_amount',
      discountValue: 200,
      code: 'ECOBEAUTY',
      minPurchase: 800,
      maxUses: 500,
      usedCount: 0,
      validFrom: new Date('2025-01-01'),
      validUntil: oneYearLater,
      isActive: true,
    },
    {
      title: 'Natural Hair Day',
      description: 'Special 25% discount on Natural Hair Day',
      discountType: 'percentage',
      discountValue: 25,
      code: 'NATURALHAIR25',
      minPurchase: null,
      maxUses: 1000,
      usedCount: 0,
      validFrom: new Date('2025-01-01'),
      validUntil: oneYearLater,
      isActive: true,
    },
  ];

  for (const offer of offers) {
    const existing = await prisma.offer.findUnique({ where: { code: offer.code } });
    if (!existing) await prisma.offer.create({ data: offer });
  }
  console.log('✅ Offers/promo codes seeded');

  // ─── Ads ───────────────────────────────────────────────────
  const ads = [
    {
      title: 'Hair Bounty Care Subscription',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800',
      targetUrl: 'https://hairbountycare.com/subscribe',
      placement: 'home_banner',
      impressions: 0,
      clicks: 0,
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: oneYearLater,
    },
    {
      title: 'Shop Eco Hair Products',
      imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      targetUrl: 'https://hairbountycare.com/shop',
      placement: 'explore_banner',
      impressions: 0,
      clicks: 0,
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: oneYearLater,
    },
    {
      title: 'Rosemary Growth Oil — Special Offer',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400',
      targetUrl: 'https://hairbountycare.com/products',
      placement: 'product_sponsored',
      impressions: 0,
      clicks: 0,
      isActive: true,
      startDate: new Date('2025-01-01'),
      endDate: oneYearLater,
    },
  ];

  for (const ad of ads) {
    const existing = await prisma.ad.findFirst({ where: { title: ad.title, placement: ad.placement } });
    if (!existing) await prisma.ad.create({ data: ad });
  }
  console.log('✅ Ads seeded');

  console.log('\n🎉 Database seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   • ${routineTemplates.length} routine templates`);
  console.log(`   • ${badges.length} badges`);
  console.log(`   • ${communityGroups.length} community groups`);
  console.log(`   • ${productCategories.length} product categories`);
  console.log(`   • ${products.length} products (24 total)`);
  console.log(`   • ${salons.length} salons`);
  console.log(`   • ${blogPosts.length} blog posts`);
  console.log(`   • ${offers.length} promo codes`);
  console.log(`   • ${ads.length} ads`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
