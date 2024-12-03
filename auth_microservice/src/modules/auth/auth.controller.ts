import {
    BadRequestException,
    Controller,
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
import { StatusClient } from 'src/common/status';

@Controller('AuthService')
export class AuthService implements AuthInterface {
    constructor(
        private readonly cryptService: CryptService,
        private readonly tokenService: TokenService,

        @InjectMetric('PROM_METRIC_AUTH_LOGIN_TOTAL')
        private readonly loginTotal: Counter<string>,
        @InjectMetric('PROM_METRIC_AUTH_LOGIN_FAILURE_TOTAL')
        private readonly loginFailureTotal: Counter<string>,
        @InjectMetric('PROM_METRIC_AUTH_LOGIN_DURATION')
        private readonly loginDuration: Histogram<string>,
        @InjectMetric('PROM_METRIC_AUTH_REGISTER_DURATION')
        private readonly registerDuration: Histogram<string>,
        @InjectMetric('PROM_METRIC_AUTH_REGISTER_TOTAL')
        private readonly registerTotal: Counter<string>,
    ) {}

    async ToHashPassword(
        payload: ToHashPasswordRequest,
    ): Promise<ToHashPasswordResponse> {
        try {
            if (!payload.password) {
                throw new InternalServerErrorException('Ошибка сервера');
            }

            const hashedPassword = await this.cryptService.hashPassword(
                payload.password,
            );

            return { hashedPassword };
        } catch (e) {
            throw new InternalServerErrorException(
                `${StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message}: ${e}`,
            );
        }
    }

    @GrpcMethod('AuthService', 'CheckPassword')
    async CheckPassword(
        payload: CheckPasswordRequest,
    ): Promise<CheckPasswordResponse> {
        try {
            if (!payload.hashedPassword || !payload.password) {
                throw new BadRequestException('Data without');
            }

            const booleanAnswer = await this.cryptService.comparePassword(
                payload.password,
                payload.hashedPassword,
            );

            return { exist: booleanAnswer };
        } catch (e) {
            throw new InternalServerErrorException(
                `${StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message}: ${e}`,
            );
        }
    }

    @GrpcMethod('AuthService', 'Register')
    async Register(data: RegisterRequest): Promise<RegisterResponse> {
        const end = this.registerDuration.startTimer();
        try {
            if (!data.email && !data.phoneNumber && !data.password)
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );

            const hashedPassword = await this.cryptService.hashPassword(
                data.password,
            );

            this.registerTotal.inc();
            return {
                username: data.username,
                email: data.email,
                passwordHash: hashedPassword,
                phoneNumber: data.phoneNumber,
            };
        } catch (e) {
            throw new InternalServerErrorException(
                `${StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message}: ${e}`,
            );
        } finally {
            end();
        }
    }

    @GrpcMethod('AuthService', 'Login')
    async Login(data: LoginRequest): Promise<LoginResponse> {
        const end = this.loginDuration.startTimer();
        try {
            const { email, password, passwordHash, userId } = data;

            const checkUser = await this.cryptService.comparePassword(
                password,
                passwordHash,
            );

            if (checkUser) {
                const jwtToken = await this.tokenService.generateToken({
                    userId: userId,
                    email: email,
                });

                const userSessia = {
                    userId: userId,
                    jwtToken: jwtToken,
                };

                this.loginTotal.inc();
                return userSessia;
            } else {
                this.loginFailureTotal.inc();
                throw new UnauthorizedException(
                    StatusClient.HTTP_STATUS_UNAUTHORIZED.message,
                );
            }
        } catch (e) {
            throw new InternalServerErrorException(
                `${StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message}: ${e}`,
            );
        } finally {
            end();
        }
    }
}
