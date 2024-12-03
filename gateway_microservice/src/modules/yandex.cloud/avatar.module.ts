import { Module } from '@nestjs/common';
import { YandexCloudStorageService } from './yandex-cloud-storage.service';
import { AvatarProvider } from './avatar.provider';
import { AvatarController } from './avatar.controller';
import { MulterModule } from '@nestjs/platform-express';
import { prometheusProvidersAvatar } from 'src/config/metrics/metrics.prometheus_avatar';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';

@Module({
    imports: [
        MulterModule.register({
            dest: './temp',
        }),
        LoggerModule,
    ],
    controllers: [AvatarController],
    providers: [
        YandexCloudStorageService,
        AvatarProvider,
        ...prometheusProvidersAvatar,
        WinstonLoggerService,
    ],
})
export class AvatarModule {}
