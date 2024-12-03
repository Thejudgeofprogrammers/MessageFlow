import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/Message';
import { Kafka } from 'kafkajs';
import { kafkaOptionsClient } from 'src/config/kafka-client.options';

@Injectable()
export class MessageService {
    private kafkaProducer;

    constructor(
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
    ) {
        const kafka = new Kafka(kafkaOptionsClient);

        this.kafkaProducer = kafka.producer();
        this.kafkaProducer.connect();
    }

    async createMessage(chatId: string, senderId: number, text: string) {
        try {
            if (!chatId || !senderId || !text) {
                throw new BadRequestException('Не переданы все данные');
            }

            const message = new this.messageModel({
                sender_id: senderId,
                text,
            });

            const savedMessage = await message.save();

            return { chatId, senderId, text, messageId: savedMessage._id };
        } catch (e) {
            throw new InternalServerErrorException(
                'Ошибка сервера при создании сообщения',
            );
        }
    }

    async notifyNewMessage(message: any) {
        await this.kafkaProducer.send({
            topic: 'new_message',
            messages: [
                {
                    value: JSON.stringify(message),
                },
            ],
        });
    }
}
