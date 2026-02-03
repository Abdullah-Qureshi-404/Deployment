import multer, { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

export const Storage = diskStorage({
  destination: './uploads', 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage: Storage });

export async function uploadImage(files: Express.Multer.File[]) {
  if (!files?.length) {
    throw new Error('No files provided');
  }

  return files.map((file) => ({
    downloadUrl: `/uploads/${file.filename}`,
  }));
}
