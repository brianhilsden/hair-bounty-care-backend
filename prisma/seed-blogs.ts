import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Blogs...');

  const posts = [
    {
      slug: 'how-to-determine-your-hair-porosity',
      title: 'How to Determine Your Hair Porosity and Why It Matters',
      excerpt: 'Struggling with moisture retention? Understanding your hair porosity is the first step to a better routine.',
      content: 'Hair porosity refers to your hair\'s ability to absorb and retain moisture. It is generally categorized into three levels: low, normal, and high. \n\n### Low Porosity\nLow porosity hair has a tightly bound cuticle layer with overlapping scales that lie flat. This makes it difficult for moisture to penetrate, but once it\'s in, it stays.\n\n### Normal Porosity\nNormal porosity hair requires the least amount of maintenance. The cuticle layer is looser, allowing just the right amount of moisture to enter while preventing too much from escaping.\n\n### High Porosity\nHigh porosity hair has gaps and holes in the cuticle, which let moisture out as easily as it lets it in. This hair type is prone to frizz and tangling in humid weather.',
      coverUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=800',
      author: 'Jane Doe',
      authorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1baf8a?w=400',
      category: 'Hair Science',
      tags: ['porosity', 'moisture', 'routine'],
      readTime: 5,
    },
    {
      slug: '5-essential-diy-hair-masks',
      title: '5 Essential DIY Hair Masks for Natural Hair',
      excerpt: 'Revitalize your curls with these easy-to-make, all-natural hair mask recipes you can whip up in your kitchen.',
      content: 'Sometimes the best ingredients for your hair are sitting right in your pantry. Here are 5 DIY masks to try this weekend:\n\n1. **Avocado & Honey Mask**: Great for intense hydration.\n2. **Aloe Vera & Castor Oil**: Perfect for scalp stimulation and growth.\n3. **Banana & Coconut Milk**: Excellent for softening and detangling.\n4. **Yogurt & Egg**: A protein boost for weakened strands.\n5. **Apple Cider Vinegar Rinse**: Best for clarifying and restoring pH balance.',
      coverUrl: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?w=800',
      author: 'Sarah Jenkins',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      category: 'DIY Recipes',
      tags: ['diy', 'masks', 'natural'],
      readTime: 4,
    },
    {
      slug: 'protective-styling-tips-for-winter',
      title: 'Protective Styling Tips for Winter',
      excerpt: 'Keep your ends tucked away and your moisture locked in during the harsh winter months.',
      content: 'Winter air can be incredibly dry, sucking the moisture right out of your tresses. Protective styling is crucial during these months.\n\n- **Bantu Knots**: A great low-manipulation style.\n- **Box Braids**: Classic and versatile, but don\'t keep them in for more than 6-8 weeks.\n- **Wigs**: The ultimate protective style, allowing you to continually moisturize your natural hair underneath.',
      coverUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
      author: 'Aisha Thompson',
      authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
      category: 'Styling',
      tags: ['protective styling', 'winter', 'braids'],
      readTime: 6,
    }
  ];

  for (const post of posts) {
    const exists = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (!exists) {
        await prisma.blogPost.create({ data: post });
    }
  }

  console.log('✅ Blogs seeded');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
