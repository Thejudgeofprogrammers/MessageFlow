import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
import {
    CreateNewUserRequest,
    ToggleUserProfileCheckRequset,
    ToggleUserProfileCheckResponse,
    UpdateUserPasswordRequest,
    UpdateUserPasswordResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
} from '../../protos/proto_gen_files/user';
import { FindProfileDTO, GetUserProfileDTOResponse } from './dto';
import { StatusClient } from 'src/common/status';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(
        private readonly configService: ConfigService,
        private readonly logger: WinstonLoggerService,
    ) {
        super();
    }

    async toggleUserProfileCheck(
        payload: ToggleUserProfileCheckRequset,
    ): Promise<ToggleUserProfileCheckResponse> {
        this.logger.debug('Starting toggleUserProfileCheck process');
        try {
            const { userId, toggle } = payload;

            this.logger.log(
                `Updating user profile privacy for userId: ${userId}`,
            );
            await this.profile.update({
                where: { user_id: userId },
                data: {
                    is_private: toggle,
                },
            });

            this.logger.log(
                `Successfully updated profile privacy for userId: ${userId}`,
            );
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.logger.error('Error toggling user profile privacy', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async getUserProfile(
        payload: GetUserProfileDTOResponse,
    ): Promise<FindProfileDTO> {
        this.logger.debug('Starting getUserProfile process');
        try {
            const { userId: user_id } = payload;

            this.logger.log(`Fetching profile for userId: ${user_id}`);
            const profile = await this.profile.findUnique({
                where: { user_id },
            });

            if (!profile) {
                this.logger.warn(`Profile not found for userId: ${user_id}`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Successfully fetched profile for userId: ${user_id}`,
            );
            return {
                message: profile,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.logger.error('Error fetching user profile', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async updateUserProfile(
        payload: UpdateUserProfileRequest,
    ): Promise<UpdateUserProfileResponse> {
        this.logger.debug('Starting updateUserProfile process');
        try {
            const { userId, description } = payload;

            this.logger.log(
                `Updating profile description for userId: ${userId}`,
            );
            await this.profile.update({
                where: { user_id: userId },
                data: {
                    description,
                },
            });

            this.logger.log(
                `Successfully updated profile for userId: ${userId}`,
            );
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.logger.error('Error updating user profile', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async updateUserPassword(
        payload: UpdateUserPasswordRequest,
    ): Promise<UpdateUserPasswordResponse> {
        this.logger.debug('Starting updateUserPassword process');
        try {
            const { password: password_hash, userId: user_id } = payload;

            this.logger.log(
                `Fetching user by ID for password update: ${user_id}`,
            );
            const user = await this.user.findUnique({
                where: { user_id },
            });

            if (!user) {
                this.logger.warn(
                    `User not found for password update: ${user_id}`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(`Updating password for userId: ${user_id}`);
            const updatedUser = await this.user.update({
                where: { user_id },
                data: { password_hash },
            });

            if (!updatedUser) {
                this.logger.error(
                    `Failed to update password for userId: ${user_id}`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Successfully updated password for userId: ${user_id}`,
            );
            return {
                message: StatusClient.HTTP_STATUS_OK.message,
                status: StatusClient.HTTP_STATUS_OK.status,
            };
        } catch (e) {
            this.logger.error('Error updating user password', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async createUser(payload: CreateNewUserRequest): Promise<User> {
        this.logger.debug('Starting createUser process');
        try {
            const { username, email, phoneNumber, passwordHash } = payload;

            this.logger.log('Creating new user');
            const userData = await this.user.create({
                data: {
                    username,
                    email,
                    phone_number: phoneNumber,
                    password_hash: passwordHash,
                },
            });

            if (!userData) {
                this.logger.error(
                    `User creation returned null for username: ${username}, email: ${email}`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Successfully created user with ID: ${userData.user_id}`,
            );
            this.logger.log(`Creating profile for userId: ${userData.user_id}`);
            await this.profile.create({
                data: {
                    user_id: userData.user_id,
                    description: '',
                    is_private: false,
                },
            });

            this.logger.log(
                `Successfully created profile for userId: ${userData.user_id}`,
            );
            return userData;
        } catch (error) {
            this.logger.error('Error creating user', error.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserById(user_id: number): Promise<User> {
        this.logger.debug(
            `Starting findUserById process for userId: ${user_id}`,
        );
        try {
            const user = await this.user.findUnique({ where: { user_id } });
            if (!user) {
                this.logger.warn(`User not found for userId: ${user_id}`);
            }
            return user;
        } catch (error) {
            this.logger.error('Error finding user by ID', error.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserByEmail(email: string): Promise<User> {
        this.logger.debug(
            `Starting findUserByEmail process for email: ${email}`,
        );
        try {
            const user = await this.user.findUnique({ where: { email } });
            if (!user) {
                this.logger.warn(`User not found for email: ${email}`);
            }
            return user;
        } catch (error) {
            this.logger.error('Error finding user by email', error.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserByPhone(phone_number: string): Promise<User> {
        this.logger.debug(
            `Starting findUserByPhone process for phone number: ${phone_number}`,
        );
        try {
            const user = await this.user.findUnique({
                where: { phone_number },
            });
            if (!user) {
                this.logger.warn(
                    `User not found for phone number: ${phone_number}`,
                );
            }
            return user;
        } catch (error) {
            this.logger.error('Error finding user by phone', error.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }

    async findUserByUsername(username: string): Promise<User[]> {
        this.logger.debug(
            `Starting findUserByUsername process for username: ${username}`,
        );
        try {
            const users = await this.user.findMany({
                where: { username },
                take: this.configService.get<number>('more_users_find'),
            });
            if (users.length === 0) {
                this.logger.warn(`No users found for username: ${username}`);
            }
            return users;
        } catch (error) {
            this.logger.error('Error finding users by username', error.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        }
    }
}
