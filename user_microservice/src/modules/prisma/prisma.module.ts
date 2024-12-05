import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

@Module({
    imports: [LoggerModule],
    providers: [PrismaService, WinstonLoggerService],
    exports: [PrismaService],
})
export class PrismaModule {}
