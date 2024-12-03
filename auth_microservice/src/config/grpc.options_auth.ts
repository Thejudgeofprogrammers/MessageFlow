import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsAuth: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'auth_microservice:50051',
        package: 'auth',
        protoPath: join(__dirname, '../protos/proto_files/auth.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
