import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizeModule } from './authorize/authorize.module';
import { SessionModule } from './session/session.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import configuration from '../config/config.main';
import { LoggerModule } from './logger/logger.module';
import { LoggerMiddleware } from './logger/logger.middleware';

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
        LoggerModule,
        UserModule,
        ChatModule,
        AuthorizeModule,
        SessionModule,
    ],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
