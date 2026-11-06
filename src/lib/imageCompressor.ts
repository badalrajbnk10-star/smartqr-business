/**
 * SMARTQR BUSINESS - Client-Side Direct Photo Compressor
 * Converts direct camera snaps, gallery photos, and device files (JPEG, PNG, WebP)
 * into lightweight base64 Data URLs so owners never have to deal with image links.
 */

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeKb: number;
}

export async function compressImageFile(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/jpeg' | 'image/webp' | 'image/png';
  } = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.82,
    format = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG, read as data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        resolve({
          dataUrl,
          width: 200,
          height: 200,
          sizeKb: Math.round(file.size / 1024),
        });
      };
      reader.onerror = () => reject(new Error('Failed to read SVG file.'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const rawUrl = event.target?.result as string;
          resolve({
            dataUrl: rawUrl,
            width: img.width,
            height: img.height,
            sizeKb: Math.round(file.size / 1024),
          });
          return;
        }

        // Fill background with white for transparent images when exporting to JPEG
        if (format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL(format, quality);
        const approxBytes = Math.round((dataUrl.length * 3) / 4);
        const sizeKb = Math.round(approxBytes / 1024);

        resolve({
          dataUrl,
          width: canvas.width,
          height: canvas.height,
          sizeKb,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to parse selected image. Please choose a valid JPG, PNG, or WebP photo.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Could not read image file from device.'));
    };

    reader.readAsDataURL(file);
  });
}
