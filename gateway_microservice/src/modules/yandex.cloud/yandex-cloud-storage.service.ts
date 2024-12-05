import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import { Readable } from 'stream';
import { StatusClient } from 'src/common/status';
import { WinstonLoggerService } from '../logger/logger.service';
import { AvatarUrlDTO } from './dto';

dotenv.config();

@Injectable()
export class YandexCloudStorageService {
    private readonly s3: S3Client;
    private readonly bucketName: string = process.env.NAME_BACKET;

    constructor(private readonly logger: WinstonLoggerService) {
        this.s3 = new S3Client({
            region: process.env.YC_REGION,
            endpoint: process.env.YC_ENDPOINT,
            credentials: {
                accessKeyId: process.env.YC_ACCESS_KEY_ID,
                secretAccessKey: process.env.YC_SECRET_ACCESS_KEY,
            },
        });
    }

    async getFile(fileKey: string): Promise<Buffer> {
        try {
            this.logger.debug(
                `Attempting to fetch file from Yandex Cloud Storage with key: ${fileKey}`,
            );

            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: fileKey,
            });

            const response = await this.s3.send(command);

            if (response.Body instanceof Readable) {
                const chunks: Buffer[] = [];
                for await (const chunk of response.Body) {
                    chunks.push(Buffer.from(chunk));
                }

                this.logger.log(
                    `File with key ${fileKey} fetched successfully`,
                );
                return Buffer.concat(chunks);
            }

            this.logger.warn(
                `Response body is not a readable stream for file with key: ${fileKey}`,
            );
            throw new Error(StatusClient.HTTP_STATUS_BAD_REQUEST.message);
        } catch (e) {
            this.logger.error(
                `Error while fetching file with key ${fileKey}: ${e.message}`,
                e.stack,
            );
            throw new Error(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<AvatarUrlDTO> {
        const fileKey = `${uuidv4()}-${file.originalname}`;
        try {
            this.logger.debug(
                `Attempting to upload file with key: ${fileKey} to Yandex Cloud Storage`,
            );

            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileKey,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }),
            );

            const avatarUrl = `https://storage.yandexcloud.net/${this.bucketName}/${fileKey}`;
            this.logger.log(`File uploaded successfully with key: ${fileKey}`);

            return { avatarUrl };
        } catch (e) {
            this.logger.error(
                `Error while uploading file with key ${fileKey}: ${e.message}`,
                e.stack,
            );
            throw new Error(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async deleteFile(fileKey: string): Promise<void> {
        try {
            this.logger.debug(
                `Attempting to delete file with key: ${fileKey} from Yandex Cloud Storage`,
            );

            await this.s3.send(
                new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileKey,
                }),
            );

            this.logger.log(`File with key ${fileKey} deleted successfully`);
        } catch (error) {
            this.logger.error(
                `Error while deleting file with key ${fileKey}: ${error.message}`,
                error.stack,
            );
            throw new Error(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
