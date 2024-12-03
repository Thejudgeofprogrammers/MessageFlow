import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/Chat';
import { ChatService } from './chats.service';
import {
    ChatParticipant,
    ChatParticipantSchema,
} from './schemas/ChatParticipant';
import { MessageGatewayClient } from './message.client.gateway';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: ChatParticipant.name, schema: ChatParticipantSchema },
        ]),
    ],
    controllers: [ChatService],
    providers: [MessageGatewayClient],
})
export class ChatModule {}
