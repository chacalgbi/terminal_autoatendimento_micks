var axios = require("axios").default;

module.exports = function API_Integrator_desbloqueio(codsercli){
    var options = {
        method: 'POST',
        url: process.env.URL,
        headers: {'Content-Type': 'application/json'},
        data: {
          request: {
            sendRequest: 'integrator.server',
            method: 'list',
            submethod: 'habilitacaoProvisoria.execute',
            params: {
              _user: process.env.USER_INTE,
              _passwd: process.env.PASS_INTE,
              codsercli: codsercli
            }
          }
        }
      };

    return new Promise((resolve, reject) => {
        axios.request(options).then(function (response) {
            resolve(response.data);
        }).catch(function (error) {
            reject(error);
        });
    })
  }