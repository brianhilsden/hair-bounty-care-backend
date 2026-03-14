import { prisma } from '../config/database';
import { ApiError } from '../utils/apiError';
import type { CreateHairProfileInput, UpdateHairProfileInput } from '../validations/profile.validation';

export class ProfileService {
  async createProfile(userId: string, data: CreateHairProfileInput) {
    // Check if profile already exists
    const existingProfile = await prisma.hairProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw ApiError.conflict('Hair profile already exists');
    }

    // Separate user fields from profile fields
    const { ageGroup, gender, ...profileData } = data as any;

    // Create profile
    const profile = await prisma.hairProfile.create({
      data: {
        userId,
        ...profileData,
      },
    });

    // Update user with ageGroup and gender, and mark as onboarded
    await prisma.user.update({
      where: { id: userId },
      data: {
        isOnboarded: true,
        ...(ageGroup && { ageGroup }),
        ...(gender && { gender }),
      },
    });

    return profile;
  }

  async getProfile(userId: string) {
    const profile = await prisma.hairProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw ApiError.notFound('Hair profile not found');
    }

    return profile;
  }

  async updateProfile(userId: string, data: UpdateHairProfileInput) {
    const profile = await prisma.hairProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw ApiError.notFound('Hair profile not found');
    }

    // Separate user fields from profile fields
    const { ageGroup, gender, ...profileData } = data as any;
    
    // Update user fields if provided
    if (ageGroup || gender) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          ...(ageGroup && { ageGroup }),
          ...(gender && { gender }),
        },
      });
    }

    return await prisma.hairProfile.update({
      where: { userId },
      data: profileData,
    });
  }

  async deleteProfile(userId: string) {
    const profile = await prisma.hairProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw ApiError.notFound('Hair profile not found');
    }

    await prisma.hairProfile.delete({
      where: { userId },
    });

    // Mark user as not onboarded
    await prisma.user.update({
      where: { id: userId },
      data: { isOnboarded: false },
    });
  }

  async getHairTypeDefinitions() {
    return {
      curlPatterns: {
        TYPE_1A: { name: 'Type 1A', description: 'Straight, fine hair with no wave pattern', image: '1A' },
        TYPE_1B: { name: 'Type 1B', description: 'Straight, medium texture with slight body', image: '1B' },
        TYPE_1C: { name: 'Type 1C', description: 'Straight, coarse hair that is hard to curl', image: '1C' },
        TYPE_2A: { name: 'Type 2A', description: 'Wavy, fine hair with slight S-pattern', image: '2A' },
        TYPE_2B: { name: 'Type 2B', description: 'Wavy, medium texture with defined S-pattern', image: '2B' },
        TYPE_2C: { name: 'Type 2C', description: 'Wavy, coarse hair with well-defined S-pattern', image: '2C' },
        TYPE_3A: { name: 'Type 3A', description: 'Curly, loose curls like wide spirals', image: '3A' },
        TYPE_3B: { name: 'Type 3B', description: 'Curly, medium curls like tight spirals', image: '3B' },
        TYPE_3C: { name: 'Type 3C', description: 'Curly, tight curls with corkscrew pattern', image: '3C' },
        TYPE_4A: { name: 'Type 4A', description: 'Coily, soft defined coils', image: '4A' },
        TYPE_4B: { name: 'Type 4B', description: 'Coily, wiry Z-pattern coils', image: '4B' },
        TYPE_4C: { name: 'Type 4C', description: 'Coily, tight zig-zag pattern with shrinkage', image: '4C' },
      },
      density: {
        LOW: { name: 'Low Density', description: 'You can easily see your scalp through your hair' },
        MEDIUM: { name: 'Medium Density', description: 'Your scalp is somewhat visible through your hair' },
        HIGH: { name: 'High Density', description: 'Your scalp is barely visible through your hair' },
      },
      porosity: {
        LOW: { name: 'Low Porosity', description: 'Hair cuticles are tightly closed, takes long to absorb moisture' },
        NORMAL: { name: 'Normal Porosity', description: 'Hair absorbs and retains moisture well' },
        HIGH: { name: 'High Porosity', description: 'Hair cuticles are open, absorbs moisture quickly but loses it fast' },
      },
      strandThickness: {
        FINE: { name: 'Fine', description: 'Individual strands are thin and delicate' },
        MEDIUM: { name: 'Medium', description: 'Individual strands have average thickness' },
        THICK: { name: 'Thick', description: 'Individual strands are wide and strong' },
      },
      scalpTypes: [
        { value: 'oily', label: 'Oily', description: 'Scalp gets greasy quickly' },
        { value: 'dry', label: 'Dry', description: 'Scalp feels tight and flaky' },
        { value: 'normal', label: 'Normal', description: 'Balanced scalp, not too oily or dry' },
        { value: 'combination', label: 'Combination', description: 'Oily roots, dry ends' },
      ],
      faceShapes: [
        { value: 'oval', label: 'Oval' },
        { value: 'round', label: 'Round' },
        { value: 'square', label: 'Square' },
        { value: 'heart', label: 'Heart' },
        { value: 'oblong', label: 'Oblong' },
      ],
    };
  }
}
