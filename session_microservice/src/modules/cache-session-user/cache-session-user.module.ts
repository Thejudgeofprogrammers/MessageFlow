import { Module } from '@nestjs/common';
import { SessionUserService } from './cache-session-user.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProviders } from 'src/config/metrics.prometheus';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

@Module({
    imports: [PrometheusModule, LoggerModule],
    controllers: [SessionUserService],
    providers: [WinstonLoggerService, ...prometheusProviders],
})
export class SessionUserModule {}
