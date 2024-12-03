import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { grpcClientOptionsSessionUser } from './config/grpc.options_user';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice(grpcClientOptionsSessionUser);
    await app.startAllMicroservices();
}

bootstrap();
