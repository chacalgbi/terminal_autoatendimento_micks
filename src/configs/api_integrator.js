var axios = require("axios").default;

module.exports = function API_Integrator_Fatura_Cliente(codcli, from, to){
    var options = {
        method: 'POST',
        url: process.env.URL,
        headers: {'Content-Type': 'application/json'},
        data: {
          request: {
            sendRequest: 'integrator.server',
            method: 'list',
            submethod: 'faturas.cliente',
            params: {
              _user: process.env.USER_INTE,
              _passwd: process.env.PASS_INTE,
              codcli: codcli,
              from: from,
              to: to
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