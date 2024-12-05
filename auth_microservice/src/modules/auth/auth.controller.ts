import {
    BadRequestException,
    Controller,
    ForbiddenException,
    InternalServerErrorException,
    UnauthorizedException,
} from '@nestjs/common';

import { CryptService } from '../crypt/crypt.service';
import { TokenService } from '../token/token.service';

import { GrpcMethod } from '@nestjs/microservices';
import {
    AuthService as AuthInterface,
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    LoginResponse,
    CheckPasswordRequest,
    CheckPasswordResponse,
    ToHashPasswordRequest,
    ToHashPasswordResponse,
} from '../../protos/proto_gen_files/auth';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { promCondition, StatusClient } from 'src/common/status';
import { WinstonLoggerService } from '../logger/logger.service';

@Controller('AuthService')
export class AuthService implements AuthInterface {
    constructor(
        private readonly cryptService: CryptService,
        private readonly tokenService: TokenService,
        private readonly logger: WinstonLoggerService,

        @InjectMetric('AUTH_CHECK_PASSWORD_TOTAL')
        private readonly checkPasswordTotal: Counter<string>,
        @InjectMetric('AUTH_CHECK_PASSWORD_DURATION')
        private readonly checkPasswordDuration: Histogram<string>,

        @InjectMetric('AUTH_REGISTER_TOTAL')
        private readonly registerTotal: Counter<string>,
        @InjectMetric('AUTH_REGISTER_DURATION')
        private readonly registerDuration: Histogram<string>,

        @InjectMetric('AUTH_LOGIN_TOTAL')
        private readonly loginTotal: Counter<string>,
        @InjectMetric('AUTH_LOGIN_DURATION')
        private readonly loginDuration: Histogram<string>,

        @InjectMetric('TO_HASH_PASSWORD_TOTAL')
        private readonly toHashPasswordTotal: Counter<string>,
        @InjectMetric('TO_HASH_PASSWORD_DURATION')
        private readonly toHashPasswordTotalDuration: Histogram<string>,
    ) {}

    @GrpcMethod('AuthService', 'ToHashPassword')
    async ToHashPassword(
        payload: ToHashPasswordRequest,
    ): Promise<ToHashPasswordResponse> {
        const end = this.toHashPasswordTotalDuration.startTimer();
        this.logger.debug('Starting ToHashPassword process');
        try {
            const { password } = payload;
            if (!password) {
                this.logger.warn('Invalid payload: missing password');
                this.toHashPasswordTotal.inc({ result: promCondition.failure });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.debug('Hashing password');
            const hashedPassword =
                await this.cryptService.hashPassword(password);

            if (!hashedPassword) {
                this.logger.error('Failed to hash password');
                this.toHashPasswordTotal.inc({ result: promCondition.failure });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('Password hashed successfully');
            this.toHashPasswordTotal.inc({ result: promCondition.success });
            return { hashedPassword };
        } catch (e) {
            this.logger.error('Error in ToHashPassword', e.stack);
            this.toHashPasswordTotal.inc({ result: promCondition.failure });
            throw new InternalServerErrorException(
                `${StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message}: ${e}`,
            );
        } finally {
            end();
            this.logger.debug('ToHashPassword process completed');
        }
    }

    @GrpcMethod('AuthService', 'CheckPassword')
    async CheckPassword(
        payload: CheckPasswordRequest,
    ): Promise<CheckPasswordResponse> {
        const end = this.checkPasswordDuration.startTimer();
        this.logger.debug('Starting CheckPassword process');
        try {
            const { hashedPassword, password } = payload;
            if (!hashedPassword || !password) {
                this.logger.warn(
                    'Invalid payload: missing hashedPassword or password',
                );
                this.checkPasswordTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug('Comparing passwords');
            const exist = await this.cryptService.comparePassword(
                password,
                hashedPassword,
            );

            if (!exist) {
                this.logger.warn('Password comparison failed');
                this.checkPasswordTotal.inc({ result: promCondition.failure });
                throw new ForbiddenException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('Passwords match');
            this.checkPasswordTotal.inc({ result: promCondition.success });
            return { exist };
        } catch (e) {
            this.logger.error('Error in CheckPassword', e.stack);
            this.checkPasswordTotal.inc({ result: promCondition.failure });
            throw e;
        } finally {
            end();
            this.logger.debug('CheckPassword process completed');
        }
    }

    @GrpcMethod('AuthService', 'Register')
    async Register(data: RegisterRequest): Promise<RegisterResponse> {
        const end = this.registerDuration.startTimer();
        this.logger.debug('Starting Register process');
        try {
            const { email, password, phoneNumber, username } = data;
            if (!email && !phoneNumber && !password) {
                this.logger.warn('Invalid payload: missing required fields');
                this.registerTotal.inc({ result: promCondition.failure });
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug('Hashing password for registration');
            const hashedPassword =
                await this.cryptService.hashPassword(password);

            if (!hashedPassword) {
                this.logger.error(
                    'Failed to hash password during registration',
                );
                this.registerTotal.inc({ result: promCondition.failure });
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('User registered successfully');
            this.registerTotal.inc({ result: promCondition.success });
            return {
                username: username,
                email: email,
                passwordHash: hashedPassword,
                phoneNumber: phoneNumber,
            };
        } catch (e) {
            this.logger.error('Error in Register', e.stack);
            this.registerTotal.inc({ result: promCondition.failure });
            throw e;
        } finally {
            end();
            this.logger.debug('Register process completed');
        }
    }

    @GrpcMethod('AuthService', 'Login')
    async Login(data: LoginRequest): Promise<LoginResponse> {
        const end = this.loginDuration.startTimer();
        this.logger.debug('Starting Login process');
        try {
            const { email, password, passwordHash, userId } = data;
            this.logger.debug('Validating user credentials');

            const checkUser = await this.cryptService.comparePassword(
                password,
                passwordHash,
            );

            if (!checkUser) {
                this.logger.warn('Invalid credentials provided');
                this.loginTotal.inc({ result: promCondition.failure });
                throw new UnauthorizedException(
                    StatusClient.HTTP_STATUS_UNAUTHORIZED.message,
                );
            }

            this.logger.debug('Generating JWT token');
            const jwtToken = await this.tokenService.generateToken({
                userId: userId,
                email: email,
            });

            const userSession = {
                userId: userId,
                jwtToken: jwtToken,
            };

            this.logger.log(`User logged in successfully, userId: ${userId}`);
            this.loginTotal.inc({ result: promCondition.success });
            return userSession;
        } catch (e) {
            this.logger.error('Error in Login', e.stack);
            this.loginTotal.inc({ result: promCondition.failure });
            throw e;
        } finally {
            end();
            this.logger.debug('Login process completed');
        }
    }
}
