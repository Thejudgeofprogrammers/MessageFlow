import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StatusClient } from 'src/common/status';
import {
    DeleteAvatarUserRequest,
    DeleteAvatarUserResponse,
    FindUserAvatarArrayRequest,
    FindUserAvatarArrayResponse,
    FindUserAvatarRequest,
    FindUserAvatarResponse,
    UploadAvatarUserRequest,
    UploadAvatarUserResponse,
} from 'src/protos/proto_gen_files/user';
import { YandexCloudStorageService } from './yandex-cloud-storage.service';

@Injectable()
export class AvatarProvider {
    constructor(private readonly storageService: YandexCloudStorageService) {}

    async UploadAvatarUser(
        request: UploadAvatarUserRequest,
    ): Promise<UploadAvatarUserResponse> {
        try {
            return;
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async FindUserAvatarArray(
        request: FindUserAvatarArrayRequest,
    ): Promise<FindUserAvatarArrayResponse> {
        try {
            return;
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async FindUserAvatar(
        request: FindUserAvatarRequest,
    ): Promise<FindUserAvatarResponse> {
        try {
            return;
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async DeleteAvatarUser(
        request: DeleteAvatarUserRequest,
    ): Promise<DeleteAvatarUserResponse> {
        try {
            return;
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
