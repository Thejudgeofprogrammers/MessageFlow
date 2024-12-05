import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    OnModuleInit,
} from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import {
    grpcClientOptionsChat,
    grpcClientOptionsUser,
} from 'src/config/grpc/grpc.options';
import {
    AddUserToChatRequest,
    AddUserToChatResponse,
    ChatService as ChatInterface,
    CreateNewChatRequest,
    CreateNewChatResponse,
    DeleteChatByIdRequest,
    DeleteChatByIdResponse,
    GetChatByChatNameRequest,
    GetChatByChatNameResponse,
    GetChatByIdRequest,
    GetChatByIdResponse,
    GetTokenAndAddToChatRequest,
    GetTokenAndAddToChatResponse,
    KickUserFromChatRequest,
    KickUserFromChatResponse,
    LeaveFromChatRequest,
    LoadToChatRequest,
    PermissionToMemberRequest,
    PermissionToMemberResponse,
    RemoveUserFromChatRequest,
    RemoveUserFromChatResponse,
    UpdateChatByIdRequest,
    UpdateChatByIdResponse,
} from 'src/protos/proto_gen_files/chat';
import { RpcException } from '@nestjs/microservices';
import { errMessages } from 'src/common/messages';
import { StatusClient } from 'src/common/status';
import { from, lastValueFrom } from 'rxjs';
import { UserService } from '../user/user.service';

import {
    ArrayLinkUsers,
    RemoveArrayChatRequest,
    RemoveArrayChatResponse,
    UserService as UserServiceClient,
} from 'src/protos/proto_gen_files/user';
import { DeleteChatByIdResponseDTO, LeaveFromChatResponseDTO } from './dto';
import { WinstonLoggerService } from '../logger/logger.service';
import { LoadToChatResponseDTO } from '../user/dto';

@Injectable()
export class ChatService implements OnModuleInit {
    @Client(grpcClientOptionsChat)
    private readonly chatClient: ClientGrpc;
    @Client(grpcClientOptionsUser)
    private readonly userClient: ClientGrpc;

    private chatMicroservice: ChatInterface;
    private userMicroservice: UserServiceClient;

    constructor(
        private readonly userService: UserService,
        private readonly logger: WinstonLoggerService,
    ) {}

    onModuleInit() {
        this.chatMicroservice =
            this.chatClient.getService<ChatInterface>('ChatService');
        this.userMicroservice =
            this.userClient.getService<UserServiceClient>('UserService');
    }

    async GetTokenAndAddToChat(
        payload: GetTokenAndAddToChatRequest,
    ): Promise<GetTokenAndAddToChatResponse> {
        try {
            const { chatId, userId } = payload;

            this.logger.debug(
                'Start process to get token and add user to chat',
            );

            if (!chatId || !userId) {
                this.logger.warn('Missing chatId or userId in request payload');
                throw new BadRequestException(
                    'untransmitted chatId or userId',
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                `Sending request to chat microservice for chatId: ${chatId}, userId: ${userId}`,
            );
            const { message, status } = await lastValueFrom(
                from(
                    this.chatMicroservice.GetTokenAndAddToChat({
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error('Failed to get token or add user to chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `User successfully added to chat with chatId: ${chatId}`,
            );
            return { message, status };
        } catch (e) {
            this.logger.error(
                'Error during process to get token and add to chat',
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.getTokenAndAddToChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async KickUserFromChat(
        payload: KickUserFromChatRequest,
    ): Promise<KickUserFromChatResponse> {
        try {
            const { chatId, participantId, userId } = payload;

            this.logger.debug('Start process to kick user from chat');

            if (!chatId || !participantId || !userId) {
                this.logger.warn(
                    'Missing chatId, participantId or userId in request payload',
                );
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                `Sending request to chat microservice to kick user with participantId: ${participantId}, chatId: ${chatId}, userId: ${userId}`,
            );
            const { message, status } = await lastValueFrom(
                from(
                    this.chatMicroservice.KickUserFromChat({
                        participantId,
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error('Failed to kick user from chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR,
                );
            }

            this.logger.log(
                `User successfully kicked from chat with chatId: ${chatId}`,
            );
            return { message, status };
        } catch (e) {
            this.logger.error(
                'Error during process to kick user from chat',
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.kickUserFromChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async PermissionToAdmin(
        payload: PermissionToMemberRequest,
    ): Promise<PermissionToMemberResponse> {
        try {
            const { chatId, participantId, userId } = payload;

            this.logger.debug('Start process to grant admin permission');

            if (!chatId || !participantId || !userId) {
                this.logger.warn(
                    'Missing chatId, participantId or userId in request payload',
                );
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                `Sending request to chat microservice to grant admin permission for participantId: ${participantId}, chatId: ${chatId}, userId: ${userId}`,
            );
            const { message, status } = await lastValueFrom(
                from(
                    this.chatMicroservice.PermissionToAdmin({
                        participantId,
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error('Failed to grant admin permission');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Admin permission successfully granted for user with userId: ${userId}`,
            );
            return { message, status };
        } catch (e) {
            this.logger.error(
                'Error during process to grant admin permission',
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.permissionToAdmin,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async PermissionToMember(
        payload: PermissionToMemberRequest,
    ): Promise<PermissionToMemberResponse> {
        try {
            const { participantId, chatId, userId } = payload;
            this.logger.debug(
                `Sending request to chat microservice to grant permission to member with participantId: ${participantId}, chatId: ${chatId}, userId: ${userId}`,
            );

            const { message, status } = await lastValueFrom(
                from(
                    this.chatMicroservice.PermissionToMember({
                        participantId,
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn('Failed to switch permission for member');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('Permission successfully granted to member');
            return {
                message,
                status,
            };
        } catch (e) {
            this.logger.error(
                'Error while granting permission to member',
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.permissionToMember,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async LoadToChat(
        payload: LoadToChatRequest,
    ): Promise<LoadToChatResponseDTO> {
        try {
            const { userId, chatId } = payload;
            this.logger.debug(
                `Attempting to add user to chat with userId: ${userId}, chatId: ${chatId}`,
            );

            const { status: statusCode } = await this.userService.AddChatToUser(
                {
                    userId,
                    chatId,
                },
            );

            if (statusCode !== 200) {
                this.logger.error('Error while adding user to chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.debug(
                'User added to user service successfully, now adding to chat',
            );

            const {
                response: { message, status },
            } = await lastValueFrom(
                from(
                    this.chatMicroservice.AddUserToChat({
                        participant: {
                            userId,
                            role: 'member',
                        },
                        chatId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.warn('Failed to add user to chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('User successfully added to chat');

            return { message, status };
        } catch (e) {
            this.logger.error('Error while loading user to chat', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.loadToChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async LeaveFromChat(
        payload: LeaveFromChatRequest,
    ): Promise<LeaveFromChatResponseDTO> {
        try {
            const { userId, chatId } = payload;
            this.logger.debug(
                `Attempting to remove user from chat with userId: ${userId}, chatId: ${chatId}`,
            );

            const { status: statusCode } =
                await this.userService.RemoveChatFromUser({
                    userId,
                    chatId,
                });

            if (statusCode !== 200) {
                this.logger.error('Error while removing user from chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.debug(
                'User successfully removed from user service, now removing from chat',
            );

            const {
                response: { message, status },
            } = await lastValueFrom(
                from(
                    this.chatMicroservice.RemoveUserFromChat({
                        userId: +payload.userId,
                        chatId: payload.chatId,
                    }),
                ),
            );

            if (!message || !status) {
                this.logger.error('Error while removing user from chat');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('User successfully removed from chat');

            return { message, status };
        } catch (e) {
            this.logger.error('Error while leaving chat', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.leaveFromChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    ////////////////////////////////////////////////

    async CreateNewChat(
        payload: CreateNewChatRequest,
    ): Promise<CreateNewChatResponse> {
        try {
            const { chatName, chatType, userId } = payload;
            this.logger.debug(
                `Attempting to create a new chat with name: ${chatName}, type: ${chatType}`,
            );

            const { chatId } = await lastValueFrom(
                from(
                    this.chatMicroservice.CreateNewChat({
                        chatName,
                        chatType,
                        userId,
                    }),
                ),
            );

            if (!chatId) {
                this.logger.error(
                    'Unable to create chat, possible data conflict',
                );
                throw new ConflictException(
                    StatusClient.HTTP_STATUS_CONFLICT.message,
                );
            }

            this.logger.debug(
                'Chat created successfully, now adding chat to user',
            );

            const { message, status } = await this.userService.AddChatToUser({
                userId,
                chatId,
            });

            if (!message || !status) {
                this.logger.error('Error while adding chat to user');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log('Chat successfully created and added to user');
            return { chatId };
        } catch (e) {
            this.logger.error('Error while creating new chat', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.createNewChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async GetChatById(
        payload: GetChatByIdRequest,
    ): Promise<GetChatByIdResponse> {
        try {
            const { chatId } = payload;
            this.logger.debug(
                `Fetching chat information for chatId: ${payload}`,
            );

            const { chatData } = await lastValueFrom(
                from(
                    this.chatMicroservice.GetChatById({
                        chatId,
                    }),
                ),
            );

            if (!chatData) {
                this.logger.warn(`Chat with ID ${chatId} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Successfully retrieved chat information for chatId: ${chatId}`,
            );
            return { chatData };
        } catch (e) {
            this.logger.error('Error while retrieving chat by ID', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.getChatById,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async GetChatByChatName(
        payload: GetChatByChatNameRequest,
    ): Promise<GetChatByChatNameResponse> {
        try {
            const { chatName } = payload;
            this.logger.debug(
                `Fetching chat information for chatName: ${chatName}`,
            );

            const { chatData } = await lastValueFrom(
                from(
                    this.chatMicroservice.GetChatByChatName({
                        chatName,
                    }),
                ),
            );

            if (!chatData) {
                this.logger.warn(`Chat with name ${chatName} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Successfully retrieved chat information for chatName: ${chatName}`,
            );
            return { chatData };
        } catch (e) {
            this.logger.error('Error while retrieving chat by name', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.getChatByChatName,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async UpdateChatById(
        payload: UpdateChatByIdRequest,
    ): Promise<UpdateChatByIdResponse> {
        try {
            const { chatId, chatName, chatType, userId, description } = payload;
            this.logger.debug(`Updating chat with ID: ${payload.chatId}`);

            let chatInfo;
            if (
                payload.chatType === 'private' ||
                payload.chatType === 'group'
            ) {
                chatInfo = await lastValueFrom(
                    from(
                        this.chatMicroservice.UpdateChatById({
                            chatId,
                            userId,
                            chatName,
                            chatType,
                            description,
                        }),
                    ),
                );
            } else if (
                payload.chatType === '' ||
                payload.chatType === undefined
            ) {
                chatInfo = await lastValueFrom(
                    from(
                        this.chatMicroservice.UpdateChatById({
                            chatId,
                            userId,
                            chatName,
                            description,
                        }),
                    ),
                );
            } else {
                this.logger.warn(
                    'Invalid chat type, expected "private" or "group"',
                );
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            if (!chatInfo) {
                this.logger.warn(`Chat with ID ${chatId} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `Successfully updated chat with ID: ${payload.chatId}`,
            );
            return chatInfo;
        } catch (e) {
            this.logger.error('Error while updating chat by ID', e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.updateChatById,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async DeleteChatById(
        payload: DeleteChatByIdRequest,
    ): Promise<DeleteChatByIdResponseDTO> {
        try {
            const { chatId, userId } = payload;
            this.logger.debug(`Attempting to delete chat with ID: ${chatId}`);

            const chatInfoData: DeleteChatByIdRequest = {
                chatId,
                userId,
            };

            if (!chatInfoData.chatId || isNaN(userId)) {
                this.logger.warn('Invalid or missing userId in cookies');
                throw new BadRequestException(
                    StatusClient.HTTP_STATUS_BAD_REQUEST.message,
                );
            }

            this.logger.debug(
                `Fetching chat information for deletion with chatId: ${chatId}`,
            );

            const {
                info: { data },
            }: DeleteChatByIdResponse = await lastValueFrom(
                from(this.chatMicroservice.DeleteChatById(chatInfoData)),
            );

            if (!data) {
                this.logger.warn(`Chat with ID ${chatId} not found`);
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.debug(
                `Successfully fetched chat info for deletion, preparing to remove users from chat`,
            );

            const arrayUsers: ArrayLinkUsers[] = data.map((userId: number) => ({
                userId,
            }));

            const chatParticipantDelData: RemoveArrayChatRequest = {
                chatId,
                data: arrayUsers,
            };

            this.logger.debug(
                `Removing chat references for users with chatId: ${chatId}`,
            );

            const { message, status }: RemoveArrayChatResponse =
                await lastValueFrom(
                    from(
                        this.userMicroservice.RemoveArrayChat(
                            chatParticipantDelData,
                        ),
                    ),
                );

            if (status !== 200) {
                this.logger.error('Failed to remove chat references for users');
                throw new InternalServerErrorException(
                    StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.message,
                );
            }

            this.logger.log(
                `Chat with ID ${chatId} successfully deleted and users removed`,
            );

            return { message };
        } catch (e) {
            this.logger.error(`Error in DeleteChatById: ${e.message}`, e.stack);

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.deleteChatById,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async AddUserToChat(
        payload: AddUserToChatRequest,
    ): Promise<AddUserToChatResponse> {
        try {
            const { chatId, participant } = payload;
            this.logger.debug(
                `Attempting to add user to chat with chatId: ${chatId} and participant: ${JSON.stringify(participant)}`,
            );

            const chatInfo = await lastValueFrom(
                from(
                    this.chatMicroservice.AddUserToChat({
                        chatId,
                        participant,
                    }),
                ),
            );

            if (!chatInfo) {
                this.logger.warn(
                    `Chat with ID ${chatId} not found or unable to add user`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `User successfully added to chat with chatId: ${chatId}`,
            );

            return chatInfo;
        } catch (e) {
            this.logger.error(
                `Error while adding user to chat: ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.addUserToChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }

    async RemoveUserFromChat(
        payload: RemoveUserFromChatRequest,
    ): Promise<RemoveUserFromChatResponse> {
        try {
            const { userId, chatId } = payload;
            this.logger.debug(
                `Attempting to remove user with userId: ${userId} from chat with chatId: ${chatId}`,
            );

            const chatInfo = await lastValueFrom(
                from(
                    this.chatMicroservice.RemoveUserFromChat({
                        chatId,
                        userId,
                    }),
                ),
            );

            if (!chatInfo) {
                this.logger.warn(
                    `Chat with ID ${chatId} not found or unable to remove user`,
                );
                throw new NotFoundException(
                    StatusClient.HTTP_STATUS_NOT_FOUND.message,
                );
            }

            this.logger.log(
                `User with userId: ${userId} successfully removed from chat with chatId: ${chatId}`,
            );

            return chatInfo;
        } catch (e) {
            this.logger.error(
                `Error while removing user from chat: ${e.message}`,
                e.stack,
            );

            if (e.code === 'UNAVAILABLE' || e.message.includes('connect')) {
                throw new RpcException({
                    message: StatusClient.RPC_EXCEPTION.message,
                    code: e.code,
                });
            }

            throw new RpcException({
                message: errMessages.removeUserFromChat,
                code: StatusClient.HTTP_STATUS_INTERNAL_SERVER_ERROR.status,
            });
        }
    }
}
