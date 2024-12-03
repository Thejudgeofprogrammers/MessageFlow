import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { io, Socket } from 'socket.io-client';

@Injectable()
export class MessageGatewayClient implements OnModuleInit {
    private socket: Socket;

    constructor(private readonly configServce: ConfigService) {}

    onModuleInit() {
        this.socket = io(this.configServce.get('websocket_connection'));
        this.socket.on('connect', () => {
            console.log('Connected to message_microservice');
        });
        this.socket.on('disconnect', () => {
            console.log('Disconnected from message_microservice');
        });
    }

    sendMessage(data: { chatId: string; senderId: number; text: string }) {
        this.socket.emit('sendMessage', data);
    }
}
