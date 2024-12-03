import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');
    await app.listen(3000);

    const grpcMicroserviceOptions: MicroserviceOptions = {
        transport: Transport.GRPC,
        options: {
            url: 'localhost:5000',
            package: 'userSession',
            protoPath: '../../protos/gateway.proto',
        },
    };
    app.connectMicroservice(grpcMicroserviceOptions);

    await app.startAllMicroservices();
}

bootstrap();
