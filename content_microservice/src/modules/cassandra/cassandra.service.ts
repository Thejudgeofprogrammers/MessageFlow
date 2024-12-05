import {
    Injectable,
    InternalServerErrorException,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { promCondition, StatusClient } from 'src/common/status';
import * as dotenv from 'dotenv';
import {
    AvatarDTO,
    DeleteUserAvatarRequestDTO,
    DeleteUserAvatarResponseDTO,
    FindUserAvatarArrayRequestDTO,
    FindUserAvatarArrayResponseDTO,
    FindUserAvatarRequestDTO,
    FindUserAvatarResponseDTO,
    UploadAvatarRequestDTO,
    UploadAvatarResponseDTO,
} from './dto';
import { WinstonLoggerService } from '../logger/logger.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
dotenv.config();

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;
    constructor(
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
        @InjectMetric('DELETE_USER_AVATAR_TOTAL')
        private readonly deleteUserAvatarTotal: Counter<string>,
        @InjectMetric('DELETE_USER_AVATAR_DURATION')
        private readonly deleteUserAvatarDuration: Histogram<string>,
    ) {}

    async onModuleInit() {
        try {
            this.logger.debug('Initializing Cassandra client...');
            this.client = new Client({
                contactPoints: [process.env.CONTACT_POINTS],
                localDataCenter: process.env.LOCAL_DATA_CENTER,
            });
            await this.client.connect();
            this.logger.log('Connected to Cassandra');

            await this.createKeyspace();
            await this.createTable();
        } catch (e) {
            this.logger.error('Error during Cassandra initialization', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async onModuleDestroy() {
        try {
            this.logger.debug('Shutting down Cassandra client...');
            await this.client.shutdown();
            this.logger.log('Disconnected from Cassandra');
        } catch (e) {
            this.logger.error('Error during Cassandra shutdown', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    private async createKeyspace() {
        try {
            this.logger.debug('Creating keyspace...');
            const query = `
                CREATE KEYSPACE IF NOT EXISTS ${process.env.KEYSPACE}
                WITH replication = {
                    'class': '${process.env.STRATEGY}',
                    'replication_factor': ${+process.env.COUNT_REPLICATION}
                };
            `;

            await this.client.execute(query);
            this.logger.log('Keyspace created or already exists');
        } catch (e) {
            this.logger.error('Error creating keyspace', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    private async createTable() {
        try {
            this.logger.debug('Creating avatars table...');
            const query = `
                CREATE TABLE IF NOT EXISTS ${process.env.KEYSPACE}.avatars (
                    avatar_id INT PRIMARY KEY,
                    user_id INT,
                    avatar_url TEXT,
                    is_active BOOLEAN,
                    uploaded_at TIMESTAMP,
                    is_random BOOLEAN
                );
            `;

            await this.client.execute(query);
            this.logger.log('Table created or already exists');
        } catch (e) {
            this.logger.error('Error creating avatars table', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async uploadAvatarUser(
        payload: UploadAvatarRequestDTO,
    ): Promise<UploadAvatarResponseDTO> {
        const end = this.uploadAvatarUserDuration.startTimer();
        try {
            const { avatarUrl, userId } = payload;
            this.logger.debug(`Uploading user avatar: ${avatarUrl}, ${userId}`);

            const query = `
                INSERT INTO avatars (avatar_id, user_id, avatar_url, is_active, uploaded_at, is_random)
                VALUES (uuid(), ?, ?, true, toTimestamp(now()), false)
            `;
            const params = [avatarUrl, userId];

            await this.client.execute(query, params, { prepare: true });
            this.logger.log('Avatar uploaded successfully');

            this.uploadAvatarUserTotal.inc({ result: promCondition.success });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.uploadAvatarUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error uploading avatar', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    async findUserAvatarArray(
        payload: FindUserAvatarArrayRequestDTO,
    ): Promise<FindUserAvatarArrayResponseDTO> {
        const end = this.findUserAvatarArrayDuration.startTimer();
        try {
            const { userId } = payload;
            this.logger.debug(`Fetching avatars for user: ${userId}`);

            const query = `SELECT * FROM avatars WHERE user_id = ?`;
            const params = [userId];

            const result = await this.client.execute(query, params, {
                prepare: true,
            });

            const data: AvatarDTO[] = result.rows.map((row) => ({
                avatar_id: row['avatar_id'],
                user_id: row['user_id'],
                avatar_url: row['avatar_url'],
                is_active: row['is_active'],
                uploaded_at: row['uploaded_at'],
                is_random: row['is_random'],
            }));

            this.logger.log(
                `Fetched avatars successfully, total: ${data.length}`,
            );

            this.findUserAvatarArrayTotal.inc({
                result: promCondition.success,
            });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
                data,
            };
        } catch (e) {
            this.findUserAvatarArrayTotal.inc({
                result: promCondition.failure,
            });
            this.logger.error('Error fetching avatars', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    async findUserAvatar(
        payload: FindUserAvatarRequestDTO,
    ): Promise<FindUserAvatarResponseDTO> {
        const end = this.findUserAvatarDuration.startTimer();
        try {
            const { avatarId, userId } = payload;
            this.logger.debug(`Fetching avatar by ID: ${avatarId}, ${userId}`);

            const query = `SELECT * FROM avatars WHERE user_id = ? AND avatar_id = ?`;
            const params = [userId, avatarId];

            const result = await this.client.execute(query, params, {
                prepare: true,
            });

            if (result.rowLength === 0) {
                this.logger.warn(`Avatar not found, ${avatarId}, ${userId}`);
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
                return { message: 'Avatar not found', status: 404, data: null };
            }

            this.logger.log(
                `Fetched avatar successfully, ${avatarId}, ${userId}`,
            );

            const row = result.rows[0];

            const data: AvatarDTO = {
                avatar_id: row['avatar_id'],
                user_id: row['user_id'],
                avatar_url: row['avatar_url'],
                is_active: row['is_active'],
                uploaded_at: row['uploaded_at'],
                is_random: row['is_random'],
            };

            this.findUserAvatarTotal.inc({ result: promCondition.success });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
                data,
            };
        } catch (e) {
            this.findUserAvatarTotal.inc({ result: promCondition.failure });
            this.logger.error('Error fetching avatar', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    async deleteUserAvatar(
        payload: DeleteUserAvatarRequestDTO,
    ): Promise<DeleteUserAvatarResponseDTO> {
        const end = this.deleteUserAvatarDuration.startTimer();
        try {
            const { userId, avatarId } = payload;
            this.logger.debug(`Deleting avatar: ${avatarId}, ${userId}`);

            const query = `DELETE FROM avatars WHERE user_id = ? AND avatar_id = ?`;
            const params = [userId, avatarId];

            await this.client.execute(query, params, { prepare: true });
            this.logger.log(
                `Avatar deleted successfully: ${avatarId}, ${userId}`,
            );

            this.deleteUserAvatarTotal.inc({ result: promCondition.success });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.deleteUserAvatarTotal.inc({ result: promCondition.failure });
            this.logger.error('Error deleting avatar', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }
}
