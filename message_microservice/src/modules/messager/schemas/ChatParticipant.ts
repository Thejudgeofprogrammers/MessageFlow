import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ChatParticipant {
    @Prop({ type: Number, required: true })
    user_id: number;

    @Prop({ type: String, required: true, enum: ['owner', 'admin', 'member'] })
    role: string;
}

export const ChatParticipantSchema =
    SchemaFactory.createForClass(ChatParticipant);
export type ChatParticipantDocument = ChatParticipant & Document;
