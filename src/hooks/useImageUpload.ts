import { useState } from 'react';
import { supabase } from '../lib/supabase';

const VALID_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'tif',
  'svg', 'heic', 'heif', 'ico', 'avif', 'jfif',
];

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  svg: 'image/svg+xml',
  heic: 'image/heic',
  heif: 'image/heif',
  ico: 'image/x-icon',
  avif: 'image/avif',
};

export const useImageUpload = (_folder: string = 'menu-images') => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const bucket = _folder;

  const uploadImage = async (file: File): Promise<string> => {
    let progressInterval: ReturnType<typeof setInterval> | null = null;
    try {
      setUploading(true);
      setUploadProgress(0);

      const ext = file.name.split('.').pop()?.toLowerCase();
      const hasValidExt = !!ext && VALID_EXTENSIONS.includes(ext);
      const hasValidMime = !file.type || file.type.startsWith('image/');
      if (!hasValidExt && !hasValidMime) {
        throw new Error(
          `Please upload a valid image file. File type: ${file.type || 'unknown'}, Extension: ${ext || 'none'}`,
        );
      }
      const contentType = file.type || (ext ? MIME_BY_EXT[ext] : '') || 'image/jpeg';

      if (file.size < 100) {
        throw new Error('The selected file appears to be invalid or empty. Please select a valid image.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`Image size must be less than 10MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      }

      progressInterval = setInterval(() => {
        setUploadProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 100);

      const safeExt = ext || 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { contentType, upsert: true });
      if (uploadErr) {
        throw new Error(`Upload failed: ${uploadErr.message}`);
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      const publicUrl = data?.publicUrl;
      if (!publicUrl) throw new Error('Upload succeeded but URL could not be retrieved.');

      setUploadProgress(100);
      return publicUrl;
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const deleteImage = async (_imageUrl: string): Promise<void> => {
    // No-op: we only store the public URL, so reverse-mapping to a storage path
    // would require parsing the URL. Files become orphaned when a record is removed
    // but don't block functionality.
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress,
  };
};
