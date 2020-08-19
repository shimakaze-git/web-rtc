const redisHost = process.env.REDIS_HOST || 'redis'
const SocketPort = process.env.PORT || '3000'

const redis = {
    host: redisHost,
    port: 6379,
};

const socket = {
    port: SocketPort,
};

module.exports = {
    redis,
    socket,
};