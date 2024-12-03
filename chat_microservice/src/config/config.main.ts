export default () => ({
    mongo_uri: process.env.MONGO_URI,
    mongo_user: process.env.MONGO_INITDB_ROOT_USERNAME,
    mongo_password: process.env.MONGO_INITDB_ROOT_PASSWORD,
    websocket_connection: process.env.WEBSOCKET_CONNECTION,
});
