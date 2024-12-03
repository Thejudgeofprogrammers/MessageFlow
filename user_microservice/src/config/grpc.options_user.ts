import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsUser: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'user_microservice:50052',
        package: 'user',
        protoPath: join(__dirname, '../protos/proto_files/user.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
