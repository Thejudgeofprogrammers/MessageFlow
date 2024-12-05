export class UploadAvatarRequestDTO {
    avatarUrl: string;
    userId: number;
}

export class UploadAvatarResponseDTO {
    message: string;
    status: number;
}

export class FindUserAvatarArrayRequestDTO {
    userId: number;
}

export class FindUserAvatarArrayResponseDTO {
    message: string;
    status: number;
    data: AvatarDTO[];
}

export class FindUserAvatarRequestDTO {
    avatarId: number;
    userId: number;
}

export class FindUserAvatarResponseDTO {
    message: string;
    status: number;
    data: AvatarDTO;
}

export class DeleteUserAvatarRequestDTO {
    userId: number;
    avatarId: number;
}

export class DeleteUserAvatarResponseDTO {
    message: string;
    status: number;
}

export class AvatarDTO {
    avatar_id: number;
    user_id: number;
    avatar_url: string;
    is_active: boolean;
    uploaded_at: string;
    is_random: boolean;
}
