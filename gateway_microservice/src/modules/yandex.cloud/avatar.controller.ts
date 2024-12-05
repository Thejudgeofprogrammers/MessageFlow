import {
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {
    DeleteAvatarUserRequest,
    DeleteAvatarUserResponse,
    FindUserAvatarArrayRequest,
    FindUserAvatarArrayResponse,
    FindUserAvatarRequest,
    FindUserAvatarResponse,
    UploadAvatarUserRequest,
    UploadAvatarUserResponse,
} from 'src/protos/proto_gen_files/content';
import { Request, Response } from 'express';
import { promCondition, StatusClient } from 'src/common/status';
import { errMessages, summaryData } from 'src/common/messages';
import { AvatarProvider } from './avatar.provider';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { YandexCloudStorageService } from './yandex-cloud-storage.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import {
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import {
    avatarIdDTO,
    DeleteAvatarUserResponseDTO,
    FindUserAvatarArrayResponseDTO,
    FindUserAvatarResponseDTO,
    UploadAvatarUserResponseDTO,
    userIdDTO,
} from './dto';
import { avatarDescription } from 'src/common/api/avatar';

@Controller('avatar')
export class AvatarController {
    constructor(
        private readonly avatarService: AvatarProvider,
        private readonly yandexCloud: YandexCloudStorageService,

        @InjectMetric('UPLOAD_AVATAR_USER_TOTAL')
        private readonly uploadAvatarUserTotal: Counter<string>,
        @InjectMetric('UPLOAD_AVATAR_USER_DURATION')
        private readonly uploadAvatarUserDuration: Histogram<string>,

        @InjectMetric('FIND_USER_AVATAR_ARRAY_TOTAL')
        private readonly findUserAvatarArrayTotal: Counter<string>,
        @InjectMetric('FIND_USER_AVATAR_ARRAY_DURATION')
        private readonly findUserAvatarArrayDuration: Histogram<string>,

        @InjectMetric('FIND_USER_AVATAR_TOTAL')
        private readonly findUserAvatarTotal: Counter<string>,
        @InjectMetric('FIND_USER_AVATAR_DURATION')
        private readonly findUserAvatarDuration: Histogram<string>,

        @InjectMetric('DELETE_AVATAR_USER_TOTAL')
        private readonly deleteAvatarUserTotal: Counter<string>,
        @InjectMetric('DELETE_AVATAR_USER_DURATION')
        private readonly deleteAvatarUserDuration: Histogram<string>,
    ) {}

    @Post('upload')
    @ApiOperation({
        summary: summaryData.uploadAvatarUser,
        description: avatarDescription.uploadAvatarUser,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: UploadAvatarUserResponseDTO,
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
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async UploadAvatarUser(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<UploadAvatarUserResponse>> {
        const end = this.uploadAvatarUserDuration.startTimer();
        try {
            const validateUserId = +req.cookies.userId;
            if (!validateUserId) {
                this.uploadAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { avatarUrl } = await this.yandexCloud.uploadFile(file);
            if (!avatarUrl) {
                this.uploadAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message, status } =
                await this.avatarService.UploadAvatarUser({
                    userId: validateUserId,
                    avatarUrl,
                } as UploadAvatarUserRequest);
            if (!message && !status) {
                this.uploadAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
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

            this.uploadAvatarUserTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.uploadAvatarUserTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.uploadAvatarUser,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('find/:userId')
    @ApiOperation({
        summary: summaryData.findUserAvatarArray,
        description: avatarDescription.findUserAvatarArray,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserAvatarArrayResponseDTO,
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
        name: 'userId',
        type: userIdDTO,
    })
    async FindUserAvatarArray(
        @Param('userId') userId: number,
        @Res() res: Response,
    ): Promise<Response<FindUserAvatarArrayResponse>> {
        const end = this.findUserAvatarArrayDuration.startTimer();
        try {
            if (!userId) {
                this.findUserAvatarArrayTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const validateUserId = +userId;
            const { message, status, data } =
                await this.avatarService.FindUserAvatarArray({
                    userId: validateUserId,
                } as FindUserAvatarArrayRequest);

            if (!message && !status) {
                this.findUserAvatarArrayTotal.inc({
                    result: promCondition.failure,
                });
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

            this.findUserAvatarArrayTotal.inc({
                result: promCondition.success,
            });
            return res.json({ message, data }).status(status);
        } catch (e) {
            this.findUserAvatarArrayTotal.inc({
                result: promCondition.failure,
            });
            return res
                .json({
                    message: errMessages.findUserAvatarArray,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('find/:userId/:avatarId')
    @ApiOperation({
        summary: summaryData.findUserAvatar,
        description: avatarDescription.findUserAvatar,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: FindUserAvatarResponseDTO,
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
        name: 'userId',
        type: userIdDTO,
    })
    @ApiParam({
        name: 'avatarId',
        type: avatarIdDTO,
    })
    async FindUserAvatar(
        @Param('userId') userId: number,
        @Param('avatarId') avatarId: number,
        @Res() res: Response,
    ): Promise<Response<FindUserAvatarResponse>> {
        const end = this.findUserAvatarDuration.startTimer();
        try {
            if (!userId && !avatarId) {
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const validateUserId = +userId;
            const { message, status, data } =
                await this.avatarService.FindUserAvatar({
                    avatarId,
                    userId: validateUserId,
                } as FindUserAvatarRequest);

            if (!message && !status) {
                this.findUserAvatarTotal.inc({ result: promCondition.failure });
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

            this.findUserAvatarTotal.inc({ result: promCondition.success });
            return res.json({ message, data }).status(status);
        } catch (e) {
            this.findUserAvatarTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.findUserAvatar, error: e.message })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Delete('del/:avatarId')
    @ApiOperation({
        summary: summaryData.findUserAvatar,
        description: avatarDescription.findUserAvatar,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: DeleteAvatarUserResponseDTO,
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
        name: 'avatarId',
        type: avatarIdDTO,
    })
    async DeleteAvatarUser(
        @Param('avatarId') avatarId: number,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<DeleteAvatarUserResponse>> {
        const end = this.deleteAvatarUserDuration.startTimer();
        try {
            const validateUserId = +req.cookies.userId;
            if (!validateUserId) {
                this.deleteAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { message, status } =
                await this.avatarService.DeleteAvatarUser({
                    avatarId,
                    userId: validateUserId,
                } as DeleteAvatarUserRequest);

            if (!message && !status) {
                this.deleteAvatarUserTotal.inc({
                    result: promCondition.failure,
                });
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

            this.deleteAvatarUserTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.deleteAvatarUserTotal.inc({ result: promCondition.failure });
            return res
                .json({
                    message: errMessages.deleteAvatarUser,
                    error: e.message,
                })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }
}
