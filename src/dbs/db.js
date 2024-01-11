require('dotenv').config();
module.exports = {
    HOST: process.env.WLC_NET_DB_HOST,
    USER: process.env.WLC_NET_DB_USER,
    PASSWORD: process.env.WLC_NET_DB_PASSWORD,
};