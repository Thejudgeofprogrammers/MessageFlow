import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { StatusClient } from 'src/common/status';
import {
    ContentService as ContentInterface,
    DeleteAvatarUserRequest,
    DeleteAvatarUserResponse,
    FindUserAvatarArrayRequest,
    FindUserAvatarArrayResponse,
    FindUserAvatarRequest,
    FindUserAvatarResponse,
    UploadAvatarUserRequest,
    UploadAvatarUserResponse,
} from 'src/protos/proto_gen_files/content';

@Injectable()
export class AvatarUserContentService implements ContentInterface {
    @GrpcMethod('ContentService', 'UploadAvatarUser')
    async UploadAvatarUser(
        request: UploadAvatarUserRequest,
    ): Promise<UploadAvatarUserResponse> {
        try {
            const { avatarUrl, userId } = request;
            if (!avatarUrl || !userId) {
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            const { message, status } =
                await this.prismaService.uploadAvatarUser({
                    avatarUrl,
                    userId,
                });

            if (!message || !status) {
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                );
            }

            return { message, status };
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    @GrpcMethod('ContentService', 'FindUserAvatarArray')
    async FindUserAvatarArray(
        request: FindUserAvatarArrayRequest,
    ): Promise<FindUserAvatarArrayResponse> {
        try {
            const { userId } = request;
            if (!userId) {
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            const { message, status, data } =
                await this.prismaService.findUserAvatarArray({
                    userId,
                });

            if (!message && !status) {
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            return { message, status, data };
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    @GrpcMethod('ContentService', 'FindUserAvatar')
    async FindUserAvatar(
        request: FindUserAvatarRequest,
    ): Promise<FindUserAvatarResponse> {
        try {
            const { avatarId, userId } = request;

            if (!avatarId || !userId) {
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            const { message, status, data } =
                await this.prismaService.findUserAvatar({
                    avatarId,
                    userId,
                });

            if (!message && !status) {
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            return { message, status, data };
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    @GrpcMethod('ContentService', 'DeleteAvatarUser')
    async DeleteAvatarUser(
        request: DeleteAvatarUserRequest,
    ): Promise<DeleteAvatarUserResponse> {
        try {
            const { userId, avatarId } = request;
            if (!userId || !avatarId) {
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            const { message, status } =
                await this.prismaService.deleteAvatarUser({
                    userId,
                    avatarId,
                });

            if (!message || !status) {
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            return { message, status };
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
