import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaModule } from '../prisma/prisma.module';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { prometheusProviders } from 'src/config/metrics.prometheus';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    imports: [PrismaModule, PrometheusModule],
    controllers: [UserService],
    providers: [...prometheusProviders, PrismaService],
})
export class UserModule {}
