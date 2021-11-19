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

function readPdf(boleto) {
  return new Promise((resolve, reject) => {
    const dataBuffer = fs.readFileSync(boleto);
    resolve(pdf(dataBuffer));
  })
}

function lerPDF(boleto){
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
  }).catch((erro)=>{ });
}

lerPDF("./files/boleto1.pdf");
lerPDF("./files/boleto2.pdf");