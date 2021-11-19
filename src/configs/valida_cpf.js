const { cpf } = require('cpf-cnpj-validator');

module.exports = function validar_cpf(value){
    const formatado = value.replace(/\D+/g, "");
    return cpf.isValid(formatado);
}