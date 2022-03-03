const firebase = require('firebase-admin')
const service = require('../sdk.json')

firebase.initializeApp({ credential: firebase.credential.cert(service) });

const options = {priority: 'high', timeToLive: 60 * 60 * 24}

module.exports = function enviar(tokens, title, body){
    return new Promise((resolve , reject)=>{
        let obj = {}
        const payload = {
            notification: {
                title: title,
                body: body
            }
        }
    
        firebase.messaging().sendToDevice(tokens, payload, options)
        .then((res) => {
            obj.erro = false
            obj.envios = res.successCount
            obj.msg = `Enviado para ${res.successCount} dispositivos`
            resolve(obj)
        })
        .catch((error) => {
            obj.erro = true
            obj.envios = 0
            obj.msg = error
            reject(obj)
        });

    })
}