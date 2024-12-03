import {
    makeCounterProvider,
    makeHistogramProvider,
} from '@willsoto/nestjs-prometheus';

export const prometheusProviders = [
    makeCounterProvider({
        name: 'PROM_METRIC_SESSION_SAVE_TOTAL',
        help: 'Total number of user session save requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_SESSION_SAVE_DURATION',
        help: 'Duration of user session save requests',
    }),
    makeCounterProvider({
        name: 'PROM_METRIC_SESSION_GET_TOTAL',
        help: 'Total number of user session get requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_SESSION_GET_DURATION',
        help: 'Duration of user session get requests',
    }),
    makeCounterProvider({
        name: 'PROM_METRIC_SESSION_DELETE_TOTAL',
        help: 'Total number of user session delete requests',
    }),
    makeHistogramProvider({
        name: 'PROM_METRIC_SESSION_DELETE_DURATION',
        help: 'Duration of user session delete requests',
    }),
];
