import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '../../convex/_generated/dataModel';

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

const httpClient = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL as string);

export const useImageUpload = (_folder: string = 'menu-images') => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

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

      // Read file once to avoid Safari/iOS losing the File reference mid-upload
      const arrayBuffer = await file.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: contentType });

      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': contentType },
        body: blob,
      });
      if (!res.ok) {
        throw new Error(`Upload failed: ${res.status} ${res.statusText}`);
      }
      const { storageId } = (await res.json()) as { storageId: Id<'_storage'> };

      const publicUrl = await httpClient.query(api.files.getUrl, { storageId });
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
    // Convex storage IDs aren't stored on entities (we only keep the public URL),
    // so deleting by URL is a no-op. Files become orphaned when a record is removed
    // but don't block functionality. Add a storageId column if reclamation is needed.
  };

  return {
    uploadImage,
    deleteImage,
    uploading,
    uploadProgress,
  };
};
