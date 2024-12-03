import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsNumber,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from 'class-validator';

export class LoginFormDTO {
    @ApiPropertyOptional({
        example: '+1234567890',
        description: 'Номер телефона пользователя',
    })
    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @ApiPropertyOptional({
        example: 'user@example.com',
        description: 'Электронная почта пользователя',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({
        example: 'yourPassword123',
        description: 'Пароль пользователя',
    })
    @IsString()
    password: string;
}
export class LoginResponseDTO {
    message: string;
    status: number;
    data: LoginResponseData;
}

export class LoginResponseData {
    @ApiProperty({
        example: '12',
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: '27052b**********************4f7b87',
        description: 'jwt-token сгенерированный',
    })
    @IsString()
    jwtToken: string;
}

export class RegisterFormDTO {
    @ApiProperty({
        example: 'username',
        description: 'Имя пользователя',
    })
    @IsString()
    username: string;

    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Email пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'yourPassword123',
        description: 'Пароль пользователя',
    })
    @IsString()
    password: string;

    @ApiProperty({
        example: '+123456789',
        description: 'Телефон пользователя',
    })
    @IsPhoneNumber()
    phoneNumber: string;
}
export class RegisterResponseDTO {
    message: string;
    status: number;
    data: RegisterResponseDataDTO;
}

export class RegisterResponseDataDTO {
    @ApiProperty({
        example: 'username',
        description: 'Имя пользователя',
    })
    @IsString()
    username: string;

    @ApiProperty({
        example: 'example@mail.ru',
        description: 'Email пользователя',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        example: 'yourPassword123',
        description: 'Пароль пользователя',
    })
    @IsString()
    password: string;

    @ApiProperty({
        example: '+123456789',
        description: 'Телефон пользователя',
    })
    @IsPhoneNumber()
    phoneNumber: string;
}

export class LogoutRequestDTO {
    @ApiProperty({
        example: 12,
        description: 'id пользователя',
    })
    @IsNumber()
    userId: number;

    @ApiProperty({
        example: '27052b**********************4f7b87',
        description: 'jwt-token сгенерированный',
    })
    @IsString()
    jwtToken: string;
}

export class LogoutResponseDTO {
    message: string;
    status: number;
}

export class RemoveAccountRequestDTO {
    @ApiProperty({
        example: '1q243t2e2',
        description: 'Пароль пользователя',
    })
    @IsString()
    password: string;

    @ApiProperty({
        example: 12,
        description: 'ID пользователя',
    })
    @IsString()
    userId: number;
}

export class RemoveAccountResponseDTO {
    message: string;
    status: number;
}

export class CreateNewUserResponseDTO {
    message: string;
    status: number;
}
