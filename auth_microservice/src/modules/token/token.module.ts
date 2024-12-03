import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('jwt_options.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('jwt_options.expire'),
                },
            }),
        }),
    ],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}
