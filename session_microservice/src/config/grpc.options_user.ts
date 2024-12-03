import { ReflectionService } from '@grpc/reflection';
import { Transport, ClientOptions } from '@nestjs/microservices';
import { join } from 'path';

export const grpcClientOptionsSessionUser: ClientOptions = {
    transport: Transport.GRPC,
    options: {
        url: 'session_microservice:50053',
        package: 'session_user',
        protoPath: join(__dirname, '../protos/proto_files/session_user.proto'),
        onLoadPackageDefinition: (pkg, server) => {
            new ReflectionService(pkg).addToServer(server);
        },
    },
};
