import {
    Injectable,
    InternalServerErrorException,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import { Client } from 'cassandra-driver';
import { StatusClient } from 'src/common/status';
import * as dotenv from 'dotenv';
import {
    DeleteUserAvatarRequestDTO,
    DeleteUserAvatarResponseDTO,
    FindUserAvatarArrayRequestDTO,
    FindUserAvatarArrayResponseDTO,
    FindUserAvatarRequestDTO,
    FindUserAvatarResponseDTO,
    UploadAvatarRequestDTO,
    UploadAvatarResponseDTO,
} from './dto';
dotenv.config();

@Injectable()
export class CassandraService implements OnModuleInit, OnModuleDestroy {
    private client: Client;

    async onModuleInit() {
        try {
            this.client = new Client({
                contactPoints: [process.env.CONTACT_POINTS],
                localDataCenter: process.env.LOCAL_DATA_CENTER,
            });
            await this.client.connect();
            console.log('Connected to Cassandra');

            await this.createKeyspace();
            await this.createTable();
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async onModuleDestroy() {
        try {
            await this.client.shutdown();
            console.log('Disconnect from Cassandra');
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    private async createKeyspace() {
        try {
            const query = `
                CREATE KEYSPACE IF NOT EXISTS ${process.env.KEYSPACE}
                WITH replication = {
                    'class': ${process.env.STRATEGY},
                    'replication_factor': ${+process.env.COUNT_REPLICATION}
                };
            `;

            await this.client.execute(query);
            console.log('Keyspace created or exists');
        } catch (end) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    private async createTable() {
        try {
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
            console.log('Table created or exists');
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async uploadAvatarUser(
        data: UploadAvatarRequestDTO,
    ): Promise<UploadAvatarResponseDTO> {
        try {
            const { avatarUrl, userId } = data;
            const query = `
                INSERT INTO avatars (avatar_id, user_id, avatar_url, is_active, uploaded_at, is_random)
                VALUES (uuid(), ?, ?, true, toTimestamp(now()), false)
            `;
            const params = [avatarUrl, userId];

            await this.client.execute(query, params, { prepare: true });
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserAvatarArray(
        data: FindUserAvatarArrayRequestDTO,
    ): Promise<FindUserAvatarArrayResponseDTO> {
        try {
            const query = `SELECT * FROM `
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserAvatar(
        data: FindUserAvatarRequestDTO,
    ): Promise<FindUserAvatarResponseDTO>{
        try {
            
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async deleteUserAvatar(
        data: DeleteUserAvatarRequestDTO,
    ): Promise<DeleteUserAvatarResponseDTO> {
        try {
            
        } catch (e) {
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
