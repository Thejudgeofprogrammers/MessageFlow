import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsChat: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'content_microservice:50055',
        package: 'content',
        protoPath: join(__dirname, '../protos/proto_files/content.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
