import {
    BadRequestException,
    Controller,
    InternalServerErrorException,
} from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
    SessionUserService as UserSessionInterface,
    SaveUserSessionRequest,
    SaveUserSessionResponse,
    GetUserSessionRequest,
    GetUserSessionResponse,
    DeleteUserSessionRequest,
    DeleteUserSessionResponse,
} from '../../protos/proto_gen_files/session_user';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { redisConfig } from 'src/config/config.redis';
import Redis from 'ioredis';
import { promCondition, StatusClient } from 'src/common/status';
import { WinstonLoggerService } from '../logger/logger.service';

@Controller('SessionUserService')
export class SessionUserService implements UserSessionInterface {
    private redis: Redis;

    constructor(
        private readonly logger: WinstonLoggerService,

        @InjectMetric('PROM_METRIC_SESSION_SAVE_TOTAL')
        private readonly saveSessionTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_SESSION_SAVE_DURATION')
        private readonly saveSessionDuration: Histogram<string>,

        @InjectMetric('PROM_METRIC_SESSION_GET_TOTAL')
        private readonly getSessionTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_SESSION_GET_DURATION')
        private readonly getSessionDuration: Histogram<string>,

        @InjectMetric('PROM_METRIC_SESSION_DELETE_TOTAL')
        private readonly deleteSessionTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_SESSION_DELETE_DURATION')
        private readonly deleteSessionDuration: Histogram<string>,
    ) {
        this.redis = new Redis(redisConfig);
    }

    @GrpcMethod('SessionUserService', 'SaveUserSession')
    async SaveUserSession(
        payload: SaveUserSessionRequest,
    ): Promise<SaveUserSessionResponse> {
        const end = this.saveSessionDuration.startTimer();
        this.logger.debug('Starting SaveUserSession process');
        try {
            const { userId, jwtToken } = payload;

            if (!userId || !jwtToken) {
                this.logger.warn('Invalid payload: missing userId or jwtToken');
                this.saveSessionTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(`Saving session for userId: ${userId}`);
            await this.redis.set(userId.toString(), jwtToken);

            this.logger.log(`Session saved successfully for userId: ${userId}`);
            this.saveSessionTotal.inc({ result: promCondition.success });
            return { message: StatusClient.HTTP_STATUS_OK.message };
        } catch (error) {
            this.logger.error('Error in SaveUserSession', error.stack);
            this.saveSessionTotal.inc({ result: promCondition.failure });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('SaveUserSession process completed');
        }
    }

    @GrpcMethod('SessionUserService', 'GetUserSession')
    async GetUserSession(
        data: GetUserSessionRequest,
    ): Promise<GetUserSessionResponse> {
        const end = this.getSessionDuration.startTimer();
        this.logger.debug('Starting GetUserSession process');
        try {
            const { userId } = data;
            if (!userId) {
                this.logger.warn('Invalid payload: missing userId');
                this.getSessionTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(`Fetching session for userId: ${userId}`);
            const token = await this.redis.get(userId.toString());

            if (!token) {
                this.logger.warn(`No session found for userId: ${userId}`);
                this.getSessionTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.log(
                `Session fetched successfully for userId: ${userId}`,
            );
            this.getSessionTotal.inc({ result: promCondition.success });
            return { userId, jwtToken: token };
        } catch (e) {
            this.logger.error('Error in GetUserSession', e.stack);
            this.getSessionTotal.inc({ result: promCondition.failure });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('GetUserSession process completed');
        }
    }

    @GrpcMethod('SessionUserService', 'DeleteUserSession')
    async DeleteUserSession(
        data: DeleteUserSessionRequest,
    ): Promise<DeleteUserSessionResponse> {
        const end = this.deleteSessionDuration.startTimer();
        this.logger.debug('Starting DeleteUserSession process');
        try {
            const { userId } = data;
            if (!userId) {
                this.logger.warn('Invalid payload: missing userId');
                this.deleteSessionTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(`Deleting session for userId: ${userId}`);
            await this.redis.del(userId.toString());

            this.logger.log(
                `Session deleted successfully for userId: ${userId}`,
            );
            this.deleteSessionTotal.inc({ result: promCondition.success });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (error) {
            this.logger.error('Error in DeleteUserSession', error.stack);
            this.deleteSessionTotal.inc({ result: promCondition.failure });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('DeleteUserSession process completed');
        }
    }
}
