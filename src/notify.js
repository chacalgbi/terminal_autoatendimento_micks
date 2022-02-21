const firebase = require('firebase-admin')
const service = require('../sdk.json')

firebase.initializeApp({ credential: firebase.credential.cert(service) });

const options = {priority: 'high', timeToLive: 60 * 60 * 24}

module.exports = function enviar(tokens, title, body){
    const payload = {
        notification: {
            title: title,
            body: body,
            color: '#0000FF',
        }
    }

    firebase.messaging().sendToDevice(tokens, payload, options)
    .then((res) => {
        console.log('Enviado para:', res.successCount, "dispositivos");
    })
    .catch((error) => {
        console.log('Error:', error);
    });
}