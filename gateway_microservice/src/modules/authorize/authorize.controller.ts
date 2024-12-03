import {
    Body,
    Controller,
    Delete,
    Param,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { RegisterRequest } from 'src/protos/proto_gen_files/auth';
import { AuthorizeService } from './authorize.service';
import { myOptionalCookieOptions } from 'src/config/config.cookie';
import {
    LoginFormDTO,
    LoginResponseDTO,
    LogoutResponseDTO,
    RegisterFormDTO,
    RegisterResponseDTO,
    RemoveAccountRequestDTO,
    RemoveAccountResponseDTO,
} from './dto';
import { promCondition, StatusClient } from 'src/common/status';
import { errMessages, summaryData } from 'src/common/messages';
import {
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { authDescription } from 'src/common/api/auth';

import { Response, Request } from 'express';

@ApiTags('Авторизация/Аутентификация')
@Controller('auth')
export class AuthorizeController {
    constructor(
        private readonly authorizeService: AuthorizeService,

        @InjectMetric('PROM_METRIC_AUTH_LOGIN_TOTAL')
        private readonly loginTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_AUTH_LOGIN_DURATION')
        private readonly loginDuration: Histogram<string>,

        @InjectMetric('PROM_METRIC_AUTH_REGISTER_TOTAL')
        private readonly registerTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_AUTH_REGISTER_DURATION')
        private readonly registerDuration: Histogram<string>,

        @InjectMetric('PROM_METRIC_AUTH_LOGOUT_TOTAL')
        private readonly logoutTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_AUTH_LOGOUT_DURATION')
        private readonly logoutDuration: Histogram<string>,

        @InjectMetric('PROM_METRIC_AUTH_DELETE_TOTAL')
        private readonly deleteTotal: Counter<string>,

        @InjectMetric('PROM_METRIC_AUTH_DELETE_DURATION')
        private readonly deleteDuration: Histogram<string>,
    ) {}

    @Post('login')
    @ApiOperation({
        summary: summaryData.loginUser,
        description: authDescription.loginDocs,
    })
    @ApiCookieAuth()
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: LoginResponseDTO,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_BAD_REQUEST.status,
        description: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_UNAUTHORIZED.status,
        description: StatusClient.HTTP_STATUS_UNAUTHORIZED.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiBody({
        type: LoginFormDTO,
    })
    async loginUser(
        @Body() payload: LoginFormDTO,
        @Res() res: Response,
    ): Promise<Response<LoginResponseDTO>> {
        const end = this.loginDuration.startTimer();
        try {
            const { email, password, phoneNumber } = payload;
            if (
                (!email && !phoneNumber) ||
                !password ||
                (email && phoneNumber)
            ) {
                this.loginTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { userId, jwtToken } =
                await this.authorizeService.loginUser(payload);

            if (!userId || !jwtToken) {
                this.loginTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message:
                            StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR
                                .message,
                    })
                    .status(
                        StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
                    );
            }

            res.cookie('jwtToken', jwtToken, myOptionalCookieOptions);
            res.cookie('userId', userId.toString(), myOptionalCookieOptions);

            this.loginTotal.inc({ result: promCondition.success });
            return res
                .json({
                    data: { userId, jwtToken },
                    message: StatusClient.HTTP_STATUS_OK.message,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.loginTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.login,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post('register')
    @ApiOperation({
        summary: summaryData.registerUser,
        description: authDescription.registerDocs,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_CREATED.status,
        description: StatusClient.HTTP_STATUS_CREATED.message,
        type: RegisterResponseDTO,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_BAD_REQUEST.status,
        description: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiBody({
        type: RegisterFormDTO,
    })
    async registerUser(
        @Body() payload: RegisterRequest,
        @Res() res: Response,
    ): Promise<Response<RegisterResponseDTO>> {
        const end = this.registerDuration.startTimer();
        try {
            const { username, password, email, phoneNumber } = payload;
            if (!username || !password || !email || !phoneNumber) {
                this.registerTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message: data, status } =
                await this.authorizeService.registerUser(payload);

            if (!data || !status) {
                this.registerTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message:
                            StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR
                                .message,
                    })
                    .status(
                        StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
                    );
            }

            this.registerTotal.inc({ result: promCondition.success });
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_CREATED.message,
                    data,
                })
                .status(status);
        } catch (e) {
            this.registerTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.registry, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Delete('delete')
    @ApiOperation({
        summary: summaryData.deleteUser,
        description: authDescription.removeDocs,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: RemoveAccountResponseDTO,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_BAD_REQUEST.status,
        description: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiBody({
        type: RemoveAccountRequestDTO,
    })
    async DeleteUser(
        @Body() password: string,
        @Res() res: Response,
        @Req() req: Request,
    ): Promise<Response<RemoveAccountResponseDTO>> {
        const end = this.deleteDuration.startTimer();
        try {
            const userId = +req.cookies.userId;
            if (!password || !userId) {
                this.deleteTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const payload: RemoveAccountRequestDTO = { userId, password };

            const { message } = await this.authorizeService.DeleteUser(payload);
            if (!message) {
                this.deleteTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message:
                            StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR
                                .message,
                    })
                    .status(
                        StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
                    );
            }

            this.deleteTotal.inc({ result: promCondition.success });
            return res
                .json({ message })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.deleteTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.delUser,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post('logout')
    @ApiOperation({
        summary: summaryData.logoutUser,
        description: authDescription.logoutDocs,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: LogoutResponseDTO,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_BAD_REQUEST.status,
        description: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    async logoutUser(
        @Param('userId') userId: number,
        @Param('jwtToken') jwtToken: string,
        @Res() res: Response,
    ): Promise<Response<LogoutResponseDTO>> {
        const end = this.logoutDuration.startTimer();
        try {
            if (!userId || !jwtToken) {
                this.logoutTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message, status } = await this.authorizeService.logoutUser({
                userId,
                jwtToken,
            });

            if (!message || !status) {
                this.logoutTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message:
                            StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR
                                .message,
                    })
                    .status(
                        StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
                    );
            }

            res.clearCookie('jwtToken');
            res.clearCookie('userId');

            this.logoutTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.logoutTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.logout,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }
}
