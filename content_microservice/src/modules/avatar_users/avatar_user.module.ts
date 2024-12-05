import { Module } from '@nestjs/common';
import { AvatarUserContentService } from './avatar_user.service';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';
import { CassandraModule } from '../cassandra/cassandra.module';
import { CassandraService } from '../cassandra/cassandra.service';
import { prometheusProvidersAvatarUser } from 'src/config/metrics.avatar.user';

@Module({
    imports: [LoggerModule, CassandraModule],
    providers: [
        AvatarUserContentService,
        WinstonLoggerService,
        CassandraService,
        ...prometheusProvidersAvatarUser,
    ],
})
export class AvatarUserContentModule {}
