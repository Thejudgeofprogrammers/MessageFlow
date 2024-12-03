import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { grpcClientOptionsChat } from './config/grpc.chat_options';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice(grpcClientOptionsChat);
    await app.startAllMicroservices();
}

bootstrap();
