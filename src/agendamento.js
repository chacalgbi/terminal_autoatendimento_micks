// Criar os agendamentos neste site http://www.cronmaker.com/?1   
const cron1 = '*/1 * * * *';                         // Executa a cada 1 minuto 
const cron2 = '0 0 9 ? * MON,TUE,WED,THU,FRI,SAT *'  // Executa de Segunda a sábado as 08:00
const nodeSchedule = require('node-schedule');
const notify = require('./notify')
const appBD = require('./app/appBD');
const INTE  = require('./configs/integrator');
const data = require('../dataDay')
let listUsers
const sql1 = `SELECT * FROM users`;



async function usersApp(){
    await appBD(sql1).then((resp)=>{
      listUsers = resp.resposta
      //console.log(listUsers)
    }).catch((erro)=>{
        console.error("Erro BD App",erro)
    });

    if(listUsers.length >= 1){
        for (const [index1, user] of listUsers.entries()) {
            const codClis = user.cod_cli.split(',')
            for (const [index2, codCli] of codClis.entries()) {
                const sql2 = `SELECT  c.nome_cli, fat.data_ven FROM contas_rec cr JOIN servicos_cli sc on sc.codsercli=cr.codsercli JOIN detalhe_faturas df ON df.codcrec = cr.codcrec JOIN faturas fat on fat.codfat= df.codfat JOIN clientes c on c.codcli = cr.codcli LEFT JOIN servicos_pant sp on sp.codser = sc.codser WHERE TRUE AND cr.codcli = '${codCli}' AND cr.data_bai is null AND cr.valor_lan-cr.valor_pag>0 AND fat.status != 'D' AND c.ativo='S' GROUP by fat.codfat ORDER BY data_ven;`;
                await INTE(sql2).then((resp)=>{
                    if(resp.resposta.length > 0){
                        for (const [index3, vencimento] of resp.resposta.entries()) {
                            let amanha = data.dataDayFormat().tomorrow1
                            let temp = vencimento.data_ven.split('T')
                            let venc = `${temp[0]}  00:00:00`
                            console.log("Amanhã:",amanha, "Vencimento:", venc)
                            if(amanha == venc){
                                console.log("Enviando Aviso de vencimento. Amanhã:",amanha,"Vencimento:", venc)
                                notify(user.token, "Micks Informa", "Sua fatura vence amanhã")
                            }
                        }
                    }
                }).catch((erro)=>{
                    console.error("Erro BD Integrator",erro)
                });
            }
        }
    }

}

module.exports = nodeSchedule.scheduleJob(cron1, () => {

    usersApp()

});