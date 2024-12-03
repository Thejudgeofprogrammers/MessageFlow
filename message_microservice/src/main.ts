import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { kafkaMicroservice } from './config/kafka.options_messager';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.connectMicroservice(kafkaMicroservice);
    await app.startAllMicroservices();
    await app.listen(5000);
}

bootstrap();
