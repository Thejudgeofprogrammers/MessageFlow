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

@Controller('SessionUserService')
export class SessionUserService implements UserSessionInterface {
    private redis: Redis;

    constructor(
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
        data: SaveUserSessionRequest,
    ): Promise<SaveUserSessionResponse> {
        const end = this.saveSessionDuration.startTimer();
        try {
            if (!data.userId) throw new BadRequestException('userId missing');
            await this.redis.set(data.userId.toString(), data.jwtToken);
            this.saveSessionTotal.inc();
            return { message: 'User session saved successfully' };
        } catch (error) {
            console.error('Error in SaveUserSession:', error);
            throw new InternalServerErrorException('Server have problem');
        } finally {
            end();
        }
    }

    @GrpcMethod('SessionUserService', 'GetUserSession')
    async GetUserSession(
        data: GetUserSessionRequest,
    ): Promise<GetUserSessionResponse> {
        const end = this.getSessionDuration.startTimer();
        try {
            if (!data.userId) throw new BadRequestException('userId missing');
            const token = await this.redis.get(data.userId.toString());
            if (!token) throw new BadRequestException('Token missing');
            this.getSessionTotal.inc();
            return { userId: data.userId, jwtToken: token || '' };
        } catch (e) {
            throw new InternalServerErrorException('Server have problem');
        } finally {
            end();
        }
    }

    @GrpcMethod('SessionUserService', 'DeleteUserSession')
    async DeleteUserSession(
        data: DeleteUserSessionRequest,
    ): Promise<DeleteUserSessionResponse> {
        const end = this.deleteSessionDuration.startTimer();
        try {
            await this.redis.del(data.userId.toString());
            this.deleteSessionTotal.inc();
            return {
                message: 'User session deleted successfully',
                status: 200,
            };
        } catch (error) {
            console.error('Error in DeleteUserSession:', error);
            throw new InternalServerErrorException('Server have problem');
        } finally {
            end();
        }
    }
}
