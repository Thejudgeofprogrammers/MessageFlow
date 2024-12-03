import { Body, Controller, Get, Param, Put, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { Response, Request } from 'express';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

import { promCondition, StatusClient } from 'src/common/status';
import { errMessages, summaryData } from 'src/common/messages';
import {
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import {
    FindUserByEmailRequestDTO,
    FindUserByEmailResponseDTO,
    FindUserByIdRequestDTO,
    FindUserByIdResponseDTO,
    FindUserByPhoneNumberRequestDTO,
    FindUserByPhoneNumberResponseDTO,
    FindUserByusernameRequestDTO,
    FindUserByUsernameResponseDTO,
    GetUserProfileRequestDTO,
    GetUserProfileResponseDTO,
    UpdateUserPasswordRequestDTO,
    UpdateUserPasswordResponseDTO,
    UpdateUserProfileRequestDTO,
    UpdateUserProfileResponseDTO,
} from './dto';
import { userDescription } from 'src/common/api/user';
import {
    GetUserProfileRequest,
    GetUserProfileResponse,
    UpdateUserPasswordRequest,
    UpdateUserPasswordResponse,
    UpdateUserProfileRequest,
    UpdateUserProfileResponse,
} from 'src/protos/proto_gen_files/user';

type ResponseWithoutPassword<T> = Promise<Response<Omit<T, 'passwordHash'>>>;

@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,

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

        @InjectMetric('FIND_USER_BY_ID_TOTAL')
        private readonly findUserByIdTotal: Counter<string>,
        @InjectMetric('FIND_USER_BY_ID_DURATION')
        private readonly findUserByIdDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_PHONE_TOTAL')
        private readonly findUserByPhoneTotal: Counter<string>,
        @InjectMetric('FIND_USER_BY_PHONE_DURATION')
        private readonly findUserByPhoneDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_EMAIL_TOTAL')
        private readonly findUserByEmailTotal: Counter<string>,
        @InjectMetric('FIND_USER_BY_EMAIL_DURATION')
        private readonly findUserByEmailDuration: Histogram<string>,

        @InjectMetric('FIND_USER_BY_USERNAME_TOTAL')
        private readonly findUserByUsernameTotal: Counter<string>,
        @InjectMetric('FIND_USER_BY_USERNAME_DURATION')
        private readonly findUserByUsernameDuration: Histogram<string>,
    ) {}

    @Get('profile/update')
    @ApiOperation({
        summary: summaryData.updateUserProfile,
        description: userDescription.updateUserProfile,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: UpdateUserProfileResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiBody({
        type: UpdateUserProfileRequestDTO,
    })
    async UpdateUserProfile(
        request: UpdateUserProfileRequest,
        @Body() description: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<UpdateUserProfileResponse>> {
        const end = this.updateUserProfileDuration.startTimer();
        try {
            const userId = +req.cookies.userId;
            if (!userId || !description) {
                this.updateUserProfileTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message, status } =
                await this.userService.UpdateUserProfile({
                    userId,
                    description,
                });

            if (!message || !status) {
                this.updateUserProfileTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.updateUserProfileTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.updateUserProfileTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.updateUserProfile,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get(':userId/profile')
    @ApiOperation({
        summary: summaryData.getUserProfile,
        description: userDescription.getUserProfile,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: GetUserProfileResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({ name: 'userId', type: GetUserProfileRequestDTO })
    async GetUserProfile(
        @Param('userId') userId: number,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<GetUserProfileResponse>> {
        const end = this.getUserProfileDuration.startTimer();
        try {
            const whoFind = +req.cookies.userId;

            if (!whoFind || !userId) {
                this.getUserProfileTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const validateUserId = +userId;
            const { message, status } = await this.userService.GetUserProfile({
                userId: validateUserId,
                whoFind,
            } as GetUserProfileRequest);

            if (!message || !status) {
                this.getUserProfileTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.getUserProfileTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.getUserProfileTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.getUserProfile, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Put('update/password')
    @ApiOperation({
        summary: summaryData.updateUserPassword,
        description: userDescription.updateUserPassword,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: UpdateUserPasswordResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiBody({
        type: UpdateUserPasswordRequestDTO,
    })
    async UpdateUserPassword(
        @Body() payload: UpdateUserPasswordRequest,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<UpdateUserPasswordResponse>> {
        const end = this.updateUserPasswordDuration.startTimer();
        try {
            const userId = +req.cookies.userId;
            const { password } = payload;
            if (!userId || !password) {
                this.updateUserPasswordTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message, status } =
                await this.userService.UpdateUserPassword({
                    userId,
                    password,
                });

            if (!message || !status) {
                this.updateUserPasswordTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.updateUserPasswordTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.updateUserPasswordTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.updateUserPassword,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('user/:userId')
    @ApiOperation({
        summary: summaryData.findUserById,
        description: userDescription.findUserById,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserByIdResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({ name: 'userId', type: FindUserByIdRequestDTO })
    async findUserById(
        @Param('userId') userId: number,
        @Res() res: Response,
    ): ResponseWithoutPassword<Response<FindUserByIdResponseDTO>> {
        const end = this.findUserByIdDuration.startTimer();
        try {
            if (!userId) {
                this.findUserByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { userData } = await this.userService.FindUserById({
                userId,
            });

            if (!userData) {
                this.findUserByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.findUserByIdTotal.inc({ result: promCondition.success });
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_OK.message,
                    data: userData,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.findUserByIdTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.findUserById, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('phone/:phoneNumber')
    @ApiOperation({
        summary: summaryData.findUserByPhoneNumber,
        description: userDescription.findUserByPhoneDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserByPhoneNumberResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({
        name: 'phoneNumber',
        type: FindUserByPhoneNumberRequestDTO,
    })
    async findUserByPhone(
        @Param('phoneNumber') phoneNumber: string,
        @Res() res: Response,
    ): ResponseWithoutPassword<Response<FindUserByPhoneNumberResponseDTO>> {
        const end = this.findUserByPhoneDuration.startTimer();
        try {
            if (!phoneNumber) {
                this.findUserByPhoneTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { userData } = await this.userService.FindUserByPhoneNumber({
                phoneNumber,
            });

            if (!userData) {
                this.findUserByPhoneTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.findUserByPhoneTotal.inc({ result: promCondition.success });
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_OK.message,
                    data: userData,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.findUserByPhoneTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.findByPhone, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('email/:email')
    @ApiOperation({
        summary: summaryData.findUserByEmail,
        description: userDescription.findUserByEmailDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserByEmailResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({
        name: 'email',
        type: FindUserByEmailRequestDTO,
    })
    async findUserByEmail(
        @Param('email') email: string,
        @Res() res: Response,
    ): ResponseWithoutPassword<Response<FindUserByEmailResponseDTO>> {
        const end = this.findUserByEmailDuration.startTimer();
        try {
            if (!email) {
                this.findUserByEmailTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { userData: data } = await this.userService.FindUserByEmail({
                email,
            });

            if (!data) {
                this.findUserByEmailTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.findUserByEmailTotal.inc({ result: promCondition.success });
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_OK.message,
                    data,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.findUserByEmailTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.findByEmail, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('username/:username')
    @ApiOperation({
        summary: summaryData.findUserByUsername,
        description: userDescription.findUserByUsernameDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserByUsernameResponseDTO,
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
        status: StatusClient.HTTP_STATUS_NOT_FOUND.status,
        description: StatusClient.HTTP_STATUS_NOT_FOUND.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({
        name: 'username',
        type: FindUserByusernameRequestDTO,
    })
    async findUsername(
        @Param('username') username: string,
        @Res() res: Response,
    ): Promise<Response<FindUserByUsernameResponseDTO>> {
        const end = this.findUserByUsernameDuration.startTimer();
        try {
            if (!username) {
                this.findUserByUsernameTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { users: data } = await this.userService.FindUserByUsername({
                username,
            });

            if (!data) {
                this.findUserByUsernameTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.findUserByUsernameTotal.inc({ result: promCondition.success });
            return res
                .json({
                    message: StatusClient.HTTP_STATUS_OK,
                    data,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.findUserByUsernameTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.findByUsername,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }
}
