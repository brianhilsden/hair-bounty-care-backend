import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class CommunityService {
  // ─── Groups ────────────────────────────────────────────────

  async getGroups(userId: string) {
    const groups = await prisma.communityGroup.findMany({
      orderBy: { memberCount: 'desc' },
    });

    const memberships = await prisma.communityMember.findMany({
      where: { userId, groupId: { in: groups.map(g => g.id) } },
      select: { groupId: true },
    });
    const joinedIds = new Set(memberships.map(m => m.groupId));

    return groups.map(g => ({ ...g, isJoined: joinedIds.has(g.id) }));
  }

  async getGroup(groupId: string, userId: string) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw ApiError.notFound('Group not found');

    const membership = await prisma.communityMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });

    return { ...group, isJoined: !!membership };
  }

  async joinGroup(groupId: string, userId: string) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw ApiError.notFound('Group not found');

    const existing = await prisma.communityMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (existing) throw ApiError.conflict('Already a member');

    await prisma.$transaction([
      prisma.communityMember.create({ data: { userId, groupId } }),
      prisma.communityGroup.update({
        where: { id: groupId },
        data: { memberCount: { increment: 1 } },
      }),
    ]);

    return { joined: true };
  }

  async leaveGroup(groupId: string, userId: string) {
    const existing = await prisma.communityMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!existing) throw ApiError.notFound('Not a member');

    await prisma.$transaction([
      prisma.communityMember.delete({
        where: { userId_groupId: { userId, groupId } },
      }),
      prisma.communityGroup.update({
        where: { id: groupId },
        data: { memberCount: { decrement: 1 } },
      }),
    ]);

    return { left: true };
  }

  // ─── Posts ─────────────────────────────────────────────────

  async getGroupPosts(groupId: string, userId: string) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw ApiError.notFound('Group not found');

    const posts = await prisma.communityPost.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // isLiked placeholder — no PostLike table yet, always false
    return posts.map(p => ({ ...p, isLiked: false }));
  }

  async createPost(groupId: string, userId: string, data: { content: string; imageUrls?: string[] }) {
    const membership = await prisma.communityMember.findUnique({
      where: { userId_groupId: { userId, groupId } },
    });
    if (!membership) throw ApiError.forbidden('You must join the group to post');

    const post = await prisma.communityPost.create({
      data: {
        userId,
        groupId,
        content: data.content,
        imageUrls: data.imageUrls ?? [],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return { ...post, isLiked: false };
  }

  async likePost(postId: string, _userId: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw ApiError.notFound('Post not found');

    // Simple increment — no per-user tracking yet (no PostLike model)
    const updated = await prisma.communityPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
    });

    return { likes: updated.likes };
  }

  // ─── Chat ──────────────────────────────────────────────────

  async getMessages(groupId: string, params: { page?: number; limit?: number }) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw ApiError.notFound('Group not found');

    const limit = params.limit ?? 50;
    const page = params.page ?? 1;

    const messages = await prisma.chatMessage.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      skip: (page - 1) * limit,
    });

    return messages;
  }

  async sendMessage(groupId: string, userId: string, content: string, imageUrl?: string) {
    const group = await prisma.communityGroup.findUnique({ where: { id: groupId } });
    if (!group) throw ApiError.notFound('Group not found');

    const message = await prisma.chatMessage.create({
      data: { groupId, userId, content, imageUrl },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    return message;
  }
}
