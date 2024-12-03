import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './schemas/Chat';
import {
    ChatParticipant,
    ChatParticipantSchema,
} from './schemas/ChatParticipant';
import { Message, MessageSchema } from './schemas/Message';
import { MessageGateway } from './messager.gateway';
import { MessageService } from './messager.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: ChatParticipant.name, schema: ChatParticipantSchema },
            { name: Message.name, schema: MessageSchema },
        ]),
    ],
    providers: [MessageGateway, MessageService],
})
export class MessagerModule {}
