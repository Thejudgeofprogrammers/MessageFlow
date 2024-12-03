import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Number, required: true })
    sender_id: number;

    @Prop({ type: String, required: true })
    text: string;

    @Prop({ type: Types.ObjectId, required: true })
    chat_id: Types.ObjectId;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
export type MessageDocument = Message & Document;
