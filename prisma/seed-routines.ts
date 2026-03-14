import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoutines = [
  {
    name: 'Crown Hydration',
    icon: '💧',
    description: 'Deep moisture treatment to keep your crown hydrated and healthy',
    category: 'hydrating',
    isDefault: true,
  },
  {
    name: 'Silk Refresh',
    icon: '✨',
    description: 'Light moisturizing spray to refresh your curls throughout the day',
    category: 'moisturizing',
    isDefault: true,
  },
  {
    name: 'Royal Oil Treatment',
    icon: '👑',
    description: 'Nourishing oil massage for your scalp and strands',
    category: 'oiling',
    isDefault: true,
  },
  {
    name: 'Curl Revival',
    icon: '🌀',
    description: 'Define and revive your curl pattern with this technique',
    category: 'styling',
    isDefault: true,
  },
  {
    name: 'Gentle Cleanse',
    icon: '🧼',
    description: 'Wash day routine to cleanse without stripping natural oils',
    category: 'washing',
    isDefault: true,
  },
  {
    name: 'Night Protection',
    icon: '🌙',
    description: 'Protect your hair overnight with proper wrapping or bonnet',
    category: 'protection',
    isDefault: true,
  },
  {
    name: 'Scalp Massage',
    icon: '💆',
    description: 'Stimulate hair growth with gentle scalp massage',
    category: 'massage',
    isDefault: true,
  },
  {
    name: 'Deep Condition',
    icon: '🥥',
    description: 'Intensive conditioning treatment for maximum softness',
    category: 'conditioning',
    isDefault: true,
  },
];

async function seedRoutines() {
  console.log('Seeding routine templates...');

  for (const routine of defaultRoutines) {
    const existing = await prisma.routineTemplate.findFirst({
      where: { name: routine.name },
    });

    if (!existing) {
      await prisma.routineTemplate.create({
        data: routine,
      });
      console.log(`Created routine: ${routine.name}`);
    } else {
      console.log(`Routine already exists: ${routine.name}`);
    }
  }

  console.log('Routine templates seeded successfully!');
}

seedRoutines()
  .catch((e) => {
    console.error('Error seeding routines:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
