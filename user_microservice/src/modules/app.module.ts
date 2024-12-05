import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import configuration from '../config/config.main';
import { LoggerModule } from './logger/logger.module';

@Module({
    imports: [
        PrometheusModule.register({
            defaultLabels: {
                app: 'telegramm',
            },
        }),
        ConfigModule.forRoot({
            envFilePath: '../../.env',
            isGlobal: true,
            load: [configuration],
        }),
        UserModule,
        PrismaModule,
        LoggerModule,
    ],
})
export class AppModule {}
