const time  = require('../configs/dataHora');
const log   = require('../configs/log');
const API   = require('../configs/resposta_API');;
const BD    = require('../configs/acessar_BD');
const INTE  = require('../configs/integrator');
const vCPF  = require('../configs/valida_cpf');
const vCNPJ = require('../configs/valida_cnpj');
const ApiIntegrator = require('../configs/api_integrator');
const linkBoleto = require('../configs/integrator_verBoleto');
const abrirHtml = require('../configs/abrir_html');
const baixarPdf = require('../configs/baixar_pdf');
const lerPdf = require('../configs/ler_pdf');
const apagar = require('../configs/apagar_boleto');
const delay = require('../configs/delay');
const path = './files/boleto.pdf';

let tudo_ok = true;
let proximo_for = false;
let trava = 0;

class buscarCliente{

  async cpf(req, res){

    if(req.body.cpf){ // Se existir o campo CPF
      let retorno = { cpf: req.body.cpf }
      if(req.body.cpf.length === 14){
        if(vCPF(req.body.cpf)){
          const sql = `SELECT  c.codcli, c.nome_cli, c.endereco, c.bairro FROM servicos_cli sc JOIN clientes c on c.codcli=sc.codcli  JOIN servicos s on s.codser = sc.codser JOIN dados_pop un on sc.codpop=un.codpop WHERE TRUE AND c.ativo = 'S' AND sc.codest != '020IN0W6LU' AND s.autentica_radius = 'S' AND c.cpf = '${req.body.cpf}' GROUP by sc.codsercli`;
          await INTE(sql).then((resp)=>{
            if(resp.resposta.length === 0){
              retorno.msg = "CPF Válido. Mas você não é cliente MICKS! :(";
              retorno.prospecto = "nao";
            }else{
              retorno.msg = "CPF Válido. Confira seu plano";
              retorno.prospecto = "sim";
            }
            retorno.dados = resp;
            API(retorno, res, 200, true);
          }).catch((erro)=>{
            retorno.dados = erro;
            API(retorno, res, 200, false);
          });
        }else{
          retorno.msg = "CPF Inválido! Por favor, digite um CPF válido!";
          retorno.prospecto = "";
          API(retorno, res, 200, false);
        }      
      }else{
        retorno.msg = "CPF Incompleto! Por favor digite todos os números!";
        API(retorno, res, 200, false);
      }
    }else{
      API({msg: "Erro de Sintaxe, o Campo CPF não foi informado"}, res, 200, false);
    }

  }

  async cnpj(req, res){

    if(req.body.cnpj){ // Se existir o campo CPF
      let retorno = { cnpj: req.body.cnpj }
      if(req.body.cnpj.length === 18){
        if(vCNPJ(req.body.cnpj)){
          const sql = `SELECT  c.codcli, c.nome_cli, c.endereco, c.bairro FROM servicos_cli sc JOIN clientes c on c.codcli=sc.codcli  JOIN servicos s on s.codser = sc.codser JOIN dados_pop un on sc.codpop=un.codpop WHERE TRUE AND c.ativo = 'S' AND sc.codest != '020IN0W6LU' AND s.autentica_radius = 'S' AND c.cnpj = '${req.body.cnpj}' GROUP by sc.codsercli`;
          await INTE(sql).then((resp)=>{
            if(resp.resposta.length === 0){
              retorno.msg = "CNPJ Válido. Mas você não é cliente MICKS! :(";
              retorno.prospecto = "nao";
            }else{
              retorno.msg = "CNPJ Válido. Confira seu plano";
              retorno.prospecto = "sim";
            }
            retorno.dados = resp;
            API(retorno, res, 200, true);
          }).catch((erro)=>{
            retorno.dados = erro;
            API(retorno, res, 200, false);
          });
        }else{
          retorno.msg = "CNPJ Inválido! Por favor, digite um CNPJ válido!";
          retorno.prospecto = "";
          API(retorno, res, 200, false);
        }      
      }else{
        retorno.msg = "CNPJ Incompleto! Por favor digite todos os números!";
        API(retorno, res, 200, false);
      }
    }else{
      API({msg: "Erro de Sintaxe, o Campo CNPJ não foi informado"}, res, 200, false);
    }

  }

  async faturas(req, res){
    const formatado = req.body.codcli.replace(/\D+/g, "");
    let retorno = { codcli: formatado }
    log(`Faturas do cliente: ${formatado}`, "info");
    let resposta;
    const sql = `SELECT fat.codfat, sp.porcentagem, DATE_FORMAT(fat.data_ven, '%d/%m/%Y') as vencimento, c.nome_cli, c.endereco, c.bairro, cr.histo_rec, fat.status, fat.data_ven FROM contas_rec cr  
                 JOIN servicos_cli sc on sc.codsercli=cr.codsercli JOIN detalhe_faturas df ON df.codcrec = cr.codcrec JOIN faturas fat on fat.codfat= df.codfat 
                 JOIN clientes c on c.codcli = cr.codcli LEFT JOIN servicos_pant sp on sp.codser = sc.codser 
                 WHERE TRUE AND cr.codcli = '${formatado}' AND cr.data_bai is null AND cr.valor_lan-cr.valor_pag>0 AND fat.status != 'D' GROUP by fat.codfat ORDER BY data_ven;`;
    
    await INTE(sql).then((resp)=>{
      resposta = resp;
      if(resp.resposta.length === 0){
        tudo_ok = false;
        retorno.msg = "Não foram encontradas faturas para este cliente";
        retorno.prospecto = "nao";
        log("Cliente nao encontrado", "erro");
        API(retorno, res, 200, tudo_ok);
      }else{
        log(`SELECT de: ${resp.resposta[0].nome_cli} - ${resp.resposta.length} faturas`);
        retorno.msg = "Confira suas faturas";
        retorno.prospecto = "sim";
      }
    })
    .catch((erro)=>{
      retorno.dados = erro;
      tudo_ok = false;
      retorno.msg = "Erro ao buscar no Banco de Dados do Integrator";
      API(retorno, res, 200, tudo_ok);
    });

    if(retorno.prospecto === "sim"){
      let modificado = [];
      //Comparar os dados do SELECT com os dados da API do Integrator
      for (const [index, fatura] of resposta.resposta.entries()) {
        //console.log("BD:  ", fatura.codfat);
        await ApiIntegrator(formatado, fatura.vencimento, fatura.vencimento).then((resp)=>{
            resp.data.results.map((item, index)=>{
              if(fatura.codfat == item.codfat){
                proximo_for = true;
                let obj = {
                  cod_fatura: fatura.codfat,
                  vencimento: fatura.vencimento,
                  cliente: fatura.nome_cli,
                  endereco: `${fatura.endereco} - ${fatura.bairro}`,
                  decricao1: fatura.histo_rec,
                  descricao2: item.descri_cob,
                  percentual_desc: fatura.porcentagem,
                  valor_normal: parseFloat(item.valor),
                  valor_a_pagar: parseFloat(item.valor_com_juros)
                }
                parseInt(item.dias) <= 0 ? obj.dias_vencidos = 0 : obj.dias_vencidos = parseInt(item.dias);
                
                modificado.push(obj);
              }else{
                console.log("Codfat não é igual");
              }
            });
         })
        .catch((erro)=>{
          console.log(erro);
          tudo_ok = false;
          retorno.msg = "Erro ao buscar na API do Integrator o codcli";
          retorno.erro = erro;
        });
      }
      retorno.num_faturas = modificado.length;
      retorno.boletos = modificado;
      modificado = [];

      if(proximo_for){
          // Pegar aqui o valor do desconto que está no boleto
          for (const [index, boleto] of retorno.boletos.entries()) {
            trava = 0;

            if(trava === 0){
              await apagar().then((resp_apagar)=>{
                //console.log(resp_apagar);
                trava = 1;
              }).catch((err_apagar)=>{
                console.log("Erro Apagar", err_apagar);
                tudo_ok = false;
                retorno.msg = "Erro ao apagar o PDF";
                retorno.erro = err_apagar;
              });
            }

            if(trava === 1){
              await linkBoleto(boleto.cod_fatura).then((resp_link)=>{
                retorno.boletos[index].linkHtml = "http://177.38.178.24/" + resp_link.data.results[0].linkBoleto;
                trava = 2
              }).catch((err_link)=>{
                console.log("Erro Link", err_link);
                tudo_ok = false;
                retorno.msg = "Erro ao pegar o link do Boleto";
                retorno.erro = err_link;
              });
  
            }

            if(trava === 2){
              await delay(500);
              trava = 3;
            }

            if(trava === 3){
              await abrirHtml(retorno.boletos[index].linkHtml).then((resp_pdf)=>{
                retorno.boletos[index].linkPDF = resp_pdf;
                trava = 4;       
              }).catch((err_pdf)=>{
                console.log("Erro PDF", err_pdf);
                tudo_ok = false;
                retorno.msg = "Erro ao extrair o link PDF do link HTML";
                retorno.erro = err_pdf;
              });
            }

            if(trava === 4){
              await baixarPdf(retorno.boletos[index].linkPDF, path, function(){  }).then((res_baixou)=>{
                retorno.boletos[index].status_boleto = res_baixou;
                trava = 0;
              }).catch((err_baixou)=>{
                console.log("Erro ao Baixar:", err_baixou);
                tudo_ok = false;
                retorno.msg = "Erro ao extrair informações do boleto";
                retorno.erro = err_baixou;
              });
            }

          }
      }

      API(retorno, res, 200, tudo_ok);
    }
  }

}
module.exports = new buscarCliente();