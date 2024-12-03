import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProvidersUser } from 'src/config/metrics/metrics.prometheus_user';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

@Module({
    imports: [PrometheusModule, LoggerModule],
    controllers: [UserController],
    providers: [UserService, ...prometheusProvidersUser, WinstonLoggerService],
    exports: [UserService],
})
export class UserModule {}
