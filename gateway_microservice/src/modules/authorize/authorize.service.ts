import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
    UnauthorizedException,
} from '@nestjs/common';
import {
    AuthService,
    LoginResponse,
    RegisterRequest,
} from 'src/protos/proto_gen_files/auth';
import { Client, ClientGrpc, RpcException } from '@nestjs/microservices';
import { from, lastValueFrom } from 'rxjs';
import {
    grpcClientOptionsUser,
    grpcClientOptionsAuth,
} from 'src/config/grpc/grpc.options';
import {
    CreateNewUserResponse,
    FindUserByEmailResponse,
    FindUserByPhoneNumberResponse,
    RemoveAccountResponse,
    UserService as UserInterface,
} from 'src/protos/proto_gen_files/user';
import { grpcClientOptionsSessionUser } from 'src/config/grpc/grpc.options';
import { SessionUserService } from 'src/protos/proto_gen_files/session_user';
import {
    CreateNewUserResponseDTO,
    LoginFormDTO,
    LogoutRequestDTO,
    LogoutResponseDTO,
    RemoveAccountRequestDTO,
} from './dto';
import { StatusClient } from 'src/common/status';
import { errMessages } from 'src/common/messages';
import { UserService as UserServiceGateway } from '../user/user.service';
import { WinstonLoggerService } from '../logger/logger.service';

@Injectable()
export class AuthorizeService implements OnModuleInit {
    @Client(grpcClientOptionsAuth)
    private readonly authClient: ClientGrpc;
    @Client(grpcClientOptionsUser)
    private readonly userClient: ClientGrpc;
    @Client(grpcClientOptionsSessionUser)
    private readonly sessionUserClient: ClientGrpc;

    private authMicroservice: AuthService;
    private userMicroservice: UserInterface;
    private sessionUserMicroservice: SessionUserService;

    constructor(
        private readonly userServiceGateway: UserServiceGateway,
        private readonly logger: WinstonLoggerService,
    ) {}

    onModuleInit() {
        this.authMicroservice =
            this.authClient.getService<AuthService>('AuthService');

        this.userMicroservice =
            this.userClient.getService<UserInterface>('UserService');

        this.sessionUserMicroservice =
            this.sessionUserClient.getService<SessionUserService>(
                'SessionUserService',
            );
    }

    async DeleteUser(
        payload: RemoveAccountRequestDTO,
    ): Promise<RemoveAccountResponse> {
        try {
            const { userId, password } = payload;

            this.logger.debug(`Start deleting user with ID: ${userId}`);

            this.logger.debug(`Fetching hashed password for userId: ${userId}`);
            const { hashedPassword } =
                await this.userServiceGateway.GetPasswordUser({
                    userId,
                });

            if (!hashedPassword) {
                this.logger.warn(
                    `Hashed password not found for userId: ${userId}`,
                );
                throw new NotFoundException(
                    `Password not found for user with ID: ${userId}`,
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Successfully fetched hashed password for userId: ${userId}`,
            );

            this.logger.debug(`Verifying password for userId: ${userId}`);
            const { exist } = await lastValueFrom(
                from(
                    this.authMicroservice.CheckPassword({
                        password,
                        hashedPassword,
                    }),
                ),
            );

            if (exist) {
                this.logger.warn(
                    `Password verification failed for userId: ${userId}`,
                );
                throw new ForbiddenException(
                    'Password verification failed',
                    StatusClient.HTTP_STATUS_FORBIDDEN.message,
                );
            }

            this.logger.log(
                `Password verified successfully for userId: ${userId}`,
            );

            this.logger.debug(
                `Sending request to remove account for userId: ${userId}`,
            );
            const { message } = await this.userServiceGateway.RemoveAccount({
                userId,
            });

            if (!message) {
                this.logger.error(
                    `Failed to remove account for userId: ${userId}`,
                );
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `User account removed successfully for userId: ${userId}`,
            );
            return { message };
        } catch (e) {
            this.logger.error(
                `Error deleting user with ID: ${payload.userId}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.logout,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async registerUser(
        payload: RegisterRequest,
    ): Promise<CreateNewUserResponseDTO> {
        try {
            const { email, password, phoneNumber, username } = payload;

            this.logger.debug('Start registering user');

            if (
                email !== email.trim() ||
                password !== password.trim() ||
                phoneNumber !== phoneNumber.trim() ||
                username !== username.trim()
            ) {
                this.logger.warn('Whitespace detected in registration form');
                throw new BadRequestException(
                    'Whitespace in form registry',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug('Validating email input');
            const validateEmail = this.classifyInput(email);
            if (validateEmail !== 'email') {
                this.logger.warn(`Validation failed for email: ${email}`);
                throw new BadRequestException(
                    'Validation failed',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug('Validating phone number input');
            const validatePhone = this.classifyInput(phoneNumber);
            if (validatePhone !== 'phone') {
                this.logger.warn(
                    `Validation failed for phone number: ${phoneNumber}`,
                );
                throw new BadRequestException(
                    'Validation failed',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                'Sending registration request to auth microservice',
            );
            const userData = await lastValueFrom(
                from(
                    this.authMicroservice.Register({
                        email,
                        phoneNumber,
                        username,
                        password,
                    }),
                ),
            );

            this.logger.log(
                `Successfully registered user in auth microservice: ${email}`,
            );

            this.logger.debug(
                'Sending user creation request to user microservice',
            );
            const userDataCreate: CreateNewUserResponse = await lastValueFrom(
                from(
                    this.userMicroservice.CreateNewUser({
                        email: userData.email,
                        phoneNumber: userData.phoneNumber,
                        username: userData.username,
                        passwordHash: userData.passwordHash,
                    }),
                ),
            );

            const {
                info: { message, status },
            } = userDataCreate;

            if (!message || !status) {
                this.logger.error('Failed to create user in user microservice');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(`User created successfully: ${email}`);
            return { message, status };
        } catch (e) {
            this.logger.error('Error during user registration', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.logout,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async loginUser(payload: LoginFormDTO): Promise<LoginResponse> {
        try {
            const { phoneNumber, email, password } = payload;
            let data: LoginFormDTO;
            let validatePayload: string;
            let existUser: any;

            this.logger.debug('Start login process');

            if (email) {
                this.logger.debug(`Classifying input: ${email}`);
                validatePayload = this.classifyInput(email);
            }
            if (phoneNumber) {
                this.logger.debug(`Classifying input: ${phoneNumber}`);
                validatePayload = this.classifyInput(phoneNumber);
            }

            if (validatePayload === 'phone') {
                this.logger.debug('Input classified as phone number');
                data = {
                    phoneNumber: phoneNumber.trim(),
                    password,
                };

                this.logger.debug(
                    `Finding user by phone number: ${data.phoneNumber}`,
                );
                existUser = (await lastValueFrom(
                    from(
                        this.userMicroservice.FindUserByPhoneNumber({
                            phoneNumber: data.phoneNumber,
                        }),
                    ),
                )) as FindUserByPhoneNumberResponse;
            } else if (validatePayload === 'email') {
                this.logger.debug('Input classified as email');
                data = {
                    email: email.trim(),
                    password,
                };

                this.logger.debug(`Finding user by email: ${data.email}`);
                existUser = (await lastValueFrom(
                    from(
                        this.userMicroservice.FindUserByEmail({
                            email: data.email,
                        }),
                    ),
                )) as FindUserByEmailResponse;
            } else if (validatePayload === 'unknown') {
                this.logger.warn('Validation failed: unknown input');
                throw new BadRequestException(
                    'Without email or phone number',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            const { userData } = existUser;

            this.logger.debug('Sending login request to auth microservice');
            const { userId } = await lastValueFrom(
                from(
                    this.authMicroservice.Login({
                        userId: userData.userId,
                        email: userData.email,
                        passwordHash: userData.passwordHash,
                        password,
                    }),
                ),
            );

            if (!userId) {
                this.logger.warn(
                    'Unauthorized access: invalid password or login',
                );
                throw new UnauthorizedException('Password or login missing');
            }

            this.logger.debug('Saving user session');
            const { message } = await lastValueFrom(
                from(this.sessionUserMicroservice.SaveUserSession(userData)),
            );

            if (!message) {
                this.logger.error('Failed to save user session');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('User logged in successfully');
            return userData;
        } catch (e) {
            this.logger.error('Error during login process', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.logout,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async logoutUser(payload: LogoutRequestDTO): Promise<LogoutResponseDTO> {
        try {
            const { userId, jwtToken } = payload;

            this.logger.debug('Start logout process');

            if (!userId) {
                this.logger.warn('UserId is missing in logout request');
                throw new BadRequestException(
                    'UserId is missing',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                `Sending request to delete user session for userId: ${userId}`,
            );
            const { message, status } = await lastValueFrom(
                from(
                    this.sessionUserMicroservice.DeleteUserSession({
                        userId,
                        jwtToken,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error('Failed to delete user session');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('User successfully logged out');
            return { message, status };
        } catch (e) {
            this.logger.error('Error during logout process', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.logout,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    classifyInput(input: string): string {
        const phonePattern =
            /^\+?\d{1,3}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (phonePattern.test(input)) {
            return 'phone';
        }

        if (emailPattern.test(input)) {
            return 'email';
        }

        return 'unknown';
    }
}
