import { PrismaClient, ProductType, PriceRange } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Explore Data (Salons & Products)...');

  // Seed Salons
  const salons = [
    {
      name: 'Nairobi Natural Twist',
      description: 'Specializing in natural hair care, locs and beautiful protective styling.',
      coverUrl: 'https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?w=800'],
      phone: '+254700000000',
      address: 'Westlands Road, Westlands',
      city: 'Nairobi',
      latitude: -1.266,
      longitude: 36.804,
      isHighEnd: true,
      isOrganic: true,
      specialties: ['natural', 'locs', 'protective'],
      rating: 4.8,
      reviewCount: 124,
    },
    {
      name: 'Kids Braids & Beads',
      description: 'A fun, welcoming salon perfect for children\'s hair braiding and styling.',
      coverUrl: 'https://images.unsplash.com/photo-1560011961-4ab41261de01?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1560011961-4ab41261de01?w=800'],
      phone: '+254711111111',
      address: 'Ngong Road, Kilimani',
      city: 'Nairobi',
      latitude: -1.292,
      longitude: 36.788,
      isBudget: true,
      isKidsFriendly: true,
      specialties: ['braids', 'kids'],
      rating: 4.5,
      reviewCount: 89,
    },
    {
      name: 'Silk & Color Studio',
      description: 'Experts in hair coloring, relaxing, and silk presses.',
      coverUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3ce?w=800',
      imageUrls: ['https://images.unsplash.com/photo-1562322140-8baeececf3ce?w=800'],
      phone: '+254722222222',
      address: 'Mombasa Road, South B',
      city: 'Nairobi',
      latitude: -1.314,
      longitude: 36.835,
      isHighEnd: false,
      isGreenCertified: true,
      specialties: ['coloring', 'relaxed'],
      rating: 4.2,
      reviewCount: 56,
    }
  ];

  for (const salon of salons) {
    const exists = await prisma.salon.findFirst({ where: { name: salon.name } });
    if (!exists) {
        await prisma.salon.create({ data: salon });
    }
  }
  console.log('✅ Salons seeded');

  // Fetch created categories to associate with products
  const dbCategories = await prisma.productCategory.findMany();
  
  const oilCategory = dbCategories.find(c => c.name === 'Oils');
  const shampooCategory = dbCategories.find(c => c.name === 'Shampoos');
  const conditionerCategory = dbCategories.find(c => c.name === 'Conditioners');
  const diyCategory = dbCategories.find(c => c.name === 'DIY Ingredients');

  const products = [
    {
      name: 'Organic Rosemary Mint Oil',
      description: 'Stimulate scalp health and hair growth with our organic blend of rosemary and mint essential oils.',
      price: 1200, // KES
      imageUrls: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800'],
      productType: ProductType.READY_MADE,
      priceRange: PriceRange.MID_RANGE,
      categoryId: oilCategory?.id || dbCategories[0].id,
      scalpTypes: ['dry', 'normal'],
      isEcoCertified: true,
      rating: 4.9,
      reviewCount: 342,
    },
    {
      name: 'Raw Shea Butter',
      description: 'Unrefined, pure shea butter sourced directly for your best DIY butter recipes.',
      price: 800, // KES
      imageUrls: ['https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800'],
      productType: ProductType.DIY_INGREDIENT,
      priceRange: PriceRange.BUDGET,
      categoryId: diyCategory?.id || dbCategories[0].id,
      scalpTypes: ['dry'],
      isZeroWaste: true,
      rating: 4.7,
      reviewCount: 156,
    },
    {
      name: 'Hair Bounty Clarifying Shampoo',
      description: 'Remove buildup gently and naturally. Our signature house clarifying shampoo.',
      price: 1500, // KES
      imageUrls: ['https://images.unsplash.com/photo-1556228578-8d89b6140b0a?w=800'],
      productType: ProductType.HAIR_BOUNTY_OWN,
      priceRange: PriceRange.PREMIUM,
      categoryId: shampooCategory?.id || dbCategories[0].id,
      scalpTypes: ['oily', 'normal'],
      isEcoCertified: true,
      rating: 4.8,
      reviewCount: 89,
    },
    {
      name: 'Deep Moisture Conditioner',
      description: 'Intense moisture therapy for deep conditioning your natural curls.',
      price: 1800, // KES
      imageUrls: ['https://images.unsplash.com/photo-1629363447997-76856525143a?w=800'],
      productType: ProductType.READY_MADE,
      priceRange: PriceRange.PREMIUM,
      categoryId: conditionerCategory?.id || dbCategories[0].id,
      scalpTypes: ['dry', 'normal'],
      isEcoCertified: false,
      rating: 4.6,
      reviewCount: 201,
    }
  ];

  for (const product of products) {
    const exists = await prisma.product.findFirst({ where: { name: product.name } });
    if (!exists) {
        await prisma.product.create({ data: product });
    }
  }

  console.log('✅ Products seeded');
  console.log('🎉 Explore logic seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
