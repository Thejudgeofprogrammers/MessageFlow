import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { LastMessage } from '../dto';

export type ChatDocument = Chat &
    Document & { createdAt: Date; updatedAt: Date };

@Schema({ timestamps: true })
export class Chat {
    @Prop({ type: String })
    chatName: string;

    @Prop({ type: String, required: true })
    chatType: string;

    @Prop({ type: String, required: false })
    description: string;

    @Prop({
        type: {
            message_id: Types.ObjectId,
            sender_id: Number,
            preview: String,
        },
        required: false,
    })
    lastMessage: LastMessage;

    @Prop({ type: [Types.ObjectId], ref: 'ChatParticipant' })
    participants: Types.ObjectId[];

    @Prop({ type: [Types.ObjectId], ref: 'Message', default: [] })
    messages: Types.ObjectId[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
