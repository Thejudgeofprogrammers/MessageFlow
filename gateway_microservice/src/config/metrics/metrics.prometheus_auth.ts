import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProvidersAuth = [
    // Счётчик для общего числа запросов на логин
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_LOGIN_TOTAL',
        help: 'Total number of login requests, categorized by success or failure',
        labelNames: ['result'], // 'result' может быть 'success' или 'failure'
    }),

    // Гистограмма для измерения времени выполнения запросов на логин
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_LOGIN_DURATION',
        help: 'Duration of login requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10], // Время в секундах
    }),

    // Счётчик для общего числа запросов на регистрацию
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_REGISTER_TOTAL',
        help: 'Total number of register requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на регистрацию
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_REGISTER_DURATION',
        help: 'Duration of register requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на логаут
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_LOGOUT_TOTAL',
        help: 'Total number of logout requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на логаут
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_LOGOUT_DURATION',
        help: 'Duration of logout requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),

    // Счётчик для общего числа запросов на удаление пользователя
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_DELETE_TOTAL',
        help: 'Total number of delete user requests, categorized by success or failure',
        labelNames: ['result'],
    }),

    // Гистограмма для измерения времени выполнения запросов на удаление пользователя
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_DELETE_DURATION',
        help: 'Duration of delete user requests',
        buckets: [0.1, 0.5, 1, 2, 5, 10],
    }),
];
