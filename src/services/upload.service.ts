import cloudinary from '../config/cloudinary';
import { ApiError } from '../utils/apiError';
import streamifier from 'streamifier';

export class UploadService {
  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'hair-bounty'
  ): Promise<{ url: string; publicId: string }> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [
              { width: 1000, height: 1000, crop: 'limit' }, // Max dimensions
              { quality: 'auto' }, // Auto quality
              { fetch_format: 'auto' }, // Auto format
            ],
          },
          (error, result) => {
            if (error) {
              reject(new ApiError(500, 'Image upload failed'));
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              });
            }
          }
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    } catch (error) {
      throw new ApiError(500, 'Image upload failed');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      // Don't throw error, just log it
    }
  }
}
