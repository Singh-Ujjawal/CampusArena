/**
 * Cloudinary Upload Utility
 * Handles unsigned uploads to Cloudinary for registration form images
 * 
 * Configuration:
 * - CLOUDINARY_CLOUD_NAME: Must be set in .env.local or environment
 * - CLOUDINARY_PRESET: campusarena (configured in Cloudinary)
 * - CLOUDINARY_FOLDER: campusarena/registration-form (preset folder)
 */

// Get from environment or default (user must set VITE_CLOUDINARY_CLOUD_NAME)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_PRESET = 'campusarena';
const CLOUDINARY_FOLDER = 'campusarena/registration-form';
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  error?: string;
}

/**
 * Validate Cloudinary configuration
 */
function validateConfig(): { valid: boolean; error?: string } {
  if (!CLOUDINARY_CLOUD_NAME) {
    return { 
      valid: false, 
      error: 'Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME environment variable.' 
    };
  }
  return { valid: true };
}

/**
 * Validate image file before upload
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 2MB' };
  }

  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, JPEG, and PNG images are allowed' };
  }

  return { valid: true };
}

/**
 * Upload image to Cloudinary unsigned
 * Returns secure_url and public_id on success
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  try {
    // Validate configuration first
    const configCheck = validateConfig();
    if (!configCheck.valid) {
      return { secure_url: '', public_id: '', error: configCheck.error };
    }

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return { secure_url: '', public_id: '', error: validation.error };
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_PRESET);
    formData.append('folder', CLOUDINARY_FOLDER);

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_API_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        secure_url: '',
        public_id: '',
        error: errorData.error?.message || 'Upload failed',
      };
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      secure_url: '',
      public_id: '',
      error: 'Upload failed. Please try again.',
    };
  }
}

/**
 * Get Cloudinary cloud name
 */
export function getCloudinaryCloudName(): string {
  return CLOUDINARY_CLOUD_NAME;
}
