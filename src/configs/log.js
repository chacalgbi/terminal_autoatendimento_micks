const data_hora = require('./dataHora');

module.exports = function log(obj, modo=''){
         if(modo === 'erro')  { console.log('\x1b[41m', data_hora(), obj, '\x1b[0m'); } // Fundo vermelho, cor padrão
    else if(modo === 'info')  { console.log('\x1b[36m', data_hora(), obj, '\x1b[0m'); } // Azul claro
    else if(modo === 'alerta'){ console.log('\x1b[33m', data_hora(), obj, '\x1b[0m'); } // Amarelo
    else if(modo === 'temp')  { console.log('\x1b[5m',  data_hora(), obj, '\x1b[0m'); } // Piscando, cor padrão
    else{                       console.log('\x1b[37m', data_hora(), obj, '\x1b[0m'); } // branco
}