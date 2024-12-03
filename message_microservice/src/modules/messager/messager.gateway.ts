import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from './messager.service';
import { InternalServerErrorException } from '@nestjs/common';

@WebSocketGateway(81, { transports: ['websocket'], cors: { origin: '*' } })
export class MessageGateway implements OnGatewayConnection {
    @WebSocketServer()
    server: Server;

    constructor(private readonly messageService: MessageService) {}

    handleConnection(client: any, ...args: any[]) {
        
    }

    @SubscribeMessage('sendMessage')
    async handleMessage(
        @MessageBody() data: { chatId: string; senderId: number; text: string },
    ) {
        try {
            const { chatId, senderId, text } = data;

            const message = await this.messageService.createMessage(
                chatId,
                senderId,
                text,
            );

            if (!message) {
                throw new InternalServerErrorException(
                    'Ошибка при сохранении сообщения',
                );
            }

            this.server.to(chatId).emit('newMessage', message);

            await this.messageService.notifyNewMessage(message);
        } catch (e) {
            throw new InternalServerErrorException('Ошибка сервера');
        }
    }

    @SubscribeMessage('joinChat')
    async handleJoinChat(
        @MessageBody() data: { chatId: string },
        @ConnectedSocket() client: Socket,
    ) {
        const { chatId } = data;
        client.join(chatId);
    }
}
