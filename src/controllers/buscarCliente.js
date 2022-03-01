const time  = require('../configs/dataHora');
const log   = require('../configs/log');
const API   = require('../configs/resposta_API');
const BD    = require('../configs/acessar_BD');
const RAD   = require('../configs/acessar_radius');
const appBD = require('../app/appBD');
const INTE  = require('../configs/integrator');
const vCPF  = require('../configs/valida_cpf');
const vCNPJ = require('../configs/valida_cnpj');
const Barra = require('../configs/barra');
const ApiIntegrator = require('../configs/api_integrator');
const ApiIntegrator_desbloqueio = require('../configs/api_integrator_desbloqueio');
const linkBoleto = require('../configs/integrator_verBoleto');
const abrirHtml = require('../configs/abrir_html');
const baixarPdf = require('../configs/baixar_pdf');
const lerPdf = require('../configs/ler_pdf');
const apagar = require('../configs/apagar_boleto');
const delay = require('../configs/delay');
const path = './files/boleto.pdf';
const email_env = require('../email');
const { exec } = require('child_process');

let tudo_ok = true;
let proximo_for = false;
let trava = 0;
let limite_dias = 90;
let id = 0;

let fakerAdress = [
  {correct: false, adress: 'Teste1'},
  {correct: false, adress: 'Teste2'},
  {correct: false, adress: 'Teste3'},
  {correct: false, adress: 'Teste4'},
  {correct: false, adress: 'Teste5'},
  {correct: false, adress: 'Teste6'},
  {correct: false, adress: 'Teste7'},
  {correct: false, adress: 'Teste8'},
  {correct: false, adress: 'Teste9'},
  {correct: false, adress: 'Teste10'},
  {correct: false, adress: 'Teste11'},
  {correct: false, adress: 'Teste12'},
  {correct: false, adress: 'Teste13'},
  {correct: false, adress: 'Teste14'},
  {correct: false, adress: 'Teste15'},
]

function geraStringAleatoria(tamanho) {
  var stringAleatoria = '';
  var caracteres = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < tamanho; i++) {
      stringAleatoria += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return stringAleatoria;
}

function sortAddress(adressCorrect){
  let arrayTemp = fakerAdress;

  //Código para ordenar o Array Temporário de forma aletória
  for (let i = 0; i < arrayTemp.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayTemp[i], arrayTemp[j]] = [arrayTemp[j], arrayTemp[i]];
  }

  //Tira apenas 4 itens do array temporário já embaralhado
  let arrayCorrect = arrayTemp.slice(0, 5);

  //Add o enredeço correto
  arrayCorrect.push(adressCorrect)

  //Embaralha novamente, agora apenas com 5 endereços e o correto entre eles
  for (let i = 0; i < arrayCorrect.length; i++) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCorrect[i], arrayCorrect[j]] = [arrayCorrect[j], arrayCorrect[i]];
  }

  // Insere ID em todos os objetos
  let addID = []
  arrayCorrect.map((item, index)=>{
    let x = item;
    x.id = index
    addID.push(x)
  })

  return addID
}

function pegar(start, texto){
  let tamanho = start.length;
  let inicio = texto.indexOf(start);
  if(inicio == -1) return "nao_encontrado"
  inicio = inicio + tamanho;
  let fim = texto.indexOf("\\n", inicio);
  return texto.substring(inicio, fim).trim();
}

function sformat(s) {
  var fm = [
        Math.floor(s / 60 / 60 / 24), // dias
        Math.floor(s / 60 / 60) % 24, // horas
        Math.floor(s / 60) % 60, // minutos
        s % 60 // segundos
  ];
  return `${fm[0]}d ${fm[1]}h:${fm[2]}m:${fm[3]}s`
}

class buscarCliente{

  async cpf(req, res){
    let retorno = { cpf: '' }
    let isSucess = false;

	if(req.body.cpf){ // Se existir o campo CPF
		retorno.cpf = req.body.cpf;
		if(req.body.cpf.length === 14){
			if(vCPF(req.body.cpf)){
				const sql = `
        SELECT 
          sc.codsercli
        ,c.codcli as codigo
        ,TRIM(c.nome_cli) as nome_cli
        ,TRIM(c.endereco) as endereco
        ,TRIM(s.descri_ser) as descri_ser
        ,TRIM(c.bairro) as bairro
        ,c.cpf
        ,lr.login 
        FROM servicos_cli sc 
        JOIN clientes c on c.codcli=sc.codcli
        join servicos s on s.codser=sc.codser
        join login_radius lr on lr.codsercli=sc.codsercli 
        WHERE true 
        and c.cpf = '${req.body.cpf}'
        AND c.ativo = 'S' 
        and sc.codest != '020IN0W6LU' /*Cancelado*/
        AND s.autentica_radius = 'S';
        `;
				await INTE(sql).then((resp)=>{
					if(resp.resposta.length === 0){
						retorno.msg = "CPF Válido. Mas você não é cliente MICKS! :(";
						retorno.prospecto = "nao";
					}else{
						retorno.msg = "CPF Válido. Confira seu plano";
						retorno.prospecto = "sim";

            //Sortear endereço
            const address = {correct: true, adress: resp.resposta[0].endereco}
            retorno.listAdress = sortAddress(address);
					}
					isSucess = true;
					retorno.dados = resp;
				}).catch((erro)=>{
					console.log(erro)
					retorno.dados = erro;
					isSucess = false;
				});
			}else{
				retorno.msg = "CPF Inválido! Por favor, digite um CPF válido!";
				isSucess = false;
			}      
		}else{
			retorno.msg = "CPF Incompleto! Por favor digite todos os números!";
			isSucess = false;
		}
	}else{
		isSucess = false;
		retorno.msg = "Erro de Sintaxe, o Campo CPF não foi informado"
	}

	API(retorno, res, 200, isSucess);
  }

  async cnpj(req, res){

    if(req.body.cnpj){ // Se existir o campo CPF
      let retorno = { cnpj: req.body.cnpj }
      if(req.body.cnpj.length === 18){
        if(vCNPJ(req.body.cnpj)){
          const sql = `
        SELECT 
        sc.codsercli
        ,c.codcli as codigo
        ,TRIM(c.nome_cli) as nome_cli
        ,TRIM(c.endereco) as endereco
        ,TRIM(s.descri_ser) as descri_ser
        ,TRIM(c.bairro) as bairro
        ,c.cpf
        ,lr.login 
        FROM servicos_cli sc 
        JOIN clientes c on c.codcli=sc.codcli
        join servicos s on s.codser=sc.codser
        join login_radius lr on lr.codsercli=sc.codsercli 
        WHERE true 
        and c.cpf = '${req.body.cnpj}'
        AND c.ativo = 'S' 
        and sc.codest != '020IN0W6LU' /*Cancelado*/
        AND s.autentica_radius = 'S';
          `;
          await INTE(sql).then((resp)=>{
            if(resp.resposta.length === 0){
              retorno.msg = "CNPJ Válido. Mas você não é cliente MICKS! :(";
              retorno.prospecto = "nao";
            }else{
              retorno.msg = "CNPJ Válido. Confira seu plano";
              retorno.prospecto = "sim";

              //Sortear endereço
              const address = {correct: true, adress: resp.resposta[0].endereco}
              retorno.listAdress = sortAddress(address);

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

  async desbloqueio(req, res){
      tudo_ok = true;
      const codsercli = req.body.codsercli;
      let retorno = { codsercli: codsercli };
      await ApiIntegrator_desbloqueio(codsercli).then((resp)=>{
          log(resp);
          retorno.dados = resp;

          if(resp.error === true){
              tudo_ok = false;
              retorno.msg = `${resp.exception}`;
          }else{
              retorno.msg = "Habilitação provisória efetuada com sucesso! Aguarde 2 minutos, caso não volte sua internet, reinicie seus equipamentos";
          }  
          
      }).catch((erro)=>{
          retorno.dados = erro;
          tudo_ok = false;
          retorno.msg = "Erro ao buscar no nosso Banco de Dados";      
      });

      API(retorno, res, 200, tudo_ok);
  }

  async faturas(req, res){
    const formatado = req.body.codcli.replace(/\D+/g, "");
    log(`Faturas do cliente: ${formatado}`, "info");

    tudo_ok = true;
    proximo_for = false;
    trava = 0;
    let retorno = { codcli: formatado };
    let modificado = [];
    let resposta;
    const sql = `SELECT fat.codfat, sp.porcentagem, DATE_FORMAT(fat.data_ven, '%d/%m/%Y') as vencimento, c.nome_cli, c.endereco, c.bairro, cr.histo_rec, fat.status, fat.data_ven FROM contas_rec cr JOIN servicos_cli sc on sc.codsercli=cr.codsercli JOIN detalhe_faturas df ON df.codcrec = cr.codcrec JOIN faturas fat on fat.codfat= df.codfat JOIN clientes c on c.codcli = cr.codcli LEFT JOIN servicos_pant sp on sp.codser = sc.codser WHERE TRUE AND cr.codcli = '${formatado}' AND cr.data_bai is null AND cr.valor_lan-cr.valor_pag>0 AND fat.status != 'D' AND c.ativo='S' GROUP by fat.codfat ORDER BY data_ven;`;
    
    await INTE(sql).then((resp)=>{
        resposta = resp;
        if(resp.resposta.length === 0){
          retorno.msg = "Não foram encontradas faturas para este Plano";
          retorno.prospecto = "nao";
          retorno.boletos = []
          API(retorno, res, 200, tudo_ok);
        }else{
          log(`${resp.resposta[0].nome_cli} - ${resp.resposta.length} faturas`);
          retorno.msg = "Confira suas faturas";
          retorno.prospecto = "sim";
        }
    }).catch((erro)=>{
        retorno.dados = erro;
        tudo_ok = false;
        retorno.msg = "Erro ao buscar no Banco de Dados do Integrator";
        retorno.prospecto = "nao";
        API(retorno, res, 200, tudo_ok);
    });

    if(retorno.prospecto === "sim"){

        //Comparar dados do SELECT com dados do Integrator
        for (const [index, fatura] of resposta.resposta.entries()) {
            await ApiIntegrator(formatado, fatura.vencimento, fatura.vencimento).then((resp)=>{
                resp.data.results.map((item, index)=>{
                  if(parseInt(item.dias) > limite_dias){
                    retorno.msg = "Por favor, procure a Micks";
                    retorno.prospecto = "sim";
                    tudo_ok = false;
                    log(`Vencimento:${fatura.vencimento} - Valor:${item.valor_com_juros} - Dias de Atraso:${item.dias}`, "erro");
                  }else if(fatura.codfat == item.codfat){
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
                      valor_a_pagar: parseFloat(item.valor_com_juros),
                      dias_vencidos: parseInt(item.dias)
                    }
                    modificado.push(obj);
                  }else{
                    log(`Codfat não é igual: API:${item.codfat} - BD:${fatura.codfat}`, "erro");
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

        // PEGAR O CÓDIGO DE BARRAS DOS BOLETOS
        for (const [index, item] of modificado.entries()) {
            await Barra(item.cod_fatura).then((resp)=>{
                item.codBarra = resp
            })
            .catch((erro)=>{
                item.codBarra = ""
                console.log(erro)
            });
        }

        retorno.num_faturas = modificado.length;
        retorno.boletos = modificado;

      if(proximo_for){
          // Pegar aqui o valor do desconto que está no boleto
          for (const [index, boleto] of retorno.boletos.entries()) {
              trava = 0;
              tudo_ok = true;

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
                await delay(300);
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
              await baixarPdf(retorno.boletos[index].linkPDF, path, retorno.boletos[index].dias_vencidos, function(){  }).then((res_baixou)=>{
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

  async faturas_app(req, res){
    const formatado = req.body.codcli.replace(/\D+/g, "");
    log(`APP - Faturas do cliente: ${formatado}`, "info");
    id = 0;

    tudo_ok = true;
    proximo_for = false;
    trava = 0;
    let retorno = { codcli: formatado };
    let modificado = [];
    let resposta;
    const sql = `SELECT fat.codfat, sp.porcentagem, DATE_FORMAT(fat.data_ven, '%d/%m/%Y') as vencimento, c.nome_cli, c.endereco, c.bairro, cr.histo_rec, fat.status, fat.data_ven FROM contas_rec cr JOIN servicos_cli sc on sc.codsercli=cr.codsercli JOIN detalhe_faturas df ON df.codcrec = cr.codcrec JOIN faturas fat on fat.codfat= df.codfat JOIN clientes c on c.codcli = cr.codcli LEFT JOIN servicos_pant sp on sp.codser = sc.codser WHERE TRUE AND cr.codcli = '${formatado}' AND cr.data_bai is null AND cr.valor_lan-cr.valor_pag>0 AND fat.status != 'D' AND c.ativo='S' GROUP by fat.codfat ORDER BY data_ven;`;
    
    await INTE(sql).then((resp)=>{
        resposta = resp;
        if(resp.resposta.length === 0){
            retorno.msg = "Não foram encontradas faturas para este plano";
            retorno.prospecto = "nao";
            retorno.boletos = []
            API(retorno, res, 200, tudo_ok);
        }else{
            log(`APP - ${resp.resposta[0].nome_cli} - ${resp.resposta.length} faturas`);
            retorno.msg = "Confira suas faturas";
            retorno.prospecto = "sim";
        }
    }).catch((erro)=>{
        retorno.dados = erro;
        tudo_ok = false;
        retorno.msg = "Erro ao buscar no Banco de Dados do Integrator";
        retorno.prospecto = "nao";
        API(retorno, res, 200, tudo_ok);
    });

    if(retorno.prospecto === "sim"){

        //Comparar dados do SELECT com dados do Integrator
        for (const [index, fatura] of resposta.resposta.entries()) {
            await ApiIntegrator(formatado, fatura.vencimento, fatura.vencimento).then((resp)=>{
                resp.data.results.map((item, index)=>{
                    if(parseInt(item.dias) > limite_dias){
                        retorno.msg = "Alguns boletos apresentam problemas";
                        retorno.prospecto = "sim";
                        tudo_ok = false;
                        log(`Vencimento:${fatura.vencimento} - Valor:${item.valor_com_juros} - Dias de Atraso:${item.dias}`, "erro");
                    }else if(fatura.codfat == item.codfat){
                        proximo_for = true;
                        let obj = {
                            id: id++,
                            cod_fatura: fatura.codfat,
                            vencimento: fatura.vencimento,
                            cliente: fatura.nome_cli,
                            endereco: `${fatura.endereco} - ${fatura.bairro}`,
                            decricao1: fatura.histo_rec,
                            descricao2: item.descri_cob,
                            percentual_desc: fatura.porcentagem,
                            valor_normal: parseFloat(item.valor),
                            valor_a_pagar: parseFloat(item.valor_com_juros),
                            dias_vencidos: parseInt(item.dias)
                        }
                        modificado.push(obj);
                    }else{
                      log(`Codfat não é igual: API:${item.codfat} - BD:${fatura.codfat}`, "erro");
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

        // PEGAR O CÓDIGO DE BARRAS DOS BOLETOS
        for (const [index, item] of modificado.entries()) {
            await Barra(item.cod_fatura).then((resp)=>{
                item.codBarra = resp
            })
            .catch((erro)=>{
                item.codBarra = ""
                console.log(erro)
            });
        }

        retorno.num_faturas = modificado.length;
        retorno.boletos = modificado;

      if(proximo_for){
          //Pega o link do boleto
          for (const [index, boleto] of retorno.boletos.entries()) {
              tudo_ok = true;

              await linkBoleto(boleto.cod_fatura).then((resp_link)=>{
                  retorno.boletos[index].linkHtml = "http://177.38.178.24/" + resp_link.data.results[0].linkBoleto;
              }).catch((err_link)=>{
                  console.log("Erro Link", err_link);
                  tudo_ok = false;
                  retorno.msg = "Erro ao pegar o link do Boleto";
                  retorno.erro = err_link;
              });

              await abrirHtml(retorno.boletos[index].linkHtml).then((resp_pdf)=>{
                retorno.boletos[index].linkPDF = resp_pdf;      
              }).catch((err_pdf)=>{
                console.log("Erro PDF", err_pdf);
                tudo_ok = false;
                retorno.msg = "Erro ao extrair o link PDF do link HTML";
                retorno.erro = err_pdf;
              });
            }

      }

      API(retorno, res, 200, tudo_ok);
    }
  }

  async pagar(req, res){
    const tipo = req.body.tipo; // 1 (Credito), 2 (Debito) ou 3 (Voucher)
    const forma_pag = req.body.forma_pag; // 1 (A vista), 2 (Parc. vendedor)
    const parcelas = req.body.parcelas // numero de parcelas
    const valor = req.body.valor;
    const cod_venda = req.body.cod_venda; // Código da venda (definido pelo programa)

    const executar_pagamento = `./pagar COM0 ${tipo} ${forma_pag} ${parcelas} ${valor} ${cod_venda}`;

      let retorno = { valor: req.body.valor }
      exec(executar_pagamento, (error, stdout, stderr) => {
          if (error) {
              //console.log(`error: ${error}`);
              //API(retorno, res, 200, true);
          }
          if (stdout) {
            const mod = JSON.stringify(stdout);
            console.log(mod);

            const texto1 = pegar("VENDA\\n\\n", mod);
            const texto2 = pegar("message ", mod);
            const texto3 = pegar("transactionCode ", mod);
            const texto4 = pegar("hostNsu ", mod);
            const texto5 = pegar("cardBrand ", mod);
            const texto6 = pegar("bin ", mod);
            const texto7 = pegar("holder ", mod);
            const texto8 = pegar("user reference ", mod);

            retorno.cod = texto1;
            retorno.message = texto2;
            retorno.transactionCode = texto3;
            retorno.hostNsu = texto4;
            retorno.cardBrand = texto5;
            retorno.bin = texto6;
            retorno.holder = texto7;
            retorno.user_reference = texto8;

            API(retorno, res, 200, true);
          }
      });

  }

	async insert_user(req, res){
		let isSucess = false;
		let retorno = {}
		const sql1 = `SELECT * FROM users WHERE email='${req.body.email}';`;

		await appBD(sql1).then((resp)=>{
			if(resp.resposta.length === 0){
				isSucess = true;
			}else{
				isSucess = false;
				retorno.msg = "Este email já faz parte de um cadastro!";
				retorno.dados = resp;
			}
		}).catch((erro)=>{
			isSucess = false;
			retorno.dados = erro;
			retorno.msg = "Erro ao buscar usuário no Banco de Dados";
			console.log(erro)
		});

		if(isSucess){
			const sql2 = `
      INSERT INTO users 
        (cod_cli, nome, email, senha, doc, celular, codsercli, descriSer, login) 
      values 
        ("${req.body.cod_cli}", "${req.body.nome}", "${req.body.email}", "${req.body.senha}", "${req.body.doc}", "${req.body.cel}", "${req.body.codsercli}", "${req.body.descriSer}", "${req.body.login}");`;
			
        await appBD(sql2).then((resp)=>{
				if(resp.resposta.length === 0){
					isSucess = false;
					retorno.dados = resp;
					retorno.msg = "Erro ao cadastrar usuário!";
				}else{
					isSucess = true;
					retorno.dados = resp;
					retorno.msg = "Usuário cadastrado com sucesso!";
				}
			}).catch((erro)=>{
				retorno.dados = erro;
				isSucess = false;
				retorno.msg = "Erro ao cadastrar usuário no Banco de Dados";
			});
		}

		API(retorno, res, 200, isSucess);
	}

	async login(req, res){
		let isSucess = false;
		let retorno = {};
    let idCli = 0;

    const sql2 = `SELECT * FROM users WHERE email="${req.body.email}" AND senha="${req.body.senha}" OR email="${req.body.email}" AND senha_temp="${req.body.senha}";`;
    await appBD(sql2).then((resp)=>{
      if(resp.resposta.length === 0){
        isSucess = false;
        senha_invalida = true
        retorno.dados = resp;
        retorno.msg = "Usuário não encontrado, login interrompido!";
      }else{
        idCli = resp.resposta[0].id;
        isSucess = true;
        retorno.dados = resp;
        retorno.msg = "Login efetuado com sucesso!";
      }
    }).catch((erro)=>{
      retorno.dados = erro;
      isSucess = false;
      retorno.msg = "Erro ao logar usuário no Banco de Dados";
    });
  
    if(isSucess === true){
      const sql3 = `UPDATE users SET ultimo_acesso=NOW(), token="${req.body.token}" WHERE id="${idCli}";`;
			await appBD(sql3).then((resp)=>{
        console.log("ultimo_acesso e Token Atualizado")
			}).catch((erro)=>{
        console.log("Erro ao atualizar Token")
        console.log(erro)
			});
    }

		API(retorno, res, 200, isSucess);
	}

  async isgetapp(req, res){
		let isSucess = false;
		let retorno = {};

    const sql = `UPDATE users SET ultimo_acesso=NOW() WHERE email="${req.body.email}";`;
    await appBD(sql).then((resp)=>{
      console.log(`${req.body.email} logou no APP`)
      isSucess = true
      retorno.msg = "Sucesso!"
    }).catch((erro)=>{
      isSucess = false;
      retorno.msg = "Erro ao atualizar ultimo_acesso"
      console.log("Erro ao atualizar ultimo_acesso")
      console.log(erro)
    });

		API(retorno, res, 200, isSucess);
	}

  async isBlocked(req, res){
		let isSucess = false;
		let retorno = {};
    let temp = []
    let codClients = req.body.codCli.split(',')

    for (const [index, cod] of codClients.entries()) {
      const sql = `
      SELECT 
        fat.codfat, 
        DATE_FORMAT(fat.data_ven, '%d/%m/%Y') as vencimento, 
        c.nome_cli, 
        cr.histo_rec,
        sc.codest,
        sc.codsercli
      FROM contas_rec cr 
      JOIN servicos_cli sc on sc.codsercli=cr.codsercli 
      JOIN detalhe_faturas df ON df.codcrec = cr.codcrec 
      JOIN faturas fat on fat.codfat= df.codfat 
      JOIN clientes c on c.codcli = cr.codcli 
      LEFT JOIN servicos_pant sp on sp.codser = sc.codser 
      WHERE TRUE 
      AND cr.codcli = '${cod}' 
      AND cr.data_bai is null 
      AND cr.valor_lan-cr.valor_pag>0 
      AND fat.status != 'D' 
      AND c.ativo='S' 
      GROUP by fat.codfat;
      `;
      await INTE(sql).then((resp)=>{
        isSucess = true
        retorno.msg = "Sucesso!"
        resp.resposta.map((item, index)=>{
          let suspenso = false
          if(item.codest === '020IU10JW1'){  // Código do integrator que indica cliente suspenso por falta de pagamento
            suspenso = true
          }
          temp.push({
            nome: item.nome_cli, 
            plano: item.histo_rec, 
            vencimento: item.vencimento, 
            codcli: cod, 
            codsercli: item.codsercli, 
            suspenso: suspenso
          })
        })
      }).catch((erro)=>{
        isSucess = false;
        retorno.msg = "Erro ao buscar os Planos Bloqueados"
        console.log("Erro ao buscar os Planos Bloqueados")
        console.log(erro)
      });
    }

    retorno.dados = temp

		API(retorno, res, 200, isSucess);
	}

  async conection(req, res){
		let isSucess = false;
		let retorno = {};

      // Ultimas conexões
      const sql = `
      SELECT  
        DATE_FORMAT(acctstarttime, '%d/%m/%Y %H:%i') as inicio,
        DATE_FORMAT(acctstoptime,  '%d/%m/%Y %H:%i') as fim,
        ROUND(((acctoutputoctets/1024)/1024), 2) as down,
        ROUND(((acctinputoctets/1024)/1024), 2) as uplo,
        (ROUND(((acctoutputoctets/1024)/1024), 2) + ROUND(((acctinputoctets/1024)/1024), 2)) as total,
        TIMESTAMPDIFF(SECOND, acctstarttime, IFNULL(acctstoptime, NOW())) as segundos
      from radacct r
      WHERE TRUE 
      AND r.username = "${req.body.login}"
      AND r.acctstoptime is null
      OR (r.acctstarttime >= CURDATE() - INTERVAL ${req.body.dias} DAY and r.username = "${req.body.login}")
      ORDER  BY acctstarttime DESC;
      `;
      await RAD(sql).then((resp)=>{
        isSucess = true
        retorno.msg = "Confira seu extrato de conexão"

        let data = []
        let totalDo = 0
        let totalUp = 0

        resp.resposta.map((item, index)=>{
          totalDo = totalDo + item.down
          totalUp = totalUp + item.uplo

          let obj = {
            id: index,  
            inicio: item.inicio,
            fim: item.fim,
            download: item.down < 1000 ? `${item.down.toFixed(2)}MB` : `${(item.down / 1024).toFixed(2)}GB`,
            upload: item.uplo < 1000 ? `${item.uplo.toFixed(2)}MB` : `${(item.uplo / 1024).toFixed(2)}GB`,
            total: item.total < 1000 ? `${item.total.toFixed(2)}MB` : `${(item.total / 1024).toFixed(2)}GB`,
            tempo: sformat(item.segundos)
          }
          data.push(obj)
        })
        retorno.dados = data
        retorno.totalDo = totalDo < 1000 ? `${totalDo.toFixed(2)}MB` : `${(totalDo / 1024).toFixed(2)}GB`
        retorno.totalUp = totalUp < 1000 ? `${totalUp.toFixed(2)}MB` : `${(totalUp / 1024).toFixed(2)}GB`

      }).catch((erro)=>{
        isSucess = false;
        retorno.msg = "Erro ao buscar o extrato de conexão"
        console.log("Erro ao buscar o extrato de conexão")
        console.log(erro)
      });

		API(retorno, res, 200, isSucess);
	}

  async esqueci_senha(req, res){
		let isSucess = false;
    let retorno = {}
    let senha_provisoria = `micks${geraStringAleatoria(6)}`
    let email_enviado = false

    let corpo = `Bem-vindo a redefinição de senha do MicksApp. Sua senha temporária é:
    
${senha_provisoria}

Recomendamos alterar essa senha assim que entrar no APP. Caso não tenha feito essa solicitação, pode usar sua senha antiga normalmente.

Att,
MICKS TELECOM`;

    await email_env(req.body.email, "Redefinição de senha do MicksApp", corpo)
    .then((resp) => {
      console.log(resp);
      isSucess = true
      email_enviado = true
      retorno.msg = `Senha temporária enviada para o email: ${req.body.email}. Pode demorar até 10 minutos para o email ser recebido.`
    })
    .catch((err) => { 
      console.error(err);
      retorno.msg = `Erro ao enviar para o email: ${req.body.email}.`
    });

    if(email_enviado === true){
      const sql2 = `UPDATE users SET senha_temp='${senha_provisoria}' WHERE email="${req.body.email}";`;
      await appBD(sql2).then((resp)=>{
        isSucess = true
        retorno.msg1 = "Senha temporária salva!"
      }).catch((erro)=>{
        isSucess = false;
        retorno.msg1 = "Erro ao salvar senha!"
      });
    }

		API(retorno, res, 200, isSucess);
	}

  async modify_password(req, res){
		let isSucess = false;
		let retorno = {};

    const sql = `UPDATE users SET senha="${req.body.senha}" WHERE email="${req.body.email}";`;
    await appBD(sql).then((resp)=>{
      console.log(`Senha modificada de ${req.body.email}`)
      isSucess = true
      retorno.msg = "Senha modificada com sucesso!"
    }).catch((erro)=>{
      isSucess = false;
      retorno.msg = "Erro ao mudar a senha"
      console.log("Erro ao mudar a senha")
      console.log(erro)
    });

		API(retorno, res, 200, isSucess);
	}

  async evaluation(req, res){
		let isSucess = false;
		let retorno = {};

    const sql = `UPDATE users SET nota="${req.body.nota}" WHERE email="${req.body.email}";`;
    await appBD(sql).then((resp)=>{
      console.log(`Nota salva ${req.body.email}`)
      isSucess = true
      retorno.msg = "Nota salva com sucesso!"
    }).catch((erro)=>{
      isSucess = false;
      retorno.msg = "Erro ao salvar a nota"
      console.log("Erro ao salvar a nota")
      console.log(erro)
    });

		API(retorno, res, 200, isSucess);
	}

}
module.exports = new buscarCliente();