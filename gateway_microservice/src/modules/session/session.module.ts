import { MiddlewareConsumer, Module } from '@nestjs/common';
import { SessionMiddleware } from './session.middleware';
import { exludeRoutes } from 'src/config/exlude_route';
import { sessionUserProviders } from 'src/config/grpc/grpc.session.options';
import { WinstonLoggerService } from '../logger/logger.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [LoggerModule],
    providers: [
        SessionMiddleware,
        ...sessionUserProviders,
        WinstonLoggerService,
    ],
})
export class SessionModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(SessionMiddleware)
            .exclude(...exludeRoutes)
            .forRoutes('*');
    }
}
