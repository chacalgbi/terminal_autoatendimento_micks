var request = require('request');
var fs = require('fs');
const log = require('../configs/log');
const pdf = require("pdf-parse");

let boleto_existe = false;
const path = './files/boleto.pdf';
let kilobytes = 0;

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

async function readPdf() {
    const dataBuffer = fs.readFileSync('./files/boleto.pdf');
    return pdf(dataBuffer);
}

function textoAleatorio(tamanho){
    var letras = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    var aleatorio = '';
    for (var i = 0; i < tamanho; i++) {
        var rnum = Math.floor(Math.random() * letras.length);
        aleatorio += letras.substring(rnum, rnum + 1);
    }
    return aleatorio;
}

module.exports = function download(uri, filename, dias, callback){
    return new Promise((resolve, reject) =>{
        if (fs.existsSync(path)) {
            fs.rename(path, `./files/${textoAleatorio(15)}.pdf`, function (err) {
                if (err) throw err;
                console.log('Arquivo Renomeado');
              });
        }

        request.head(uri, function(err, res, body){
            //console.log(data_hora(),"Resposta ", res.headers['content-length']);
            if(res.headers['content-length']){
                //console.log("___Boleto Encontrado");
                kilobytes =  (parseInt(res.headers['content-length']) / 1000).toFixed(1);
                boleto_existe = true;
            }else{
                boleto_existe = false;
                console.log('Erro ao baixar o Boleto');
            }
            request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);

            if(boleto_existe){
                let pdf_lido = {PDF: "OK", tamanho: kilobytes + " kb"};
                setTimeout(()=>{
                    readPdf().then((data)=>{
                        const texto =  JSON.stringify(data.text);
                        const vencimento = pegar("Vencimento\\n", texto);
                        const valor = pegar("Valor do Documento\\n", texto).replace(",", ".");
                        const desconto = desc("DESCONTO DE R$", " PARA PAGAMENTO ATÉ", texto);
                        //console.log(texto);
                        log(`Vencimento: ${vencimento} - Valor: ${valor} - Desconto: ${desconto} - Dias vencidos: ${dias}`, 'alerta');
                        pdf_lido.vencimento = vencimento;
                        pdf_lido.valor = parseFloat(valor);
                        pdf_lido.desconto = parseFloat(desconto);
                        resolve(pdf_lido);
                    }).catch((erro)=>{
                        reject(erro.details);
                    });
                }, 1500);
            }else{
                reject({PDF: "ERROR", tamanho: kilobytes + " kb"})
            }
        }); 

    })
}