import { Module } from '@nestjs/common';
import { SessionUserService } from './cache-session-user.service';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProviders } from 'src/config/metrics.prometheus';

@Module({
    imports: [PrometheusModule],
    controllers: [SessionUserService],
    providers: [...prometheusProviders],
})
export class SessionUserModule {}
