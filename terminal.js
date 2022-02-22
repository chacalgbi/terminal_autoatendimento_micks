require('dotenv').config()
const app = require('./src/app');
const appWs = require('./src/app-ws');

const server = app.listen(8080, () => {
    console.log("API Terminal Atendimento - Porta 8080");
});

appWs(server);