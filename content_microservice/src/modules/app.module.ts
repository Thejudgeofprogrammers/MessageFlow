import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { AvatarUserContentModule } from './avatar_users/avatar_user.module';
import configuration from '../config/config.main';

@Module({
    imports: [
        PrometheusModule.register({
            defaultLabels: {
                app: 'telegram',
            },
        }),
        ConfigModule.forRoot({
            envFilePath: '../../.env',
            isGlobal: true,
            load: [configuration],
        }),
        AvatarUserContentModule,
    ],
})
export class AppModule {}
