import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';
import {
    CreateNewUserRequest,
    UpdateUserPasswordRequest,
    UpdateUserPasswordResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
} from '../../protos/proto_gen_files/user';
import { FindProfileDTO, GetUserProfileDTOResponse } from './dto';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(private readonly configService: ConfigService) {
        super();
    }

    // async toggleUserProfileCheck(
    //     payload: ToggleUserProfileCheckRequset,
    // ): Promise<ToggleUserProfileCheckResponse> {
    //     try {
    //     } catch (e) {
    //         console.error('Error creating user:', e);
    //         throw new InternalServerErrorException('Unable to update user');
    //     }
    // }

    async getUserProfile(
        request: GetUserProfileDTOResponse,
    ): Promise<FindProfileDTO> {
        try {
            const { userId } = request;

            const profile = await this.profile.findUnique({
                where: { user_id: userId },
            });

            if (!profile) {
                throw new NotFoundException('Профиля не существует');
            }

            return { message: profile, status: 200 };
        } catch (e) {
            console.error('Error creating user:', e);
            throw new InternalServerErrorException('Unable to update user');
        }
    }

    async updateUserProfile(
        request: UpdateUserProfileRequest,
    ): Promise<UpdateUserProfileResponse> {
        try {
            const { userId, description } = request;

            await this.profile.update({
                where: { user_id: userId },
                data: {
                    description: description,
                    is_private: false,
                },
            });

            return { message: 'Профиль изменён', status: 200 };
        } catch (e) {
            console.error('Error creating user:', e);
            throw new InternalServerErrorException('Unable to update user');
        }
    }

    async updateUserPassword(
        data: UpdateUserPasswordRequest,
    ): Promise<UpdateUserPasswordResponse> {
        try {
            const { password, userId } = data;

            const user = await this.user.findUnique({
                where: { user_id: userId },
            });

            if (!user) {
                throw new NotFoundException('Пользователь не найден');
            }

            const updatedUser = await this.user.update({
                where: { user_id: userId },
                data: { password_hash: password },
            });

            if (!updatedUser) {
                throw new InternalServerErrorException(
                    'Ошибка при смене пароля',
                );
            }

            return {
                message: 'Пользователь успешно изменил пароль',
                status: 200,
            };
        } catch (e) {
            console.error('Error creating user:', e);
            throw new InternalServerErrorException('Unable to update user');
        }
    }

    async createUser(data: CreateNewUserRequest): Promise<User> {
        try {
            const userData = await this.user.create({
                data: {
                    username: data.username,
                    email: data.email,
                    phone_number: data.phoneNumber,
                    password_hash: data.passwordHash,
                },
            });

            await this.profile.create({
                data: {
                    user_id: userData.user_id,
                    description: '',
                    is_private: false,
                },
            });

            return userData;
        } catch (error) {
            console.error('Error creating user:', error);
            throw new InternalServerErrorException('Unable to create user');
        }
    }

    async findUserById(user_id: number): Promise<User> {
        try {
            return await this.user.findUnique({ where: { user_id } });
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new InternalServerErrorException('Unable to find user by ID');
        }
    }

    async findUserByEmail(email: string): Promise<User> {
        try {
            return await this.user.findUnique({ where: { email } });
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new InternalServerErrorException(
                'Unable to find user by email',
            );
        }
    }

    async findUserByPhone(phone_number: string): Promise<User> {
        try {
            return await this.user.findUnique({
                where: { phone_number },
            });
        } catch (error) {
            console.error('Error finding user by phone number:', error);
            throw new InternalServerErrorException(
                'Unable to find user by phone number',
            );
        }
    }

    async findUserByUsername(username: string): Promise<User[]> {
        try {
            return await this.user.findMany({
                where: { username },
                take: this.configService.get<number>('more_users_find'),
            });
        } catch (error) {
            console.error('Error finding users by username:', error);
            throw new InternalServerErrorException(
                'Unable to find users by username',
            );
        }
    }
}
