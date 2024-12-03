// export function RequireQueryPayload(statusClient: {
//     message: string;
//     status: number;
// }) {
//     return (target: any, key: string, descriptor: PropertyDescriptor) => {
//         const originalMethod = descriptor.value;

//         descriptor.value = function (...args: any[]) {
//             const [req, res] = args;

//             if (!req.query || Object.keys(req.query).length === 0) {
//                 return res
//                     .status(statusClient.status)
//                     .json({ message: statusClient.message });
//             }

//             return originalMethod.apply(this, args);
//         };

//         return descriptor;
//     };
// }
