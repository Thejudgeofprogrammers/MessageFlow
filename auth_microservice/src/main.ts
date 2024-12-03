import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { grpcClientOptionsAuth } from './config/grpc.options_auth';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice(grpcClientOptionsAuth);
    await app.startAllMicroservices();
}

bootstrap();
