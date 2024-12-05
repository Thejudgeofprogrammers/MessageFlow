import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

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
        LoggerModule,
    ],
    providers: [TokenService, WinstonLoggerService],
    exports: [TokenService],
})
export class TokenModule {}
