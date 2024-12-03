import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SessionUserModule } from './cache-session-user/cache-session-user.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import configuration from '../config/config.main';

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
        SessionUserModule,
    ],
})
export class AppModule {}
