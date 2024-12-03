export class FindProfileDTO {
    message: {
        user_id: number;
        description: string | null;
        created_at: Date;
        is_private: boolean;
    };

    status: number;
}

export class FindUserAvatarDTOResponse {
    avatarUrl: string;
    status: number;
}

export class GetUserProfileDTOResponse {
    userId: number;
}
