import { IsNumber, IsString } from 'class-validator';

export class UploadAvatarUserResponseDTO {
    message: string;
    status: number;
}

export class avatarIdDTO {
    @IsNumber()
    avatarId: number;
}

export class userIdDTO {
    @IsNumber()
    userId: number;
}

export class DeleteAvatarUserResponseDTO {
    message: string;
    status: number;
}

export class AvatarDTO {
    @IsNumber()
    avatarId: number;

    @IsString()
    avatarUrl: string;
}

export class AvatarUrlDTO {
    @IsString()
    avatarUrl: string;
}

export class FindUserAvatarResponseDTO {
    message: string;
    status: number;
    data: AvatarDTO;
}

export class FindUserAvatarArrayResponseDTO {
    message: string;
    status: number;
    data: AvatarDTO;
}
