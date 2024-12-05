import {
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { Client, ClientGrpc, RpcException } from '@nestjs/microservices';
import { from, lastValueFrom } from 'rxjs';
import {
    UserService as UserServiceClient,
    FindUserByIdRequest,
    FindUserByIdResponse,
    FindUserByEmailRequest,
    FindUserByEmailResponse,
    FindUserByPhoneNumberRequest,
    FindUserByPhoneNumberResponse,
    FindUserByUsernameRequest,
    FindUserByUsernameResponse,
    AddChatToUserRequest,
    RemoveChatFromUserRequest,
    UserDataId,
    UserData,
    RemoveAccountRequest,
    RemoveAccountResponse,
    GetPasswordUserRequest,
    GetPasswordUserResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
    GetUserProfileRequest,
    GetUserProfileResponse,
    UpdateUserPasswordRequest,
    UpdateUserPasswordResponse,
} from 'src/protos/proto_gen_files/user';
import {
    grpcClientOptionsAuth,
    grpcClientOptionsUser,
} from 'src/config/grpc/grpc.options';
import { StatusClient } from 'src/common/status';
import { errMessages } from 'src/common/messages';
import { AuthService as AuthInterface } from 'src/protos/proto_gen_files/auth';
import { AddChatToUserResponseDTO, RemoveChatFromUserResponseDTO } from './dto';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class UserService implements OnModuleInit {
    @Client(grpcClientOptionsUser)
    private readonly userClient: ClientGrpc;
    @Client(grpcClientOptionsAuth)
    private readonly authClient: ClientGrpc;

    private userMicroservice: UserServiceClient;
    private authMicroservice: AuthInterface;

    constructor(private readonly logger: WinstonLoggerService) {}

    onModuleInit() {
        this.userMicroservice =
            this.userClient.getService<UserServiceClient>('UserService');

        this.authMicroservice =
            this.authClient.getService<AuthInterface>('AuthService');
    }

    validateUserIds(payload: UserDataId): any {
        const validateUser = {
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            phoneNumber: payload.phoneNumber,
            chatReferences: payload.chatReferences,
        };
        return validateUser;
    }

    validateUser(payload: UserData): any {
        const validateUser = {
            userId: payload.userId,
            email: payload.email,
            username: payload.username,
            phoneNumber: payload.phoneNumber,
        };
        return validateUser;
    }

    async UpdateUserProfile(
        payload: UpdateUserProfileRequest,
    ): Promise<UpdateUserProfileResponse> {
        const { userId, description } = payload;
        try {
            this.logger.debug(
                `Attempting to update user profile. userId: ${userId}, description: ${description}`,
            );

            const { message, status } = await lastValueFrom(
                from(
                    this.userMicroservice.UpdateUserProfile({
                        userId,
                        description,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn(
                    `Failed to update user profile. userId: ${userId}. Response missing message or status.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `User profile updated successfully. userId: ${userId}, status: ${status}`,
            );

            return { message, status };
        } catch (e) {
            this.logger.error(
                `Error while updating user profile for userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.updateUserProfile,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async GetUserProfile(
        payload: GetUserProfileRequest,
    ): Promise<GetUserProfileResponse> {
        const { userId, whoFind } = payload;
        try {
            this.logger.debug(
                `Fetching user profile. userId: ${userId}, whoFind: ${whoFind}`,
            );

            const { message, status } = await lastValueFrom(
                from(
                    this.userMicroservice.GetUserProfile({
                        userId,
                        whoFind,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn(
                    `Failed to fetch user profile. userId: ${userId}, whoFind: ${whoFind}. Response missing message or status.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `User profile fetched successfully. userId: ${userId}, status: ${status}`,
            );

            return { message, status };
        } catch (e) {
            this.logger.error(
                `Error while fetching user profile for userId: ${userId}, whoFind: ${whoFind}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.getUserProfile,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async UpdateUserPassword(
        payload: UpdateUserPasswordRequest,
    ): Promise<UpdateUserPasswordResponse> {
        const { userId, password } = payload;
        try {
            this.logger.debug(
                `Attempting to update password for userId: ${userId}`,
            );

            const findUserPassword =
                await this.userMicroservice.GetPasswordUser({ userId });

            if (!findUserPassword || !findUserPassword.hashedPassword) {
                this.logger.warn(
                    `Failed to retrieve current password for userId: ${userId}`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.debug(
                `Current password retrieved for userId: ${userId}`,
            );

            const CheckPassword = await this.authMicroservice.CheckPassword({
                password,
                hashedPassword: findUserPassword.hashedPassword,
            });

            if (CheckPassword.exist === false) {
                this.logger.warn(
                    `Provided password does not match the current password for userId: ${userId}`,
                );
                throw new ForbiddenException(
                    StatusClient.HTTP_STATUS_FORBIDDEN.message,
                );
            }

            this.logger.debug(
                `Password verification successful for userId: ${userId}`,
            );

            const { hashedPassword } =
                await this.authMicroservice.ToHashPassword({ password });

            this.logger.debug(
                `Password hashed successfully for userId: ${userId}`,
            );

            const { message, status } = await lastValueFrom(
                from(
                    this.userMicroservice.UpdateUserPassword({
                        userId,
                        password: hashedPassword,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn(
                    `Failed to update password for userId: ${userId}. Missing message or status in response.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Password updated successfully for userId: ${userId}`,
            );

            return { message, status };
        } catch (e) {
            this.logger.error(
                `Error while updating password for userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.updateUserPassword,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async RemoveAccount(
        payload: RemoveAccountRequest,
    ): Promise<RemoveAccountResponse> {
        const { userId } = payload;
        try {
            this.logger.debug(
                `Attempting to remove account for userId: ${userId}`,
            );

            const { message } = await lastValueFrom(
                from(
                    this.userMicroservice.RemoveAccount({
                        userId,
                    }),
                ),
            );

            if (!message) {
                this.logger.warn(
                    `Failed to remove account for userId: ${userId}. Missing message in response.`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Account successfully removed for userId: ${userId}`,
            );

            return { message };
        } catch (e) {
            this.logger.error(
                `Error while removing account for userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.removeAccount,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async GetPasswordUser(
        payload: GetPasswordUserRequest,
    ): Promise<GetPasswordUserResponse> {
        const { userId } = payload;
        try {
            this.logger.debug(
                `Attempting to retrieve password for userId: ${userId}`,
            );

            const { hashedPassword } = await lastValueFrom(
                from(
                    this.userMicroservice.GetPasswordUser({
                        userId,
                    }),
                ),
            );

            if (!hashedPassword) {
                this.logger.warn(`Password not found for userId: ${userId}`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Password retrieved successfully for userId: ${userId}`,
            );

            return { hashedPassword };
        } catch (e) {
            this.logger.error(
                `Error while retrieving password for userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.getPasswordUser,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async AddChatToUser(
        payload: AddChatToUserRequest,
    ): Promise<AddChatToUserResponseDTO> {
        const { chatId, userId } = payload;
        try {
            this.logger.debug(
                `Attempting to add chat with chatId: ${chatId} to userId: ${userId}`,
            );

            const {
                info: { message, status },
            } = await lastValueFrom(
                from(
                    this.userMicroservice.AddChatToUser({
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn(
                    `Failed to add chat to user. No valid response for userId: ${userId}, chatId: ${chatId}`,
                );
                throw new NotFoundException(errMessages.notFound.user);
            }

            this.logger.log(
                `Chat with chatId: ${chatId} successfully added to userId: ${userId}`,
            );

            return { message, status };
        } catch (e) {
            this.logger.error(
                `Error while adding chat with chatId: ${chatId} to userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.addChatToUser,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async RemoveChatFromUser(
        payload: RemoveChatFromUserRequest,
    ): Promise<RemoveChatFromUserResponseDTO> {
        const { chatId, userId } = payload;
        try {
            this.logger.debug(
                `Attempting to remove chat with chatId: ${chatId} from userId: ${userId}`,
            );

            const {
                info: { message, status },
            } = await lastValueFrom(
                from(
                    this.userMicroservice.RemoveChatFromUser({
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn(
                    `Failed to remove chat from user. No valid response for userId: ${userId}, chatId: ${chatId}`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Chat with chatId: ${chatId} successfully removed from userId: ${userId}`,
            );

            return { message, status };
        } catch (e) {
            this.logger.error(
                `Error while removing chat with chatId: ${chatId} from userId: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.removeChatFromUser,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async FindUserById(
        payload: FindUserByIdRequest,
    ): Promise<Omit<FindUserByIdResponse, 'passwordHash'>> {
        const { userId } = payload;
        try {
            this.logger.debug(`Attempting to find user by ID: ${userId}`);

            const { userData } = await lastValueFrom(
                from(
                    this.userMicroservice.FindUserById({
                        userId,
                    }),
                ),
            );

            if (!userData) {
                this.logger.warn(`User with ID: ${userId} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(`User with ID: ${userId} found successfully`);

            const userWithoutPassword = this.validateUserIds(userData);

            return userWithoutPassword;
        } catch (e) {
            this.logger.error(
                `Error while finding user by ID: ${userId}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.findUserById,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async FindUserByPhoneNumber(
        payload: FindUserByPhoneNumberRequest,
    ): Promise<Omit<FindUserByPhoneNumberResponse, 'userData.passwordHash'>> {
        const { phoneNumber } = payload;
        try {
            this.logger.debug(
                `Attempting to find user by phone number: ${phoneNumber}`,
            );

            const { userData } = await lastValueFrom(
                from(
                    this.userMicroservice.FindUserByPhoneNumber({
                        phoneNumber,
                    }),
                ),
            );

            if (!userData) {
                this.logger.warn(
                    `User with phone number: ${phoneNumber} not found`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `User with phone number: ${phoneNumber} found successfully`,
            );

            const userWithoutPassword = this.validateUser(userData);

            return { userData: userWithoutPassword };
        } catch (e) {
            this.logger.error(
                `Error while finding user by phone number: ${phoneNumber}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.findByPhone,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async FindUserByEmail(
        payload: FindUserByEmailRequest,
    ): Promise<Omit<FindUserByEmailResponse, 'passwordHash'>> {
        const { email } = payload;
        try {
            this.logger.debug(`Attempting to find user by email: ${email}`);

            const { userData } = await lastValueFrom(
                from(
                    this.userMicroservice.FindUserByEmail({
                        email,
                    }),
                ),
            );

            if (!userData) {
                this.logger.warn(`User with email: ${email} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(`User with email: ${email} found successfully`);

            const userWithoutPassword = this.validateUser(userData);

            return userWithoutPassword;
        } catch (e) {
            this.logger.error(
                `Error while finding user by email: ${email}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.findByEmail,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async FindUserByUsername(
        payload: FindUserByUsernameRequest,
    ): Promise<FindUserByUsernameResponse> {
        const { username } = payload;
        try {
            this.logger.debug(
                `Attempting to find user by username: ${username}`,
            );

            const userInfo = await lastValueFrom(
                from(
                    this.userMicroservice.FindUserByUsername({
                        username,
                    }),
                ),
            );

            if (!userInfo) {
                this.logger.warn(`User with username: ${username} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `User with username: ${username} found successfully`,
            );

            return userInfo;
        } catch (e) {
            this.logger.error(
                `Error while finding user by username: ${username}. ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.findByUsername,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }
}
