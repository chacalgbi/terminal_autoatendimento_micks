const { cnpj } = require('cpf-cnpj-validator');

module.exports = function validar_cnpj(value){
    const formatado = value.replace(/\D+/g, "");
    return cnpj.isValid(formatado);
}