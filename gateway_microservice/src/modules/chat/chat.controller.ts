import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { errMessages, summaryData } from 'src/common/messages';
import { promCondition, StatusClient } from 'src/common/status';
import { ChatService } from './chat.service';
import {
    CreateNewChatRequest,
    DeleteChatByIdRequest,
    KickUserFromChatRequest,
    KickUserFromChatResponse,
    LeaveFromChatRequest,
    LoadToChatRequest,
    PermissionToAdminRequest,
    PermissionToAdminResponse,
    PermissionToMemberRequest,
    PermissionToMemberResponse,
} from 'src/protos/proto_gen_files/chat';
import {
    ApiBody,
    ApiCookieAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
} from '@nestjs/swagger';
import {
    CreateNewChatRequestDTO,
    CreateNewChatResponseDTO,
    DeleteChatByIdRequestDTO,
    DeleteChatByIdResponseDTO,
    GetChatByChatNameRequestDTO,
    GetChatByChatNameResponseDTO,
    GetChatByIdRequestDTO,
    GetChatByIdResponseDTO,
    KickUserFromChatParamsOneDTO,
    KickUserFromChatParamsTwoDTO,
    KickUserFromChatRequestDTO,
    KickUserFromChatResponseDTO,
    LeaveToChatRequestDTO,
    LeaveToChatResponseDTO,
    LoadToChatRequestDTO,
    LoadToChatResponseDTO,
    PermissionToAdminRequestDTO,
    PermissionToAdminRequestParamsDTO,
    PermissionToAdminResponseDTO,
    PermissionToMemberRequestDTO,
    PermissionToMemberRequestParamsDTO,
    PermissionToMemberResponseDTO,
    UpdateChatByIdParamsDTO,
    UpdateChatByIdRequestDTO,
    UpdateChatByIdResponseDTO,
} from './dto';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';
import { chatDescription } from 'src/common/api/chat';

@Controller('chat')
export class ChatController {
    constructor(
        private readonly chatService: ChatService,

        @InjectMetric('PERMISSION_TO_ADMIN_TOTAL')
        private readonly permissionToAdminTotal: Counter<string>,
        @InjectMetric('PERMISSION_TO_ADMIN_DURATION')
        private readonly permissionToAdminDuration: Histogram<string>,

        @InjectMetric('PERMISSION_TO_MEMBER_TOTAL')
        private readonly permissionToMemberTotal: Counter<string>,
        @InjectMetric('PERMISSION_TO_MEMBER_DURATION')
        private readonly permissionToMemberDuration: Histogram<string>,

        @InjectMetric('LOAD_TO_CHAT_TOTAL')
        private readonly loadToChatTotal: Counter<string>,
        @InjectMetric('LOAD_TO_CHAT_DURATION')
        private readonly loadToChatDuration: Histogram<string>,

        @InjectMetric('LEAVE_FROM_CHAT_TOTAL')
        private readonly leaveFromChatTotal: Counter<string>,
        @InjectMetric('LEAVE_FROM_CHAT_DURATION')
        private readonly leaveFromChatDuration: Histogram<string>,

        @InjectMetric('CREATE_NEW_CHAT_TOTAL')
        private readonly createNewChatTotal: Counter<string>,
        @InjectMetric('CREATE_NEW_CHAT_DURATION')
        private readonly createNewChatDuration: Histogram<string>,

        @InjectMetric('GET_CHAT_BY_ID_TOTAL')
        private readonly getChatByIdTotal: Counter<string>,
        @InjectMetric('GET_CHAT_BY_ID_DURATION')
        private readonly getChatByIdDuration: Histogram<string>,

        @InjectMetric('GET_CHAT_BY_CHAT_NAME_TOTAL')
        private readonly getChatByChatNameTotal: Counter<string>,
        @InjectMetric('GET_CHAT_BY_CHAT_NAME_DURATION')
        private readonly getChatByChatNameDuration: Histogram<string>,

        @InjectMetric('UPDATE_CHAT_BY_ID_TOTAL')
        private readonly updateChatByIdTotal: Counter<string>,
        @InjectMetric('UPDATE_CHAT_BY_ID_DURATION')
        private readonly updateChatByIdDuration: Histogram<string>,

        @InjectMetric('DELETE_CHAT_BY_ID_TOTAL')
        private readonly deleteChatByIdTotal: Counter<string>,
        @InjectMetric('DELETE_CHAT_BY_ID_DURATION')
        private readonly deleteChatByIdDuration: Histogram<string>,

        @InjectMetric('KICK_CHAT_TOTAL')
        private readonly kickUserFromChatTotal: Counter<string>,
        @InjectMetric('KICK_CHAT_DURATION')
        private readonly kickUserFromChatDuration: Histogram<string>,
    ) {}

    @Post(':chatId/get/admin')
    @ApiOperation({
        summary: summaryData.permissionToAdmin,
        description: chatDescription.permissionToAdminDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: PermissionToAdminResponseDTO,
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
        status: StatusClient.HTTP_STATUS_FORBIDDEN.status,
        description: StatusClient.HTTP_STATUS_FORBIDDEN.message,
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
        type: PermissionToAdminRequestDTO,
    })
    @ApiParam({
        name: 'chatId',
        type: PermissionToAdminRequestParamsDTO,
    })
    async PermissionToAdmin(
        @Res() res: Response,
        @Req() req: Request,
        @Body() participantId: number,
        @Param(':chatId') chatId: string,
    ): Promise<Response<PermissionToAdminResponse>> {
        const end = this.permissionToAdminDuration.startTimer();
        try {
            const userId = +req.cookies.userId;
            if (!chatId || !userId || !participantId) {
                this.permissionToAdminTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }
            const data: PermissionToAdminRequest = {
                userId,
                chatId,
                participantId,
            };

            const { message, status } =
                await this.chatService.PermissionToAdmin(data);

            if (!message || !status) {
                this.permissionToAdminTotal.inc({
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

            this.permissionToAdminTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.permissionToAdminTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.permissionToAdmin })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post(':chatId/get/member')
    @ApiOperation({
        summary: summaryData.permissionToMember,
        description: chatDescription.permissionToMemberDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: PermissionToMemberResponseDTO,
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
        status: StatusClient.HTTP_STATUS_FORBIDDEN.status,
        description: StatusClient.HTTP_STATUS_FORBIDDEN.message,
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
        type: PermissionToMemberRequestDTO,
    })
    @ApiParam({
        name: 'chatId',
        type: PermissionToMemberRequestParamsDTO,
    })
    async PermissionToMember(
        @Res() res: Response,
        @Req() req: Request,
        @Body() participantId: number,
        @Param(':chatId') chatId: string,
    ): Promise<Response<PermissionToMemberResponse>> {
        const end = this.permissionToMemberDuration.startTimer();
        try {
            const userId = +req.cookies.userId;
            if (!userId || !chatId || !participantId) {
                this.permissionToMemberTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const data: PermissionToMemberRequest = {
                userId,
                chatId,
                participantId,
            };

            const { message, status } =
                await this.chatService.PermissionToMember(data);

            if (!message || !status) {
                this.permissionToMemberTotal.inc({
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

            this.permissionToMemberTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.permissionToMemberTotal.inc({
                result: promCondition.failure,
            });
            return res
                .json({ message: errMessages.permissionToMember })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post(':chatId/join')
    @ApiOperation({
        summary: summaryData.loadToChat,
        description: chatDescription.JoinChatDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: LoadToChatResponseDTO,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_BAD_REQUEST.status,
        description: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
    })
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
        description: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
    })
    @ApiParam({
        name: 'chatId',
        type: LoadToChatRequestDTO,
    })
    async LoadToChat(
        @Param('chatId') chatId: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<LoadToChatResponseDTO>> {
        const end = this.loadToChatDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!chatId || !userId) {
                this.loadToChatTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const updatedPayload: LoadToChatRequest = { chatId, userId };

            const { message, status } =
                await this.chatService.LoadToChat(updatedPayload);

            if (!message || !status) {
                this.loadToChatTotal.inc({ result: promCondition.failure });
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

            this.loadToChatTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.loadToChatTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.loadToChat })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post(':chatId/leave')
    @ApiOperation({
        summary: summaryData.leaveFromChat,
        description: chatDescription.LeaveChatDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: LeaveToChatResponseDTO,
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
        name: 'chatId',
        type: LeaveToChatRequestDTO,
    })
    async LeaveFromChat(
        @Param('chatId') chatId: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<LeaveToChatResponseDTO>> {
        const end = this.leaveFromChatDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!userId || !chatId) {
                this.leaveFromChatTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const updatedPayload: LeaveFromChatRequest = { chatId, userId };

            const { message, status } =
                await this.chatService.LeaveFromChat(updatedPayload);

            if (!message || !status) {
                this.leaveFromChatTotal.inc({ result: promCondition.failure });
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

            this.leaveFromChatTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.leaveFromChatTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.leaveFromChat })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post('create')
    @ApiOperation({
        summary: summaryData.createChat,
        description: chatDescription.CreateNewChatDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_CREATED.status,
        description: StatusClient.HTTP_STATUS_CREATED.message,
        type: CreateNewChatResponseDTO,
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
        type: CreateNewChatRequestDTO,
    })
    async createNewChat(
        @Body() payload: CreateNewChatRequestDTO,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<CreateNewChatResponseDTO>> {
        const end = this.createNewChatDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!userId || !payload.chatName || !payload.chatType) {
                this.createNewChatTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const updatedPayload: CreateNewChatRequest = { ...payload, userId };

            const { chatId } =
                await this.chatService.CreateNewChat(updatedPayload);

            if (!chatId) {
                this.createNewChatTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.createNewChatTotal.inc({ result: promCondition.success });
            return res
                .json({
                    data: { chatId },
                    message: StatusClient.HTTP_STATUS_CREATED.message,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.createNewChatTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.createNewChat })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('chatId/:chatId')
    @ApiOperation({
        summary: summaryData.getChatById,
        description: chatDescription.FindByIdDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: GetChatByIdResponseDTO,
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
        name: 'chatId',
        type: GetChatByIdRequestDTO,
    })
    async GetChatById(
        @Param('chatId') chatId: string,
        @Res() res: Response,
    ): Promise<Response<GetChatByIdResponseDTO>> {
        const end = this.getChatByIdDuration.startTimer();
        try {
            if (!chatId) {
                this.getChatByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { chatData: data } = await this.chatService.GetChatById({
                chatId,
            });

            if (!data) {
                this.getChatByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.getChatByIdTotal.inc({ result: promCondition.success });
            return res
                .json({ data, message: StatusClient.HTTP_STATUS_OK.message })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.getChatByIdTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.getChatById })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Get('chatName/:chatName')
    @ApiOperation({
        summary: summaryData.getChatByChatName,
        description: chatDescription.getChatByChatNameDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: [GetChatByChatNameResponseDTO],
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
        name: 'chatName',
        type: GetChatByChatNameRequestDTO,
    })
    async GetChatByChatName(
        @Param('chatName') chatName: string,
        @Res() res: Response,
    ): Promise<Response<GetChatByChatNameResponseDTO[]>> {
        const end = this.getChatByChatNameDuration.startTimer();
        try {
            if (!chatName) {
                this.getChatByChatNameTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const { chatData } = await this.chatService.GetChatByChatName({
                chatName,
            });

            if (!chatData) {
                this.getChatByChatNameTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_NOT_FOUND.message,
                    })
                    .status(StatusClient.HTTP_STATUS_NOT_FOUND.status);
            }

            this.getChatByChatNameTotal.inc({
                result: promCondition.success,
            });
            return res
                .json({
                    data: chatData,
                    message: StatusClient.HTTP_STATUS_OK.message,
                })
                .status(StatusClient.HTTP_STATUS_OK.status);
        } catch (e) {
            this.getChatByChatNameTotal.inc({
                result: promCondition.failure,
            });
            return res
                .json({ message: errMessages.getChatByChatName })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Put('update/:chatId')
    @ApiOperation({
        summary: summaryData.updateChatById,
        description: chatDescription.updateChatByIdDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: UpdateChatByIdResponseDTO,
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
        status: StatusClient.HTTP_STATUS_FORBIDDEN.status,
        description: StatusClient.HTTP_STATUS_FORBIDDEN.message,
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
        type: UpdateChatByIdRequestDTO,
    })
    @ApiParam({
        name: 'chatId',
        type: UpdateChatByIdParamsDTO,
    })
    async UpdateChatById(
        @Param('chatId') chatId: string,
        @Body() payload: Omit<UpdateChatByIdRequestDTO, 'chatId'>,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<UpdateChatByIdResponseDTO>> {
        const end = this.updateChatByIdDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!chatId || !userId) {
                this.updateChatByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const data = { chatId, ...payload, userId };

            const {
                response: { message, status },
            } = await this.chatService.UpdateChatById(data);

            if (!message || !status) {
                this.updateChatByIdTotal.inc({ result: promCondition.failure });
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

            this.updateChatByIdTotal.inc({ result: promCondition.success });
            return res.json({ message }).status(status);
        } catch (e) {
            this.updateChatByIdTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.updateChatById })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Delete('delete/:chatId')
    @ApiOperation({
        summary: summaryData.deleteChatById,
        description: chatDescription.deleteChatByIdDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: DeleteChatByIdResponseDTO,
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
        status: StatusClient.HTTP_STATUS_FORBIDDEN.status,
        description: StatusClient.HTTP_STATUS_FORBIDDEN.message,
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
        name: 'chatId',
        type: DeleteChatByIdRequestDTO,
    })
    async DeleteChatById(
        @Param('chatId') chatId: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<DeleteChatByIdResponseDTO>> {
        const end = this.deleteChatByIdDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!userId || !chatId) {
                this.deleteChatByIdTotal.inc({ result: promCondition.failure });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const data: DeleteChatByIdRequest = {
                chatId,
                userId,
            };

            const { message } = await this.chatService.DeleteChatById(data);

            if (!message) {
                this.deleteChatByIdTotal.inc({ result: promCondition.failure });
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

            this.deleteChatByIdTotal.inc({ result: promCondition.success });
            return res
                .json({ message })
                .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
        } catch (e) {
            this.deleteChatByIdTotal.inc({ result: promCondition.failure });
            return res
                .json({ message: errMessages.deleteChatById })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }

    @Post(':chatId/:participantId/kick')
    @ApiOperation({
        summary: summaryData.kickUserFromChat,
        description: chatDescription.kickUserFromChatDocs,
    })
    @ApiCookieAuth('userId')
    @ApiCookieAuth('jwtToken')
    @ApiResponse({
        status: StatusClient.HTTP_STATUS_OK.status,
        description: StatusClient.HTTP_STATUS_OK.message,
        type: KickUserFromChatResponseDTO,
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
        type: KickUserFromChatRequestDTO,
    })
    @ApiParam({
        name: 'chatId',
        type: KickUserFromChatParamsOneDTO,
    })
    @ApiParam({
        name: 'participantId',
        type: KickUserFromChatParamsTwoDTO,
    })
    async KickUserFromChat(
        @Param('userId') participantId: number,
        @Param('chatId') chatId: string,
        @Req() req: Request,
        @Res() res: Response,
    ): Promise<Response<KickUserFromChatResponse>> {
        const end = this.kickUserFromChatDuration.startTimer();
        try {
            const userId = +req.cookies.userId;

            if (!userId || !participantId || !chatId) {
                this.kickUserFromChatTotal.inc({
                    result: promCondition.failure,
                });
                return res
                    .json({
                        message: StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                    })
                    .status(StatusClient.HTTP_STATUS_BAD_REQUEST.status);
            }

            const data: KickUserFromChatRequest = {
                userId,
                participantId,
                chatId,
            };

            const { message, status } =
                await this.chatService.KickUserFromChat(data);

            if (!message || !status) {
                this.kickUserFromChatTotal.inc({
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

            this.kickUserFromChatTotal.inc({
                result: promCondition.success,
            });
            return res.json({ message }).status(status);
        } catch (e) {
            this.kickUserFromChatTotal.inc({
                result: promCondition.failure,
            });
            return res
                .json({ message: errMessages.removeUserFromChat })
                .status(StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status);
        } finally {
            end();
        }
    }
}
