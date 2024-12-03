import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsMessager: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'messager_microservice:50055',
        package: 'messager',
        protoPath: join(__dirname, '../protos/proto_files/messager.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
