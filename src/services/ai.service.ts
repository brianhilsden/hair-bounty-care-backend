import { generateText } from 'ai';
import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface HairContext {
  firstName: string;
  hairProfile: {
    curlPattern?: string | null;
    density?: string | null;
    porosity?: string | null;
    strandThickness?: string | null;
    scalpType?: string | null;
    goals?: string[];
  } | null;
  streakDays: number;
}

function buildSystemPrompt(ctx: HairContext): string {
  const profile = ctx.hairProfile;

  const hairInfo = profile
    ? [
        profile.curlPattern && `Hair type: ${profile.curlPattern.replace(/_/g, ' ')}`,
        profile.density && `Density: ${profile.density.toLowerCase()}`,
        profile.porosity && `Porosity: ${profile.porosity.toLowerCase()}`,
        profile.strandThickness && `Strand thickness: ${profile.strandThickness.toLowerCase()}`,
        profile.scalpType && `Scalp type: ${profile.scalpType}`,
        profile.goals?.length && `Hair goals: ${profile.goals.join(', ')}`,
      ]
        .filter(Boolean)
        .join('\n')
    : 'Hair profile not yet completed.';

  return `You are Aria, the personal AI hair advisor for Hair Bounty Care — a premium hair care app for people of African descent and all curl patterns.

You are warm, encouraging, knowledgeable, and speak like a trusted friend who happens to be a professional trichologist and stylist. You use simple language, avoid jargon unless you explain it, and always end advice with an encouraging note.

USER PROFILE:
- Name: ${ctx.firstName}
- Current streak: ${ctx.streakDays} days
${hairInfo}

YOUR CAPABILITIES:
1. Personalized hairstyle guidance based on their specific hair type above
2. Product advice — you know about Hair Bounty Care's product catalog (oils, butters, serums, shampoos, conditioners, deep conditioners, edge control, curl creams)
3. Routine building — morning, night, wash day, protective style routines
4. Ingredient education — what ingredients do and which to avoid for their hair type
5. Hair diagnosis — help identify causes of breakage, dryness, stunted growth, frizz, etc.
6. Styling tutorials — step-by-step protective styles, twist outs, braid outs, wash and go, etc.
7. Scalp health — dandruff, build-up, itchiness, seborrheic dermatitis guidance
8. Growth tips — retention, length checks, trimming, protective styling
9. Seasonal hair care — adapting routines for weather changes
10. DIY recipes — natural hair masks, hot oil treatments, rice water rinses

RULES:
- Always personalize advice to their hair profile when available
- When recommending products, mention Hair Bounty Care's products where relevant
- Never diagnose medical conditions — always refer to a dermatologist for serious concerns
- Keep responses concise (2–4 short paragraphs max) unless they ask for a detailed routine
- Use emojis sparingly but warmly ✨
- Format lists clearly when giving step-by-step instructions
- If the user has no hair profile yet, gently encourage them to complete their quiz for better advice`;
}

export async function getChatResponse(
  userId: string,
  messages: ChatMessage[],
  conversationId?: string
): Promise<{ reply: string; conversationId: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, streaks: true },
  });

  if (!user) throw ApiError.notFound('User not found');

  const ctx: HairContext = {
    firstName: user.firstName,
    hairProfile: user.profile
      ? {
          curlPattern: user.profile.curlPattern,
          density: user.profile.density,
          porosity: user.profile.porosity,
          strandThickness: user.profile.strandThickness,
          scalpType: user.profile.scalpType,
          goals: user.profile.goals as string[],
        }
      : null,
    streakDays: user.streaks?.currentStreak || 0,
  };

  const systemPrompt = buildSystemPrompt(ctx);

  let reply: string;
  try {
    const result = await generateText({
      model: 'openai/gpt-4.1-mini',
      system: systemPrompt,
      messages: messages.slice(-10),
      maxOutputTokens: 600,
      temperature: 0.7,
    });
    reply = result.text;
    if (!reply) throw new Error('Empty response');
  } catch (err: any) {
    console.error('[AI Service] Error:', err?.message || err);
    throw ApiError.internal('AI service temporarily unavailable');
  }

  // Persist conversation + messages
  const lastUserMessage = messages[messages.length - 1];
  const title = lastUserMessage?.content?.slice(0, 60) || 'Hair advice';

  let conversation: { id: string };

  if (conversationId) {
    // Verify it belongs to this user
    const existing = await prisma.aiConversation.findUnique({
      where: { id: conversationId },
      select: { id: true, userId: true, messages: { select: { order: true }, orderBy: { order: 'desc' }, take: 1 } },
    });
    if (!existing || existing.userId !== userId) {
      throw ApiError.notFound('Conversation not found');
    }
    conversation = existing;

    const nextOrder = (existing.messages[0]?.order ?? -1) + 1;
    // Append the new user message + assistant reply
    await prisma.$transaction([
      prisma.aiMessage.create({
        data: {
          conversationId: existing.id,
          role: 'user',
          content: lastUserMessage.content,
          order: nextOrder,
        },
      }),
      prisma.aiMessage.create({
        data: {
          conversationId: existing.id,
          role: 'assistant',
          content: reply,
          order: nextOrder + 1,
        },
      }),
      prisma.aiConversation.update({
        where: { id: existing.id },
        data: { updatedAt: new Date() },
      }),
    ]);
  } else {
    // New conversation — save ALL messages + reply
    const allMessages = [
      ...messages,
      { role: 'assistant' as const, content: reply },
    ];
    conversation = await prisma.aiConversation.create({
      data: {
        userId,
        title,
        messages: {
          create: allMessages.map((m, i) => ({
            role: m.role,
            content: m.content,
            order: i,
          })),
        },
      },
    });
  }

  return { reply, conversationId: conversation.id };
}

export async function getConversations(userId: string) {
  return prisma.aiConversation.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 30,
    select: {
      id: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { order: 'desc' },
        take: 1,
        select: { content: true, role: true },
      },
    },
  });
}

export async function getConversation(userId: string, conversationId: string) {
  const conv = await prisma.aiConversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { order: 'asc' } },
    },
  });
  if (!conv || conv.userId !== userId) throw ApiError.notFound('Conversation not found');
  return conv;
}

export async function deleteConversation(userId: string, conversationId: string) {
  const conv = await prisma.aiConversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conv || conv.userId !== userId) throw ApiError.notFound('Conversation not found');
  await prisma.aiConversation.delete({ where: { id: conversationId } });
}
