import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProviders } from 'src/config/metrics.prometheus';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

@Module({
    imports: [PrismaModule, LoggerModule, PrometheusModule],
    controllers: [UserService, WinstonLoggerService],
    providers: [...prometheusProviders, PrismaService],
})
export class UserModule {}
