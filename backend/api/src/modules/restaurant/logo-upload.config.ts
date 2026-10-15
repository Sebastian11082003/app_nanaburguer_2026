import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB is plenty for a logo, keeps disk usage sane.

/**
 * Multer options for the "upload my restaurant logo" endpoint.
 *
 * Files land on local disk under `uploads/logos/`, named
 * `<restaurantId>-<timestamp><ext>` so that:
 *  - re-uploading always produces a NEW url (busts any cached `<img>`),
 *  - two tenants can never collide on filename,
 *  - the restaurantId is visible in the filename for manual ops/debugging.
 *
 * `main.ts` serves this same `uploads/` folder statically at `/uploads/*`.
 */
export const logoUploadOptions = {
  storage: diskStorage({
    destination: './uploads/logos',
    filename: (req: Request, file, callback) => {
      const restaurantId = (req as unknown as { user?: { restaurantId?: string } }).user
        ?.restaurantId;
      const suffix = `${restaurantId ?? 'unknown'}-${Date.now()}`;
      callback(null, `${suffix}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (
    _req: Request,
    file: { mimetype: string },
    callback: FileFilterCallback,
  ) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(
        new BadRequestException(
          'Formato de imagen no soportado. Usa JPG, PNG, WEBP o GIF.',
        ),
      );
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: MAX_LOGO_SIZE_BYTES },
};
