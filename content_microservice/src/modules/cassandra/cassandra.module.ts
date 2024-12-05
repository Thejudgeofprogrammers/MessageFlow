import { Module } from '@nestjs/common';
import { CassandraService } from './cassandra.service';
import { LoggerModule } from '../logger/logger.module';
import { WinstonLoggerService } from '../logger/logger.service';
import { prometheusProvidersCassandra } from 'src/config/metrics.cassandra';

@Module({
    imports: [LoggerModule],
    providers: [
        CassandraService,
        WinstonLoggerService,
        ...prometheusProvidersCassandra,
    ],
    exports: [CassandraService],
})
export class CassandraModule {}
