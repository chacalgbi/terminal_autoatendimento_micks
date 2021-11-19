require('dotenv').config()
const app = require('./src/app');

app.listen(8080, () => {
    console.log("API Terminal Atendimento - Porta 8080");
});