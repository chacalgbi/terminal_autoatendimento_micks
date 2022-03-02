var axios = require("axios").default;

module.exports = function API_Integrator_atendimento(codsercli, codcli, desc, ocorrencia, codUsu_d){
  
    var options = {
        method: 'POST',
        url: process.env.URL,
        headers: {'Content-Type': 'application/json'},
        data: {
          request: {
            sendRequest: 'integrator.server',
            method: 'list',
            submethod: 'datasource.criarAtendimento',
            params: {
              _user: process.env.USER_INTE,
              _passwd: process.env.PASS_INTE,
              codcli: codcli, 
              codocop: ocorrencia, 
              codsercli: codsercli, 
              descri_oco: desc, 
              codusu: "E9",  //Usuário MicksApp
              codusu_d: codUsu_d, 
              codcatoco: "01DD0UVGAQ", 
              codmvis: "PROBLEMA"
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