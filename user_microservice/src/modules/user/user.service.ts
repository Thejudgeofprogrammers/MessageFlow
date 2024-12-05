import {
    Controller,
    ForbiddenException,
    InternalServerErrorException,
    LoggerService,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
    UserService as UserInterfase,
    FindUserByIdRequest,
    FindUserByIdResponse,
    FindUserByEmailRequest,
    FindUserByEmailResponse,
    FindUserByPhoneNumberRequest,
    FindUserByPhoneNumberResponse,
    FindUserByUsernameRequest,
    FindUserByUsernameResponse,
    CreateNewUserRequest,
    CreateNewUserResponse,
    RemoveChatFromUserRequest,
    RemoveChatFromUserResponse,
    AddChatToUserResponse,
    AddChatToUserRequest,
    RemoveArrayChatRequest,
    RemoveArrayChatResponse,
    RemoveAccountRequest,
    RemoveAccountResponse,
    GetPasswordUserRequest,
    GetPasswordUserResponse,
    GetUserProfileRequest,
    GetUserProfileResponse,
    UpdateUserPasswordRequest,
    UpdateUserPasswordResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
    ToggleUserProfileCheckRequset,
    ToggleUserProfileCheckResponse,
} from '../../protos/proto_gen_files/user';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { promCondition, StatusClient } from 'src/common/status';

@Controller('UserService')
export class UserService implements UserInterfase {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly logger: LoggerService,

        @InjectMetric('TOGGLE_USER_PROFILE_CHECK_TOTAL')
        private readonly toggleUserProfileCheckTotal: Counter<string>,

        @InjectMetric('TOGGLE_USER_PROFILE_CHECK_DURATION')
        private readonly toggleUserProfileCheckDuration: Histogram<string>,

        @InjectMetric('UPDATE_USER_PROFILE_TOTAL')
        private readonly updateUserProfileTotal: Counter<string>,

        @InjectMetric('UPDATE_USER_PROFILE_DURATION')
        private readonly updateUserProfileDuration: Histogram<string>,

        @InjectMetric('GET_USER_PROFILE_TOTAL')
        private readonly getUserProfileTotal: Counter<string>,

        @InjectMetric('GET_USER_PROFILE_DURATION')
        private readonly getUserProfileDuration: Histogram<string>,

        @InjectMetric('UPDATE_USER_PASSWORD_TOTAL')
        private readonly updateUserPasswordTotal: Counter<string>,

        @InjectMetric('UPDATE_USER_PASSWORD_DURATION')
        private readonly updateUserPasswordDuration: Histogram<string>,

        @InjectMetric('GET_PASSWORD_USER_TOTAL')
        private readonly getPasswordUserTotal: Counter<string>,

        @InjectMetric('GET_PASSWORD_USER_DURATION')
        private readonly getPasswordUserDuration: Histogram<string>,

        @InjectMetric('REMOVE_ACCOUNT_TOTAL')
        private readonly removeAccountTotal: Counter<string>,

        @InjectMetric('REMOVE_ACCOUNT_DURATION')
        private readonly removeAccountDuration: Histogram<string>,

        @InjectMetric('REMOVE_ARRAY_CHAT_TOTAL')
        private readonly removeArrayChatTotal: Counter<string>,

        @InjectMetric('REMOVE_ARRAY_CHAT_DURATION')
        private readonly removeArrayChatDuration: Histogram<string>,

        @InjectMetric('ADD_CHAT_TO_USER_TOTAL')
        private readonly addChatToUserTotal: Counter<string>,

        @InjectMetric('ADD_CHAT_TO_USER_DURATION')
        private readonly addChatToUserDuration: Histogram<string>,

        @InjectMetric('REMOVE_CHAT_FROM_USER_TOTAL')
        private readonly removeChatFromUserTotal: Counter<string>,

        @InjectMetric('REMOVE_CHAT_FROM_USER_DURATION')
        private readonly removeChatFromUserDuration: Histogram<string>,

        @InjectMetric('CREATE_NEW_USER_TOTAL')
        private readonly createNewUserTotal: Counter<string>,

        @InjectMetric('CREATE_NEW_USER_DURATION')
        private readonly createNewUserDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_ID_TOTAL')
        private readonly findUserByIdTotal: Counter<string>,

        @InjectMetric('FIND_USER_BY_ID_DURATION')
        private readonly findUserByIdDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_USERNAME_TOTAL')
        private readonly findUserByUsernameTotal: Counter<string>,

        @InjectMetric('FIND_USER_BY_USERNAME_DURATION')
        private readonly findUserByUsernameDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_EMAIL_TOTAL')
        private readonly findUserByEmailTotal: Counter<string>,

        @InjectMetric('FIND_USER_BY_EMAIL_DURATION')
        private readonly findUserByEmailDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_PHONE_TOTAL')
        private readonly findUserByPhoneTotal: Counter<string>,

        @InjectMetric('FIND_USER_BY_PHONE_DURATION')
        private readonly findUserByPhoneDuration: Histogram<string>,
    ) {}

    @GrpcMethod('UserService', 'ToggleUserProfileCheck')
    async ToggleUserProfileCheck(
        payload: ToggleUserProfileCheckRequset,
    ): Promise<ToggleUserProfileCheckResponse> {
        const end = this.toggleUserProfileCheckDuration.startTimer();
        try {
            const { toggle, userId } = payload;
            if (!toggle || !userId) {
                this.toggleUserProfileCheckTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn(
                    'Invalid input data for ToggleUserProfileCheck',
                    { toggle, userId },
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const { message, status } =
                await this.prismaService.toggleUserProfileCheck({
                    userId,
                    toggle,
                });

            if (!message || !status) {
                this.toggleUserProfileCheckTotal.inc({
                    result: promCondition.failure,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.toggleUserProfileCheckTotal.inc({
                result: promCondition.success,
            });
            return { message, status };
        } catch (e) {
            this.toggleUserProfileCheckTotal.inc({
                result: promCondition.failure,
            });
            this.logger.error('Error in ToggleUserProfileCheck', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'UpdateUserProfile')
    async UpdateUserProfile(
        request: UpdateUserProfileRequest,
    ): Promise<UpdateUserProfileResponse> {
        const end = this.updateUserProfileDuration.startTimer();
        try {
            const { userId, description } = request;
            if (!userId || !description) {
                this.updateUserProfileTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Invalid input data for UpdateUserProfile', {
                    userId,
                    description,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const { message, status } =
                await this.prismaService.updateUserProfile({
                    userId,
                    description,
                });

            if (!message || !status) {
                this.updateUserProfileTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn(
                    'UpdateUserProfile returned invalid response',
                    { userId },
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.updateUserProfileTotal.inc({ result: promCondition.success });
            return { message, status };
        } catch (e) {
            this.updateUserProfileTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in UpdateUserProfile', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'GetUserProfile')
    async GetUserProfile(
        request: GetUserProfileRequest,
    ): Promise<GetUserProfileResponse> {
        const end = this.getUserProfileDuration.startTimer();
        try {
            const { userId, whoFind } = request;

            if (!userId || !whoFind) {
                this.getUserProfileTotal.inc({ result: promCondition.failure });
                this.logger.warn('Invalid input data for GetUserProfile', {
                    userId,
                    whoFind,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const { message: profile, status } =
                await this.prismaService.getUserProfile({ userId });

            if (!profile) {
                this.getUserProfileTotal.inc({ result: promCondition.failure });
                this.logger.warn('Profile not found', { userId });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            const { description, user_id, is_private } = profile;
            if (user_id !== whoFind || is_private) {
                this.getUserProfileTotal.inc({ result: promCondition.failure });
                this.logger.warn('Access to profile forbidden', {
                    userId,
                    whoFind,
                });
                throw new ForbiddenException(
                    StatusClient.HTTP_STATUS_FORBIDDEN.message,
                );
            }

            this.getUserProfileTotal.inc({ result: promCondition.success });
            return { message: description, status };
        } catch (e) {
            this.getUserProfileTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in GetUserProfile', e.stack);
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'UpdateUserPassword')
    async UpdateUserPassword(
        payload: UpdateUserPasswordRequest,
    ): Promise<UpdateUserPasswordResponse> {
        const end = this.updateUserPasswordDuration.startTimer();
        try {
            const { userId, password } = payload;

            if (!password || !userId) {
                this.updateUserPasswordTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Invalid input data for UpdateUserPassword', {
                    userId,
                    password,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const { message, status } =
                await this.prismaService.updateUserPassword({
                    userId,
                    password,
                });

            if (!message || !status) {
                this.updateUserPasswordTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn(
                    'PrismaService returned invalid response for UpdateUserPassword',
                    { userId },
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.updateUserPasswordTotal.inc({ result: promCondition.success });
            return { message, status };
        } catch (e) {
            this.updateUserPasswordTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in UpdateUserPassword', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'GetPasswordUser')
    async GetPasswordUser(
        payload: GetPasswordUserRequest,
    ): Promise<GetPasswordUserResponse> {
        const end = this.getPasswordUserDuration.startTimer();
        try {
            const { userId } = payload;

            if (!userId) {
                this.getPasswordUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Invalid input data for GetPasswordUser', {
                    userId,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const { password_hash: hashedPassword } =
                await this.prismaService.findUserById(userId);

            if (!hashedPassword) {
                this.getPasswordUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Password hash not found for user', {
                    userId,
                });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.getPasswordUserTotal.inc({ result: promCondition.success });
            return { hashedPassword };
        } catch (e) {
            this.getPasswordUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in GetPasswordUser', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'RemoveAccount')
    async RemoveAccount(
        payload: RemoveAccountRequest,
    ): Promise<RemoveAccountResponse> {
        const end = this.removeAccountDuration.startTimer();
        try {
            const { userId: user_id } = payload;

            if (!user_id) {
                this.removeAccountTotal.inc({ result: promCondition.failure });
                this.logger.warn('Invalid input data for RemoveAccount', {
                    user_id,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const user = await this.prismaService.user.delete({
                where: { user_id },
            });

            if (!user) {
                this.removeAccountTotal.inc({ result: promCondition.failure });
                this.logger.warn('User not found for deletion', { user_id });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.removeAccountTotal.inc({ result: promCondition.success });
            return { message: StatusClient.HTTP_STATUS_OK.message };
        } catch (e) {
            this.removeAccountTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in RemoveAccount', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'RemoveArrayChat')
    async RemoveArrayChat(
        payload: RemoveArrayChatRequest,
    ): Promise<RemoveArrayChatResponse> {
        const end = this.removeArrayChatDuration.startTimer();
        try {
            const { chatId, data: userIds } = payload;

            if (!chatId || !userIds) {
                this.removeArrayChatTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Invalid input data for RemoveArrayChat', {
                    chatId,
                    userIds,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            for (const { userId } of userIds) {
                this.logger.debug('Processing user chat removal', {
                    chatId,
                    userId,
                });

                const user = await this.prismaService.user.findUnique({
                    where: { user_id: +userId },
                });

                if (!user) {
                    this.logger.warn('User not found for chat removal', {
                        userId,
                    });
                    continue;
                }

                const updatedChatReferences = user.chatReferences.filter(
                    (id) => id !== chatId,
                );

                await this.prismaService.user.update({
                    where: { user_id: +userId },
                    data: { chatReferences: updatedChatReferences },
                });

                this.logger.log(
                    'Successfully removed chat reference for user',
                    {
                        userId,
                        chatId,
                    },
                );
            }

            this.removeArrayChatTotal.inc({ result: promCondition.success });
            return {
                status: StatusClient.HTTP_STATUS_OK.status,
                message: StatusClient.HTTP_STATUS_OK.message,
            };
        } catch (e) {
            this.removeArrayChatTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in RemoveArrayChat', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'AddChatToUser')
    async AddChatToUser(
        payload: AddChatToUserRequest,
    ): Promise<AddChatToUserResponse> {
        const end = this.addChatToUserDuration.startTimer();
        try {
            const { userId: user_id, chatId } = payload;

            if (!user_id || !chatId) {
                this.addChatToUserTotal.inc({ result: promCondition.failure });
                this.logger.warn('Invalid input data for AddChatToUser', {
                    user_id,
                    chatId,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            const existUser = await this.prismaService.user.findUnique({
                where: { user_id },
            });

            if (!existUser) {
                this.addChatToUserTotal.inc({ result: promCondition.failure });
                this.logger.warn('User not found for AddChatToUser', {
                    user_id,
                });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            const updateUser = await this.prismaService.user.update({
                where: { user_id },
                data: {
                    chatReferences: {
                        push: chatId,
                    },
                },
            });

            if (!updateUser) {
                this.addChatToUserTotal.inc({ result: promCondition.failure });
                this.logger.error('Failed to update user in AddChatToUser', {
                    user_id,
                    chatId,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.addChatToUserTotal.inc({ result: promCondition.success });
            return {
                info: {
                    message: StatusClient.HTTP_STATUS_OK.message,
                    status: StatusClient.HTTP_STATUS_OK.status,
                },
            };
        } catch (e) {
            this.addChatToUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in AddChatToUser', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'RemoveChatFromUser')
    async RemoveChatFromUser(
        payload: RemoveChatFromUserRequest,
    ): Promise<RemoveChatFromUserResponse> {
        const end = this.removeChatFromUserDuration.startTimer();
        try {
            const { userId: user_id, chatId } = payload;

            if (!user_id || !chatId) {
                this.removeChatFromUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('Invalid input data for RemoveChatFromUser', {
                    user_id,
                    chatId,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const user = await this.prismaService.user.findUnique({
                where: { user_id },
            });

            if (!user) {
                this.removeChatFromUserTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('User not found in RemoveChatFromUser', {
                    user_id,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            await this.prismaService.user.update({
                where: { user_id },
                data: {
                    chatReferences: {
                        set: user.chatReferences.filter((id) => id !== chatId),
                    },
                },
            });

            this.logger.log('Successfully removed chat from user', {
                user_id,
                chatId,
            });
            this.removeChatFromUserTotal.inc({ result: promCondition.success });
            return {
                info: {
                    message: StatusClient.HTTP_STATUS_OK.message,
                    status: StatusClient.HTTP_STATUS_OK.status,
                },
            };
        } catch (e) {
            this.removeChatFromUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in RemoveChatFromUser', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('UserService', 'CreateNewUser')
    async CreateNewUser(
        payload: CreateNewUserRequest,
    ): Promise<CreateNewUserResponse> {
        const end = this.createNewUserDuration.startTimer();
        try {
            const { username, email, passwordHash, phoneNumber } = payload;

            if (!username || !email || !phoneNumber || !passwordHash) {
                this.createNewUserTotal.inc({ result: promCondition.failure });
                this.logger.warn('Invalid input data for CreateNewUser', {
                    payload,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const existingUserByEmail =
                await this.prismaService.findUserByEmail(email);

            if (existingUserByEmail) {
                this.createNewUserTotal.inc({ result: promCondition.failure });
                this.logger.warn('User already exists with given email', {
                    email,
                });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const existingUserByPhone =
                await this.prismaService.findUserByPhone(phoneNumber);

            if (existingUserByPhone) {
                this.createNewUserTotal.inc({ result: promCondition.failure });
                this.logger.warn(
                    'User already exists with given phone number',
                    { phoneNumber },
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            const newUser = await this.prismaService.createUser(payload);

            if (!newUser) {
                this.createNewUserTotal.inc({ result: promCondition.failure });
                this.logger.error('Failed to create new user', { payload });
                throw new InternalServerErrorException('User is not created');
            }

            this.logger.log('Successfully created new user', { newUser });
            this.createNewUserTotal.inc({ result: promCondition.success });
            return {
                info: {
                    message: StatusClient.HTTP_STATUS_OK.message,
                    status: 201,
                },
            };
        } catch (e) {
            this.createNewUserTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in CreateNewUser', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('Ending CreateNewUser process');
        }
    }

    @GrpcMethod('UserService', 'FindUserById')
    async FindUserById(
        payload: FindUserByIdRequest,
    ): Promise<FindUserByIdResponse> {
        const end = this.findUserByIdDuration.startTimer();
        try {
            const { userId } = payload;

            const existUser = await this.prismaService.findUserById(userId);

            if (!existUser) {
                this.findUserByIdTotal.inc({ result: promCondition.failure });
                this.logger.warn('User not found by ID', { userId });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log('User found by ID', { userId, existUser });
            this.findUserByIdTotal.inc({ result: promCondition.success });

            return {
                userData: {
                    userId: existUser.user_id,
                    phoneNumber: existUser.phone_number,
                    email: existUser.email,
                    passwordHash: existUser.password_hash,
                    username: existUser.username,
                    chatReferences: existUser.chatReferences,
                },
            };
        } catch (e) {
            this.findUserByIdTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in FindUserById', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('Ending FindUserById process', {
                userId: payload.userId,
            });
        }
    }

    @GrpcMethod('UserService', 'FindUserByUsername')
    async FindUserByUsername(
        payload: FindUserByUsernameRequest,
    ): Promise<FindUserByUsernameResponse> {
        const end = this.findUserByUsernameDuration.startTimer();
        try {
            const { username } = payload;

            const existUsers =
                await this.prismaService.findUserByUsername(username);

            if (!existUsers) {
                this.findUserByUsernameTotal.inc({
                    result: promCondition.failure,
                });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log('Users found by username', {
                username,
                users: existUsers,
            });

            this.findUserByUsernameTotal.inc({ result: promCondition.success });

            return {
                users: existUsers
                    ? existUsers.map((user) => ({
                          userId: user.user_id,
                          username: user.username,
                      }))
                    : [],
            };
        } catch (e) {
            this.findUserByUsernameTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in FindUserByUsername', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('Ending FindUserByUsername process', {
                username: payload.username,
            });
        }
    }

    @GrpcMethod('UserService', 'FindUserByEmail')
    async FindUserByEmail(
        payload: FindUserByEmailRequest,
    ): Promise<FindUserByEmailResponse> {
        const end = this.findUserByEmailDuration.startTimer();
        try {
            const { email } = payload;

            const existUser = await this.prismaService.findUserByEmail(email);

            if (!existUser) {
                this.findUserByEmailTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('User not found by email', { email });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log('User found by email', { email, existUser });
            this.findUserByEmailTotal.inc({ result: promCondition.success });

            return {
                userData: {
                    userId: existUser.user_id,
                    phoneNumber: existUser.phone_number,
                    email: existUser.email,
                    passwordHash: existUser.password_hash,
                    username: existUser.username,
                },
            };
        } catch (e) {
            this.findUserByEmailTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in FindUserByEmail', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('Ending FindUserByEmail process', {
                email: payload.email,
            });
        }
    }

    @GrpcMethod('UserService', 'FindUserByPhoneNumber')
    async FindUserByPhoneNumber(
        payload: FindUserByPhoneNumberRequest,
    ): Promise<FindUserByPhoneNumberResponse> {
        const end = this.findUserByPhoneDuration.startTimer();
        try {
            const { phoneNumber } = payload;

            const existUser =
                await this.prismaService.findUserByPhone(phoneNumber);

            if (!existUser) {
                this.findUserByPhoneTotal.inc({
                    result: promCondition.failure,
                });
                this.logger.warn('User not found by phone number', {
                    phoneNumber,
                });
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log('User found by phone number', {
                phoneNumber,
                existUser,
            });
            this.findUserByPhoneTotal.inc({ result: promCondition.success });

            return {
                userData: {
                    userId: existUser.user_id,
                    phoneNumber: existUser.phone_number,
                    email: existUser.email,
                    passwordHash: existUser.password_hash,
                    username: existUser.username,
                },
            };
        } catch (e) {
            this.findUserByPhoneTotal.inc({ result: promCondition.failure });
            this.logger.error('Error in FindUserByPhoneNumber', {
                error: e.stack,
                payload,
            });
            throw new InternalServerErrorException(
                StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
            );
        } finally {
            end();
            this.logger.debug('Ending FindUserByPhoneNumber process', {
                phoneNumber: payload.phoneNumber,
            });
        }
    }
}
