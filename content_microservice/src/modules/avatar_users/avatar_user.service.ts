import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { promCondition, StatusClient } from 'src/common/status';
import {
    AvatarData,
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
import { WinstonLoggerService } from '../logger/logger.service';
import { CassandraService } from '../cassandra/cassandra.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class AvatarUserContentService implements ContentInterface {
    constructor(
        private readonly cassandraService: CassandraService,
        private readonly logger: WinstonLoggerService,

        @InjectMetric('UPLOAD_AVATAR_USER_TOTAL')
        private readonly uploadAvatarUserTotal: Counter<string>,

        @InjectMetric('UPLOAD_AVATAR_USER_DURATION')
        private readonly uploadAvatarUserDuration: Histogram<string>,

        @InjectMetric('FIND_USER_AVATAR_ARRAY_TOTAL')
        private readonly findUserAvatarArrayTotal: Counter<string>,

        @InjectMetric('FIND_USER_AVATAR_ARRAY_DURATION')
        private readonly findUserAvatarArrayDuration: Histogram<string>,

        @InjectMetric('FIND_USER_AVATAR_TOTAL')
        private readonly findUserAvatarTotal: Counter<string>,

        @InjectMetric('FIND_USER_AVATAR_DURATION')
        private readonly findUserAvatarDuration: Histogram<string>,

        @InjectMetric('DELETE_AVATAR_USER_TOTAL')
        private readonly deleteAvatarUserTotal: Counter<string>,

        @InjectMetric('DELETE_AVATAR_USER_DURATION')
        private readonly deleteAvatarUserDuration: Histogram<string>,
    ) {}

    @GrpcMethod('ContentService', 'UploadAvatarUser')
    async UploadAvatarUser(
        request: UploadAvatarUserRequest,
    ): Promise<UploadAvatarUserResponse> {
        const end = this.uploadAvatarUserDuration.startTimer();
        try {
            const { avatarUrl, userId } = request;
            this.logger.debug('Starting UploadAvatarUser process');

            if (!avatarUrl || !userId) {
                this.logger.warn(
                    'Invalid request payload: missing avatarUrl or userId',
                );
                this.uploadAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            this.logger.debug(`Uploading avatar for userId: ${userId}`);
            const { message, status } =
                await this.cassandraService.uploadAvatarUser({
                    avatarUrl,
                    userId,
                });

            if (!message || !status) {
                this.uploadAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.error('Failed to upload avatar');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.uploadAvatarUserTotal.inc({ result: promCondition.success });
            this.logger.log(
                `Avatar uploaded successfully for userId: ${userId}`,
            );
            return { message, status };
        } catch (e) {
            this.uploadAvatarUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in UploadAvatarUser', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('ContentService', 'FindUserAvatarArray')
    async FindUserAvatarArray(
        request: FindUserAvatarArrayRequest,
    ): Promise<FindUserAvatarArrayResponse> {
        const end = this.findUserAvatarArrayDuration.startTimer();
        try {
            const { userId } = request;
            this.logger.debug('Starting FindUserAvatarArray process');

            if (!userId) {
                this.logger.warn('Invalid request payload: missing userId');
                this.findUserAvatarArrayTotal.inc({
                    result: promCondition.failure,
                });
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            this.logger.debug(`Fetching avatars for userId: ${userId}`);
            const { message, status, data } =
                await this.cassandraService.findUserAvatarArray({
                    userId,
                });

            if (!message || !status) {
                this.findUserAvatarArrayTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.error('Failed to fetch user avatars');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                this.findUserAvatarArrayTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn(`No avatars found for userId: ${userId}`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            const agregateData: AvatarData[] = data.map((el) => ({
                avatarId: el.avatar_id,
                avatarUrl: el.avatar_url,
            }));

            this.findUserAvatarArrayTotal.inc({
                result: promCondition.success,
            });
            this.logger.log(
                `Successfully fetched avatars for userId: ${userId}`,
            );
            return { message, status, data: agregateData };
        } catch (e) {
            this.findUserAvatarArrayTotal.inc({
                result: promCondition.failure,
            });
            this.logger.error('Error in FindUserAvatarArray', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('ContentService', 'FindUserAvatar')
    async FindUserAvatar(
        request: FindUserAvatarRequest,
    ): Promise<FindUserAvatarResponse> {
        const end = this.findUserAvatarDuration.startTimer();
        try {
            const { avatarId, userId } = request;
            this.logger.debug('Starting FindUserAvatar process');

            if (!avatarId || !userId) {
                this.logger.warn(
                    'Invalid request payload: missing avatarId or userId',
                );
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            this.logger.debug(
                `Fetching avatar with avatarId: ${avatarId} for userId: ${userId}`,
            );
            const { message, status, data } =
                await this.cassandraService.findUserAvatar({
                    avatarId,
                    userId,
                });

            if (!message || !status) {
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
                this.logger.error('Failed to fetch avatar');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            if (!data) {
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
                this.logger.warn(
                    `Avatar not found for avatarId: ${avatarId}, userId: ${userId}`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            const agregateData: AvatarData = {
                avatarId: data.avatar_id,
                avatarUrl: data.avatar_url,
            };

            this.findUserAvatarTotal.inc({ result: promCondition.success });
            this.logger.log(
                `Successfully fetched avatar for avatarId: ${avatarId}`,
            );
            return { message, status, data: agregateData };
        } catch (e) {
            this.findUserAvatarTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in FindUserAvatar', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('ContentService', 'DeleteAvatarUser')
    async DeleteAvatarUser(
        request: DeleteAvatarUserRequest,
    ): Promise<DeleteAvatarUserResponse> {
        const end = this.deleteAvatarUserDuration.startTimer();
        try {
            this.logger.debug('Starting DeleteAvatarUser process');
            const { userId, avatarId } = request;
            if (!userId || !avatarId) {
                this.logger.warn(
                    'Invalid request payload: missing avatarId or userId',
                );
                this.deleteAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                throw new InternalServerErrorException(
                    StatusClient.RPC_EXCEPTION.message,
                );
            }

            const { message, status } =
                await this.cassandraService.deleteUserAvatar({
                    userId,
                    avatarId,
                });

            if (!message || !status) {
                this.deleteAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.error('Error in DeleteAvatarUser');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.deleteAvatarUserTotal.inc({ result: promCondition.success });
            this.logger.log(`Successfully DeleteAvatarUser ${avatarId}`);
            return { message, status };
        } catch (e) {
            this.deleteAvatarUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in DeleteAvatarUser', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }
}
