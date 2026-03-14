import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultBadges = [
  {
    name: 'Crown Queen',
    description: 'Completed your first routine',
    iconUrl: '👑',
    requirement: JSON.stringify({ type: 'routine_count', count: 1 }),
  },
  {
    name: 'Consistency Champion',
    description: 'Maintained a 7-day streak',
    iconUrl: '🔥',
    requirement: JSON.stringify({ type: 'streak', days: 7 }),
  },
  {
    name: 'Hydration Hero',
    description: 'Completed 10 routines',
    iconUrl: '💧',
    requirement: JSON.stringify({ type: 'routine_count', count: 10 }),
  },
  {
    name: 'Hair Care Devotee',
    description: 'Maintained a 30-day streak',
    iconUrl: '✨',
    requirement: JSON.stringify({ type: 'streak', days: 30 }),
  },
  {
    name: 'Curl Keeper',
    description: 'Completed 50 routines',
    iconUrl: '🌀',
    requirement: JSON.stringify({ type: 'routine_count', count: 50 }),
  },
  {
    name: 'Strand Sensei',
    description: 'Maintained a 100-day streak',
    iconUrl: '🥋',
    requirement: JSON.stringify({ type: 'streak', days: 100 }),
  },
  {
    name: 'Growth Guru',
    description: 'Completed 100 routines',
    iconUrl: '🌱',
    requirement: JSON.stringify({ type: 'routine_count', count: 100 }),
  },
  {
    name: 'Hair Legend',
    description: 'Maintained a 365-day streak',
    iconUrl: '🏆',
    requirement: JSON.stringify({ type: 'streak', days: 365 }),
  },
  {
    name: 'Royal Treatment',
    description: 'Completed 250 routines',
    iconUrl: '💎',
    requirement: JSON.stringify({ type: 'routine_count', count: 250 }),
  },
  {
    name: 'Eternal Flourish',
    description: 'Longest streak of 500 days',
    iconUrl: '🌟',
    requirement: JSON.stringify({ type: 'longest_streak', days: 500 }),
  },
];

async function seedBadges() {
  console.log('Seeding badges...');

  for (const badge of defaultBadges) {
    const existing = await prisma.badge.findFirst({
      where: { name: badge.name },
    });

    if (!existing) {
      await prisma.badge.create({
        data: badge,
      });
      console.log(`Created badge: ${badge.name}`);
    } else {
      console.log(`Badge already exists: ${badge.name}`);
    }
  }

  console.log('Badges seeded successfully!');
}

seedBadges()
  .catch((e) => {
    console.error('Error seeding badges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
