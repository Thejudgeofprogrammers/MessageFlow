import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProviders = [
    makeCounterProvider({
        name: 'PROM_METRIC_USER_CREATE_TOTAL',
        help: 'Total number of user creation requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_USER_CREATE_DURATION',
        help: 'Duration of user creation requests',
    }),
    makeCounterProvider({
        name: 'PROM_METRIC_USER_FIND_TOTAL',
        help: 'Total number of user find requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_USER_FIND_DURATION',
        help: 'Duration of user find requests',
    }),
];
