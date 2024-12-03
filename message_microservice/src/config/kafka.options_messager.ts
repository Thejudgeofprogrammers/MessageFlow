import { ClientOptions, Transport } from '@nestjs/microservices';

export const kafkaMicroservice: ClientOptions = {
    transport: Transport.KAFKA,
    options: {
        client: {
            brokers: [process.env.KAFKA_BROKER],
        },
        consumer: {
            groupId: 'my-consumer-group',
        },
    },
};
