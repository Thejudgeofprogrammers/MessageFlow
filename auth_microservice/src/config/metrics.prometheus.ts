import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProviders = [
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_LOGIN_TOTAL',
        help: 'Total number of logins',
    }),
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_LOGIN_FAILURE_TOTAL',
        help: 'Total number of failed login attempts',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_LOGIN_DURATION',
        help: 'Duration of login requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_AUTH_REGISTER_DURATION',
        help: 'Duration of registration requests',
    }),
    makeCounterProvider({
        name: 'PROM_METRIC_AUTH_REGISTER_TOTAL',
        help: 'Total number of registrations',
    }),
];
