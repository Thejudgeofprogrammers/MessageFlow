import { Types } from 'mongoose';

export interface LastMessage {
    message_id: Types.ObjectId;
    sender_id: number;
    preview: string;
}

export interface ParticipatsDTO {
    user_id: number;
    role: string;
}

export interface ChatAndParticipats {
    chatName: string;
    chatType: string;
    lastMessage: LastMessage;
    participants: ParticipatsDTO[];
    messages: Types.ObjectId[];
}

export class UpdateRoleDTO {
    userId: number;
    chatId: string;
    participantId: number;
    role: string;
}
