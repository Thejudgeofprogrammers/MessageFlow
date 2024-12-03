import {
    BadRequestException,
    Controller,
    ForbiddenException,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/Chat';
import {
    ChatParticipant,
    ChatParticipantDocument,
} from './schemas/ChatParticipant';
import { Model, Types } from 'mongoose';
import { GrpcMethod } from '@nestjs/microservices';
import {
    AddUserToChatRequest,
    AddUserToChatResponse,
    CreateNewChatRequest,
    CreateNewChatResponse,
    DeleteChatByIdRequest,
    DeleteChatByIdResponse,
    GetChatByChatNameRequest,
    GetChatByChatNameResponse,
    GetChatByIdRequest,
    GetChatByIdResponse,
    KickUserFromChatRequest,
    KickUserFromChatResponse,
    PermissionToAdminRequest,
    PermissionToAdminResponse,
    PermissionToMemberRequest,
    PermissionToMemberResponse,
    RemoveUserFromChatRequest,
    RemoveUserFromChatResponse,
    UpdateChatByIdRequest,
    UpdateChatByIdResponse,
} from 'src/protos/proto_gen_files/chat';
import { Message, MessageDocument } from './schemas/Message';
import { UpdateRoleDTO } from './dto';
import { MessageGatewayClient } from './message.client.gateway';

@Controller('ChatService')
export class ChatService {
    private readonly logger = new Logger(ChatService.name);

    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(ChatParticipant.name)
        private readonly chatParticipantModel: Model<ChatParticipantDocument>,
        @InjectModel(Message.name)
        private readonly messageModel: Model<MessageDocument>,
        private readonly messageGatewayClient: MessageGatewayClient,
    ) {}

    // @GrpcMethod('ChatService', 'GetTokenAndAddToChat')
    // async GetTokenAndAddToChat(
    //     payload: GetTokenAndAddToChatRequest,
    // ): Promise<GetTokenAndAddToChatResponse> {
    //     try {
    //         if (!payload.chatId || !payload.userId) {
    //             throw new BadRequestException('Недостаточно данных');
    //         }

    //         const { chatId, userId } = payload;
    //     } catch (e) {
    //         this.logger.error(
    //             `Ошибка при создании чата: ${e.message}`,
    //             e.stack,
    //         );
    //         throw new InternalServerErrorException(
    //             'Произошла ошибка при создании чата',
    //         );
    //     }
    // }

    @GrpcMethod('ChatService', 'KickUserFromChat')
    async KickUserFromChat(
        payload: KickUserFromChatRequest,
    ): Promise<KickUserFromChatResponse> {
        try {
            if (!payload.chatId && !payload.participantId && !payload.userId) {
                throw new BadRequestException('Не вся информация передана');
            }

            const chat = await this.chatModel
                .findById(new Types.ObjectId(payload.chatId))
                .populate<{ participants: ChatParticipant[] }>('participants');

            if (!chat) {
                throw new NotFoundException('Чат не найден');
            }

            const user = chat.participants.find(
                (participant) => +participant.user_id === +payload.userId,
            );

            if (!user) {
                throw new NotFoundException('Пользователь не найден в чате');
            }

            if (!['owner', 'admin'].includes(user.role)) {
                throw new ForbiddenException('Не хватает прав для операции');
            }

            const participantIndex = chat.participants.findIndex(
                (participant: any) =>
                    +participant.user_id === +payload.participantId,
            );

            if (participantIndex === -1) {
                throw new InternalServerErrorException(
                    'Пользователь не найден в чате',
                );
            }

            if (user.role === 'owner') {
                if (
                    ['member'].includes(
                        chat.participants[participantIndex].role,
                    )
                ) {
                    chat.participants.splice(participantIndex, 1);
                } else {
                    throw new ForbiddenException(
                        'Недостаточно прав для данного действия',
                    );
                }
            } else {
                if (
                    ['member', 'admin'].includes(
                        chat.participants[participantIndex].role,
                    )
                ) {
                    chat.participants.splice(participantIndex, 1);
                } else {
                    throw new ForbiddenException(
                        'Недостаточно прав для данного действия',
                    );
                }
            }

            await chat.save();

            this.messageGatewayClient.sendMessage({
                chatId: payload.chatId,
                senderId: +payload.userId,
                text: `Пользователь ${payload.participantId} был удалён пользователем ${payload.userId}`,
            });

            return {
                message: `Пользователь успешно удалён из чата`,
                status: 200,
            };
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при создании чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'CreateNewChat')
    async CreateNewChat(
        payload: CreateNewChatRequest,
    ): Promise<CreateNewChatResponse> {
        try {
            const { chatName, chatType, userId } = payload;

            const chatParticipantData: ChatParticipant = {
                user_id: userId,
                role: 'owner',
            };

            const newParticipant =
                await this.chatParticipantModel.create(chatParticipantData);

            if (!newParticipant) {
                throw new InternalServerErrorException('Data Base exception');
            }

            const chatData = {
                chatName,
                chatType,
                participants: [newParticipant._id],
                messages: [],
            };

            const newChat = await this.chatModel.create(chatData);

            if (!newChat) {
                throw new InternalServerErrorException('Data Base exception');
            }

            this.messageGatewayClient.sendMessage({
                chatId: newChat._id.toString(),
                senderId: +payload.userId,
                text: `Чат был создан пользователем ${payload.userId}`,
            });

            return { chatId: newChat._id.toString() };
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при создании чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'GetChatById')
    async GetChatById(
        payload: GetChatByIdRequest,
    ): Promise<GetChatByIdResponse> {
        try {
            if (!payload.chatId || !Types.ObjectId.isValid(payload.chatId)) {
                throw new Error('Invalid or missing chatId in payload');
            }
            const validId = new Types.ObjectId(payload.chatId);
            const data = await this.chatModel
                .findById(validId)
                .populate('participants')
                .populate('messages')
                .exec();

            if (!data) {
                throw new Error(`Chat with ID ${validId} not found`);
            }

            const chatData = {
                chatId: data._id.toString(),
                chatName: data.chatName,
                chatType: data.chatType,
                lastMessage: data.lastMessage
                    ? {
                          messageId: data.lastMessage.message_id.toString(),
                          senderId: +data.lastMessage.sender_id,
                          preview: data.lastMessage.preview,
                      }
                    : undefined,
                createdAt: data.createdAt,
                participants: data.participants.map((participant: any) => ({
                    userId: +participant.user_id,
                    role: participant.role,
                })),
                messages: data.messages.map((message: any) => ({
                    messageId: message._id.toString(),
                    senderId: message.sender_id,
                    text: message.text,
                    timestamp: message.createdAt,
                })),
            };
            return { chatData };
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при поиске чата по Id',
            );
        }
    }

    @GrpcMethod('ChatService', 'GetChatByChatName')
    async GetChatByChatName(
        payload: GetChatByChatNameRequest,
    ): Promise<GetChatByChatNameResponse> {
        try {
            const data = await this.chatModel
                .find({
                    chatName: payload.chatName,
                })
                .exec();
            if (!data) {
                throw new Error('Chat not found');
            }
            const chatDataArray = data.map((chat) => ({
                chatId: chat._id.toString(),
                chatName: chat.chatName,
            }));
            return { chatData: chatDataArray };
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при поиске чата по Имени',
            );
        }
    }

    @GrpcMethod('ChatService', 'UpdateChatById')
    async UpdateChatById(
        payload: UpdateChatByIdRequest,
    ): Promise<UpdateChatByIdResponse> {
        try {
            if (!payload.chatId) {
                throw new BadRequestException('chatId without');
            }

            const { chatId, chatName, chatType, description } = payload;

            const chat = await this.chatModel
                .findById(new Types.ObjectId(chatId))
                .populate('participants')
                .populate('messages');

            const chatParticipantArray = (chat as any).participants;

            const hasPermission = chatParticipantArray.some(
                (user: ChatParticipant) =>
                    user.user_id === payload.userId &&
                    (user.role === 'owner' || user.role === 'admin'),
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    'Недостаточно прав для изменения чата',
                );
            }

            if (!chat) {
                throw new NotFoundException(`Чат с ID ${chatId} не найден`);
            }

            if (chatName) chat.chatName = chatName;
            if (chatType) chat.chatType = chatType;
            if (description) chat.description = description;

            if (!chatName && !chatType && !description) {
                return {
                    response: {
                        message: 'Чат не изменен так как не было данных',
                        status: 200,
                    },
                };
            } else {
                await chat.save();

                this.messageGatewayClient.sendMessage({
                    chatId,
                    senderId: +payload.userId,
                    text: `Чат был обновлен пользователем ${payload.userId}`,
                });

                return {
                    response: {
                        message: `Чат с ID ${chatId} успешно обновлён`,
                        status: 200,
                    },
                };
            }
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при обновлении чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'DeleteChatById')
    async DeleteChatById(
        payload: DeleteChatByIdRequest,
    ): Promise<DeleteChatByIdResponse> {
        try {
            const validId = new Types.ObjectId(payload.chatId);
            const chat = await this.chatModel
                .findById(validId)
                .populate('participants')
                .exec();

            if (!chat) {
                throw new NotFoundException('Чат не найден');
            }

            const chatParticipantArray = (chat as any).participants;

            const findOwner = chatParticipantArray.find(
                (user: ChatParticipant) => user.role === 'owner',
            );

            const { user_id } = findOwner;
            if (user_id !== payload.userId) {
                throw new ForbiddenException(
                    'Недостаточно прав для удаления чата',
                );
            }

            const chatDel = await this.chatModel.findById(validId);
            if (chatDel) {
                await this.deleteChat(chatDel);
            }

            const participantsArray = chatParticipantArray.map(
                (participant: ChatParticipant) => +participant.user_id,
            );

            const resp = {
                response: {
                    message: `Чат ${chat.chatName} удалён`,
                    status: 200,
                },
                info: {
                    chatId: payload.chatId.toString(),
                    data: participantsArray,
                },
            };

            return resp;
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'AddUserToChat')
    async AddUserToChat(
        payload: AddUserToChatRequest,
    ): Promise<AddUserToChatResponse> {
        try {
            const chat = await this.chatModel
                .findById(new Types.ObjectId(payload.chatId))
                .populate('participants');

            if (!chat) {
                throw new NotFoundException('Чат не найден');
            }

            const userExistsInChat = chat.participants.some(
                (participant: any) =>
                    +participant.user_id === +payload.participant.userId,
            );

            if (userExistsInChat) {
                throw new BadRequestException('Пользователь уже в чате');
            }

            const newParticipant = new this.chatParticipantModel({
                user_id: payload.participant.userId,
                role: payload.participant.role,
            });

            await newParticipant.save();

            chat.participants.push(newParticipant._id as Types.ObjectId);
            await chat.save();

            this.messageGatewayClient.sendMessage({
                chatId: payload.chatId,
                senderId: +payload.participant,
                text: `Новый пользователь: ${payload.participant}`,
            });

            return {
                response: {
                    message: 'Пользователь успешно добавлен в чат',
                    status: 200,
                },
            };
        } catch (e) {
            this.logger.error(
                `Ошибка при создании чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при добавлении пользователя в чат',
            );
        }
    }

    @GrpcMethod('ChatService', 'RemoveUserFromChat')
    async RemoveUserFromChat(
        payload: RemoveUserFromChatRequest,
    ): Promise<RemoveUserFromChatResponse> {
        try {
            const chat = await this.chatModel
                .findById(new Types.ObjectId(payload.chatId))
                .populate('participants');

            if (!chat) {
                throw new NotFoundException('Чат не найден');
            }

            const participantIndex = chat.participants.findIndex(
                (participant: any) => +participant.user_id === +payload.userId,
            );

            if (participantIndex === -1) {
                throw new InternalServerErrorException(
                    'Пользователь не найден в чате',
                );
            }

            chat.participants.splice(participantIndex, 1);

            await chat.save();

            const participantIndexRole = chat.participants.findIndex(
                (participant: any) => participant.role === 'owner',
            );

            if (chat.participants.length === 0 || participantIndexRole === -1) {
                await this.deleteChat(chat);
                return {
                    response: {
                        message: `Чат ${chat.chatName} удалён, так как больше не осталось участников.`,
                        status: 200,
                    },
                };
            }

            this.messageGatewayClient.sendMessage({
                chatId: payload.chatId,
                senderId: +payload.userId,
                text: `Пользователь вышел из чата ${payload.userId}`,
            });

            return {
                response: {
                    message: 'Пользователь успешно удален из чата',
                    status: 200,
                },
            };
        } catch (e) {
            this.logger.error(
                `Ошибка при удалении пользователя из чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении пользователя из чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'PermissionToAdmin')
    async PermissionToAdmin(
        payload: PermissionToAdminRequest,
    ): Promise<PermissionToAdminResponse> {
        try {
            if (!payload.participantId || !payload.chatId || !payload.userId) {
                throw new BadRequestException('Не переданы все данные');
            }

            await this.updateRole({
                userId: payload.userId,
                chatId: payload.chatId,
                participantId: payload.participantId,
                role: 'admin',
            });

            this.messageGatewayClient.sendMessage({
                chatId: payload.chatId,
                senderId: +payload.userId,
                text: `Пользователь ${payload.participantId} стал admin`,
            });

            return { message: 'Роль успешно изменена', status: 200 };
        } catch (e) {
            this.logger.error(
                `Ошибка при удалении пользователя из чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении пользователя из чата',
            );
        }
    }

    @GrpcMethod('ChatService', 'PermissionToMember')
    async PermissionToMember(
        payload: PermissionToMemberRequest,
    ): Promise<PermissionToMemberResponse> {
        try {
            if (!payload.participantId || !payload.chatId || !payload.userId) {
                throw new BadRequestException('Не переданы все данные');
            }

            await this.updateRole({
                userId: payload.userId,
                chatId: payload.chatId,
                participantId: payload.participantId,
                role: 'member',
            });

            this.messageGatewayClient.sendMessage({
                chatId: payload.chatId,
                senderId: +payload.userId,
                text: `Пользователь ${payload.participantId} стал member`,
            });

            return { message: 'Роль успешно изменена', status: 200 };
        } catch (e) {
            this.logger.error(
                `Ошибка при удалении пользователя из чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении пользователя из чата',
            );
        }
    }

    private async updateRole(payload: UpdateRoleDTO): Promise<void> {
        try {
            const chat = await this.chatModel
                .findById(new Types.ObjectId(payload.chatId))
                .populate<{ participants: ChatParticipant[] }>('participants');

            if (!chat) {
                throw new NotFoundException('Чат не найден');
            }

            const user = chat.participants.find(
                (participant) => +participant.user_id === +payload.userId,
            );

            if (!user) {
                throw new NotFoundException('Пользователь не найден в чате');
            }

            if (user.role !== 'owner') {
                throw new ForbiddenException('Не хватает прав для операции');
            }

            const participant = chat.participants.find(
                (participant) =>
                    +participant.user_id === +payload.participantId,
            );

            if (!participant) {
                throw new NotFoundException('Участник не найден в чате');
            }

            if (payload.role === 'admin') {
                if (['owner', 'admin'].includes(participant.role)) {
                    throw new BadRequestException(
                        'Участник уже имеет роль выше member',
                    );
                }
                participant.role = 'admin';
            } else if (payload.role === 'member') {
                if (
                    participant.role === 'owner' ||
                    participant.role === 'member'
                ) {
                    throw new BadRequestException(
                        'Невозможно изменить роль участника на member',
                    );
                }
                participant.role = 'member';
            } else {
                throw new BadRequestException('Некорректная роль');
            }

            await chat.save();
        } catch (e) {
            this.logger.error(
                `Ошибка при удалении пользователя из чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении пользователя из чата',
            );
        }
    }

    private async deleteChat(chat: ChatDocument): Promise<void> {
        try {
            await this.chatModel.findByIdAndDelete(chat._id);

            await this.messageModel.deleteMany({
                _id: { $in: chat.messages },
            });

            await this.chatParticipantModel.deleteMany({
                _id: { $in: chat.participants },
            });

            this.logger.log(`Чат ${chat.chatName} удалён (ID: ${chat._id})`);
        } catch (e) {
            this.logger.error(
                `Ошибка при удалении пользователя из чата: ${e.message}`,
                e.stack,
            );
            throw new InternalServerErrorException(
                'Произошла ошибка при удалении пользователя из чата',
            );
        }
    }
}
