import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersAuth = [
    // Метрики для хеширования пароля
    makeCounterProvider({
        name: 'TO_HASH_PASSWORD_TOTAL',
        help: 'Total number of ToHashPassword requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    makeHistogramProvider({
        name: 'TO_HASH_PASSWORD_DURATION',
        help: 'Duration of ToHashPassword requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Метрики для CheckPassword
    makeCounterProvider({
        name: 'AUTH_CHECK_PASSWORD_TOTAL',
        help: 'Total number of CheckPassword requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'AUTH_CHECK_PASSWORD_DURATION',
        help: 'Duration of CheckPassword requests',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),

    // Метрики для Register
    makeCounterProvider({
        name: 'AUTH_REGISTER_TOTAL',
        help: 'Total number of Register requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'AUTH_REGISTER_DURATION',
        help: 'Duration of Register requests',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),

    // Метрики для Login
    makeCounterProvider({
        name: 'AUTH_LOGIN_TOTAL',
        help: 'Total number of Login requests, categorized by success or failure',
        labelNames: ['result'],
    }),
    makeHistogramProvider({
        name: 'AUTH_LOGIN_DURATION',
        help: 'Duration of Login requests',
        buckets: [0.1, 0.5, 1, 2, 5],
    }),
];
