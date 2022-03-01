const data = require('./dataDay')

var vencimento = '2022-03-02 00:00:00';
var amanha = data.dataDayFormat().tomorrow1

console.log(vencimento == amanha);

console.log(vencimento);
console.log(amanha);