import { Module } from '@nestjs/common';
import { AuthService } from './auth.controller';
import { CryptModule } from '../crypt/crypt.module';
import { TokenModule } from '../token/token.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProviders } from 'src/config/metrics.prometheus';

@Module({
    imports: [CryptModule, TokenModule, PrometheusModule],
    controllers: [AuthService],
    providers: [...prometheusProviders],
})
export class AuthModule {}
