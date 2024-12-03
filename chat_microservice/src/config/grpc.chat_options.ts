import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsChat: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'chat_microservice:50054',
        package: 'chat',
        protoPath: join(__dirname, '../protos/proto_files/chat.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
