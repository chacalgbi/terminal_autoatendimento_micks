var axios = require("axios").default;

module.exports = function Barra(codfat){
    var options = {
        method: 'POST',
        url: process.env.URL,
        headers: {'Content-Type': 'application/json'},
        data: {
          request: {
            sendRequest: 'integrator.server',
            method: 'list',
            submethod: 'datasource.linhaDigitavel',
            params: {
              _user: process.env.USER_INTE,
              _passwd: process.env.PASS_INTE,
              codfat: codfat
            }
          }
        }
      };

    return new Promise((resolve, reject) => {
        axios.request(options).then(function (response) {
            resolve(response.data.data.results[0].codigo_barras);
        }).catch(function (error) {
            reject(error);
        });
    })
}