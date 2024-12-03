import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import * as dotenv from 'dotenv';
dotenv.config();

export const multerOptions: MulterOptions = {
    storage: multer.memoryStorage(),
    limits: { fieldSize: +process.env.FILE_SIZE * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
            return cb(new Error('file is not image'), false);
        }
        cb(null, true);
    },
};
