import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { StatusClient } from 'src/common/status';
import {
    ContentService as ContentClientService,
    DeleteAvatarUserRequest,
    DeleteAvatarUserResponse,
    FindUserAvatarArrayRequest,
    FindUserAvatarArrayResponse,
    FindUserAvatarRequest,
    FindUserAvatarResponse,
    UploadAvatarUserRequest,
    UploadAvatarUserResponse,
} from 'src/protos/proto_gen_files/content';
import { YandexCloudStorageService } from './yandex-cloud-storage.service';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { grpcClientOptionsContent } from 'src/config/grpc/grpc.options';
import { from, lastValueFrom } from 'rxjs';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class AvatarProvider implements OnModuleInit {
    @Client(grpcClientOptionsContent)
    private readonly contentClient: ClientGrpc;

    private contentMicroservice: ContentClientService;

    private readonly logger: WinstonLoggerService;

    constructor(private readonly storageService: YandexCloudStorageService) {}

    onModuleInit() {
        this.contentMicroservice =
            this.contentClient.getService<ContentClientService>(
                'ContentService',
            );
    }

    async UploadAvatarUser(
        payload: UploadAvatarUserRequest,
    ): Promise<UploadAvatarUserResponse> {
        const { userId, avatarUrl } = payload;

        this.logger.log(
            `UploadAvatarUser: Received payload - userId: ${userId}, avatarUrl: ${avatarUrl}`,
        );

        try {
            const { message, status } = await lastValueFrom(
                from(
                    this.contentMicroservice.UploadAvatarUser({
                        userId,
                        avatarUrl,
                    }),
                ),
            );

            if (!message || !avatarUrl) {
                this.logger.error(
                    `UploadAvatarUser: Failed with missing message or avatarUrl.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `UploadAvatarUser: Success - message: ${message}, status: ${status}`,
            );
            return { message, status };
        } catch (e) {
            this.logger.error(
                `UploadAvatarUser: Error - ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async FindUserAvatarArray(
        payload: FindUserAvatarArrayRequest,
    ): Promise<FindUserAvatarArrayResponse> {
        const { userId } = payload;

        this.logger.log(
            `FindUserAvatarArray: Received payload - userId: ${userId}`,
        );

        try {
            const { message, status, data } = await lastValueFrom(
                from(this.contentMicroservice.FindUserAvatarArray({ userId })),
            );

            if (!message || !status) {
                this.logger.error(
                    `FindUserAvatarArray: Failed with missing message or status.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                this.logger.warn(
                    `FindUserAvatarArray: No data found for userId: ${userId}`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `FindUserAvatarArray: Success - message: ${message}, status: ${status}, data length: ${data.length}`,
            );
            return { message, status, data };
        } catch (e) {
            this.logger.error(
                `FindUserAvatarArray: Error - ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async FindUserAvatar(
        payload: FindUserAvatarRequest,
    ): Promise<FindUserAvatarResponse> {
        const { userId, avatarId } = payload;

        this.logger.log(
            `FindUserAvatar: Received payload - userId: ${userId}, avatarId: ${avatarId}`,
        );

        try {
            const { message, status, data } = await lastValueFrom(
                from(
                    this.contentMicroservice.FindUserAvatar({
                        userId,
                        avatarId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error(
                    `FindUserAvatar: Failed with missing message or status.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                this.logger.warn(
                    `FindUserAvatar: No data found for userId: ${userId}, avatarId: ${avatarId}`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `FindUserAvatar: Success - message: ${message}, status: ${status}, data: ${JSON.stringify(data)}`,
            );
            return { message, status, data };
        } catch (e) {
            this.logger.error(`FindUserAvatar: Error - ${e.message}`, e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async DeleteAvatarUser(
        payload: DeleteAvatarUserRequest,
    ): Promise<DeleteAvatarUserResponse> {
        const { userId, avatarId } = payload;

        this.logger.log(
            `DeleteAvatarUser: Received payload - userId: ${userId}, avatarId: ${avatarId}`,
        );

        try {
            const { message, status } = await lastValueFrom(
                from(
                    this.contentMicroservice.DeleteAvatarUser({
                        userId,
                        avatarId,
                    }),
                ),
            );

            if (!message || !avatarId) {
                this.logger.error(
                    `DeleteAvatarUser: Failed with missing message or avatarId.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `DeleteAvatarUser: Success - message: ${message}, status: ${status}`,
            );
            return { message, status };
        } catch (e) {
            this.logger.error(
                `DeleteAvatarUser: Error - ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
