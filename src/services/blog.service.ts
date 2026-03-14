import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';

export class BlogService {
  async getPosts(params: { category?: string; page?: number; limit?: number } = {}) {
    const { category, page = 1, limit = 20 } = params;
    const where: any = { isPublished: true };
    if (category) where.category = { equals: category, mode: 'insensitive' };

    const [posts, total] = await prisma.$transaction([
      prisma.blogPost.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true, slug: true, title: true, excerpt: true,
          coverUrl: true, author: true, authorAvatar: true,
          category: true, tags: true, readTime: true, publishedAt: true,
        },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return { posts, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getPost(slug: string) {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
    });
    if (!post || !post.isPublished) throw ApiError.notFound('Post not found');
    return post;
  }

  async getCategories() {
    const categories = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
    });
    return categories.map(c => c.category);
  }
}
