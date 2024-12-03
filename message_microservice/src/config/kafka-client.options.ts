import * as dotenv from 'dotenv';

dotenv.config();

export const kafkaOptionsClient = {
    clientId: process.env.KAFKA_CLIENT,
    brokers: [process.env.KAFKA_BROKER],
};
