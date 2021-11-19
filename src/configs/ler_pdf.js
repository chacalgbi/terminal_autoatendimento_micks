const fs = require("fs");
const pdf = require("pdf-parse");

function desc(start, stop, texto){
    let tamanho = start.length;
    let inicio = texto.indexOf(start);
    if(inicio == -1) return "nao_encontrado"
    inicio = inicio + tamanho;
    let fim = texto.indexOf(stop);
    return texto.substring(inicio, fim).trim();
}

function pegar(start, texto){
    let tamanho = start.length;
    let inicio = texto.indexOf(start);
    if(inicio == -1) return "nao_encontrado"
    inicio = inicio + tamanho;
    let fim = texto.indexOf("\\n", inicio);
    return texto.substring(inicio, fim).trim();
}

async function readPdf(boleto) {
  //  return new Promise((resolve, reject) => {
      const dataBuffer = fs.readFileSync(boleto);
      return pdf(dataBuffer);
   // })
}

module.exports = function lerPDF(boleto){
    return new Promise((resolve, reject) => {
        let pdf_lido = {};
        readPdf(boleto).then((data)=>{
            const texto =  JSON.stringify(data.text);
            const vencimento = pegar("Vencimento\\n", texto);
            const valor = pegar("Valor do Documento\\n", texto);
            const desconto = desc("DESCONTO DE R$", " PARA PAGAMENTO ATÉ", texto);
            //console.log(texto);
            console.log("---------------------------");
            console.log("Vencimento:",vencimento);
            console.log("Valor:",valor);
            console.log("Desconto:",desconto);
            pdf_lido.vencimento = vencimento;
            pdf_lido.valor = valor;
            pdf_lido.desconto = desconto;
            resolve(pdf_lido);
        }).catch((erro)=>{
            reject("erro_ler_pdf");
        });
    })
}