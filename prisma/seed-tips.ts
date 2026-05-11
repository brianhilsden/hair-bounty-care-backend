import { PrismaClient } from '@prisma/client';
import { generateText } from 'ai';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const CATEGORIES = [
  'moisture',
  'growth',
  'scalp',
  'styling',
  'ingredients',
  'seasonal',
  'protective',
];

// Hair type groups — generate per group, tag each group's values
const HAIR_TYPE_GROUPS: { label: string; types: string[]; description: string }[] = [
  {
    label: 'straight',
    types: ['TYPE_1A', 'TYPE_1B', 'TYPE_1C'],
    description: 'straight hair (Type 1A, 1B, 1C)',
  },
  {
    label: 'wavy',
    types: ['TYPE_2A', 'TYPE_2B', 'TYPE_2C'],
    description: 'wavy hair (Type 2A, 2B, 2C)',
  },
  {
    label: 'curly',
    types: ['TYPE_3A', 'TYPE_3B', 'TYPE_3C'],
    description: 'curly hair (Type 3A, 3B, 3C)',
  },
  {
    label: 'coily',
    types: ['TYPE_4A', 'TYPE_4B', 'TYPE_4C'],
    description: 'coily/kinky hair (Type 4A, 4B, 4C) — primarily for people of African descent',
  },
];

// Universal tips — applicable to all hair types
const UNIVERSAL_GROUPS: { label: string; types: string[] }[] = [
  { label: 'universal', types: [] },
];

interface GeneratedTip {
  title: string;
  body: string;
}

async function generateTips(
  category: string,
  hairDescription: string,
  count: number
): Promise<GeneratedTip[]> {
  const prompt = `Generate ${count} unique, practical hair care tips for ${hairDescription}, specifically focused on the topic of "${category}".

Rules:
- Each tip must be actionable and specific to the hair type described
- Title: max 8 words, catchy and direct
- Body: exactly 1-2 sentences, max 30 words total, conversational tone
- Focus: "${category}" — moisture = hydration & moisture retention; growth = length retention & growth; scalp = scalp health & care; styling = techniques & style tips; ingredients = what ingredients to use/avoid; seasonal = adapting care by weather/season; protective = protective styles & methods
- No fluff, no filler words
- Do NOT number the tips

Respond with ONLY a valid JSON array, no markdown, no explanation:
[{"title": "...", "body": "..."}, ...]`;

  const result = await generateText({
    model: 'openai/gpt-4.1-mini',
    prompt,
    maxOutputTokens: 2000,
    temperature: 0.8,
  });

  const text = result.text.trim();
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

  const parsed: GeneratedTip[] = JSON.parse(cleaned);
  if (!Array.isArray(parsed)) throw new Error('AI did not return an array');
  return parsed;
}

async function seedGroup(
  category: string,
  types: string[],
  goals: string[],
  hairDescription: string,
  count: number
) {
  console.log(`  Generating ${count} tips: [${category}] for ${hairDescription}...`);

  let tips: GeneratedTip[];
  try {
    tips = await generateTips(category, hairDescription, count);
  } catch (err) {
    console.error(`  ✗ Failed to generate tips for [${category}] ${hairDescription}:`, err);
    return 0;
  }

  let inserted = 0;
  for (const tip of tips) {
    if (!tip.title || !tip.body) continue;
    try {
      await prisma.hairTip.create({
        data: {
          title: tip.title.trim(),
          body: tip.body.trim(),
          category,
          targetHairTypes: types,
          targetGoals: goals,
          targetPorosity: [],
          isActive: true,
        },
      });
      inserted++;
    } catch (err) {
      console.error(`  ✗ Insert failed for tip "${tip.title}":`, err);
    }
  }

  console.log(`  ✓ Inserted ${inserted}/${tips.length} tips`);
  return inserted;
}

async function main() {
  console.log('\n🌱 Seeding hair tips...\n');

  // Deactivate existing tips so re-runs don't duplicate — or skip if you want additive seeding
  const existing = await prisma.hairTip.count();
  if (existing > 0) {
    console.log(`ℹ️  ${existing} tips already in DB. Deactivating old tips before re-seeding...`);
    await prisma.hairTip.updateMany({ data: { isActive: false } });
  }

  let total = 0;

  // Hair-type-specific tips: 30 per category × 4 groups = 840
  for (const group of HAIR_TYPE_GROUPS) {
    console.log(`\n📋 Hair type group: ${group.label}`);
    for (const category of CATEGORIES) {
      const count = await seedGroup(category, group.types, [], group.description, 30);
      total += count;
    }
  }

  // Universal tips: 10 per category = 70
  console.log('\n📋 Universal tips (all hair types)');
  for (const category of CATEGORIES) {
    const count = await seedGroup(
      category,
      [],
      [],
      'all hair types universally',
      10
    );
    total += count;
  }

  console.log(`\n✅ Done. Total tips inserted: ${total}\n`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
