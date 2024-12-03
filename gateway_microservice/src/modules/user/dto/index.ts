import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

export class FindUserByIdRequestDTO {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;
}

export class FindUserByIdResponseDTO {
    message: string;
    status: number;
    data: FindUserByIdResponseData;
}

export class FindUserByIdResponseData {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: '+123456789',
        description: 'Номер телефона пользователя',
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Почта пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456gew',
        description: 'Пароль пользователя',
    })
    @IsString()
    passwordHash: string;

    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;

    @ApiProperty({
        example: ['67347e122ffc01bfdb0f1d92', '67347e122ffc01bfdb0f1d93'],
        description: 'Ссылки на чаты добавленные пользователем',
    })
    chatReferences: string[];
}

export class FindUserByPhoneNumberRequestDTO {
    @ApiProperty({
        example: '+123456789',
        description: 'Номер телефона пользователя',
    })
    @IsString()
    phoneNumber: string;
}

export class FindUserByPhoneNumberResponseDTO {
    message: string;
    status: number;
    data: FindUserByPhoneNumberResponseData;
}

export class FindUserByPhoneNumberResponseData {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: '+123456789',
        description: 'Номер телефона пользователя',
    })
    @IsString()
    phoneNumber: string;

    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Почта пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456gew',
        description: 'Пароль пользователя',
    })
    @IsString()
    passwordHash: string;

    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;
}

export class FindUserByEmailRequestDTO {
    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Почта пользователя',
    })
    @IsEmail()
    email: string;
}

export class FindUserByusernameRequestDTO {
    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;
}

export class FindUserByEmailResponseDTO {
    message: string;
    status: number;
    data: FindUserByEmailResponseData;
}

export class FindUserByEmailResponseData {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: '+123456789',
        description: 'Номер телефона пользователя',
    })
    @IsString()
    phoneNumber: string;
    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Почта пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: '123456gew',
        description: 'Пароль пользователя',
    })
    @IsString()
    passwordHash: string;

    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;
}

export class FindUserByUsernameRequestDTO {
    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;
}

export class FindUserByUsernameResponseDTO {
    message: string;
    status: number;
    data: FindUserByUsernameResponseData;
}

export class FindUserByUsernameResponseData {
    @ApiProperty({
        example: [{ userId: 12, username: 'lilwiggha' }],
        description: 'Массив пользователей',
    })
    userData: UserArray[];
}

export class AddChatToUserResponseDTO {
    message: string;
    status: number;
}

export class LoadToChatResponseDTO {
    message: string;
    status: number;
}

export class RemoveChatFromUserResponseDTO {
    message: string;
    status: number;
}

export class UserArray {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: 'lilwiggha',
        description: 'username пользователя',
    })
    @IsString()
    username: string;
}

export class UpdateUserProfileResponseDTO {
    @IsString()
    message: string;

    @IsNumber()
    status: number;
}

export class UpdateUserProfileRequestDTO {
    @IsNumber()
    userId: number;

    @IsString()
    description: string;
}

export class GetUserProfileResponseDTO {
    @IsNumber()
    message: string;

    @IsString()
    status: number;
}

export class GetUserProfileRequestDTO {
    @IsNumber()
    userId: number;
}

export class UpdateUserPasswordRequestDTO {
    userId: number;
    password: string;
}

export class UpdateUserPasswordResponseDTO {
    @IsNumber()
    message: string;

    @IsString()
    status: number;
}
