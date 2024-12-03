export default () => ({
    jwt_options: {
        secret: process.env.SECRET_KEY,
        expire: process.env.EXPIRE_JWT,
    },
});
