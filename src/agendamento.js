// Criar os agendamentos neste site http://www.cronmaker.com/?1   
const cron1 = '*/1 * * * *';                         // Executa a cada 1 minuto
const cron2 = '0 30 6 1/1 * ? *'  // Executa todo dia as 09:30 ( O nodeJS está no UTC grewitch, 06:30 é 09:30)
const nodeSchedule = require('node-schedule');
const notify = require('./notify')
const appBD = require('./app/appBD');
const INTE  = require('./configs/integrator');
const data = require('../dataDay')
let listUsers
const sql1 = `SELECT * FROM users`;
const dias = 18
const regra = { hour: 20, minute: 00 }

async function usersApp(){
    console.clear()
    await appBD(sql1).then((resp)=>{
      listUsers = resp.resposta
      //console.log(listUsers)
    }).catch((erro)=>{
        console.error("Erro BD App",erro)
    });

    if(listUsers.length >= 1){
        for (const [index1, user] of listUsers.entries()) { // Percorre a lista de clientes do APP
            const codClis = user.cod_cli.split(',')
            for (const [index2, codCli] of codClis.entries()) { // Percorre os codCli caso haja mais de um
                const sql2 = `SELECT c.nome_cli, s.descri_ser, fat.data_ven FROM contas_rec cr JOIN servicos_cli sc on sc.codsercli=cr.codsercli JOIN servicos s on s.codser = sc.codser JOIN detalhe_faturas df ON df.codcrec = cr.codcrec JOIN faturas fat on fat.codfat= df.codfat JOIN clientes c on c.codcli = cr.codcli LEFT JOIN servicos_pant sp on sp.codser = sc.codser WHERE TRUE AND cr.codcli = '${codCli}' AND cr.data_bai is null AND cr.valor_lan-cr.valor_pag>0 AND fat.status != 'D' AND c.ativo='S' GROUP by fat.codfat ORDER BY data_ven;`;
                await INTE(sql2).then((resp)=>{ // Busca no integrator por boletos de cada codCli
                    if(resp.resposta.length > 0){ // Se tiver algum boleto entra no IF
                        for (const [index3, vencimento] of resp.resposta.entries()) { // Percorre cada boleto e compara as datas
                            
                            let amanha = data.dataDayFormat(dias).tomorrow1
                            let temp = vencimento.data_ven.split('T')
                            let venc = `${temp[0]} 00:00:00`
                            let descricao = vencimento.descri_ser.trim()

                            if(amanha === venc){ // Se amanhã for igual a data de vencimento, envia aviso.
                                console.table({Ama: amanha, Ven: venc, Pla: descricao})
                                notify(user.token, "Micks Informa", `Você tem um boleto que vence amanhã do plano ${descricao}. Caso o pagamento tenha sido efetuado, desconsidere esta mensagem.`)
                            }
                        }
                    }
                }).catch((erro)=>{ console.error("Erro BD Integrator",erro) });
            }
        }
    }

}

const job = nodeSchedule.scheduleJob(regra, (fireDate) => {
    usersApp()
    console.log(fireDate)
});

module.exports = {job}