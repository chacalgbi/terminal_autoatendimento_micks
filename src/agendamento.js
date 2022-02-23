const nodeSchedule = require('node-schedule');
const notify = require('./notify')

const token = 'cjKTqeXCSNS7_75YML_8Or:APA91bGUX2MW13FTcpISqtR4evlGeX3txVXczS0qohQjGX8VCW9YORrjrQKyJxUxifonNtSCsWXbaifJptYiVsga9bEj-qr9yTKyAenKzUR2ylQx1wfAcrnwqLU_dfqO0zBm1C3UKNNu'
const micksapp = 'dMeCY6jwTC-Ujw52xZ4WV6:APA91bGKJvslitu4yoVt_IOZ5Kfqjr8DwWeroyvwdjtctikowKk9mGdyJYK6Om9X4F531WIgY0pLQUJ56DC6-SEKMHHJbXGNxz3GxfuBRb1OdETcD8b58dZJmFk9nMGm4RBK4iMYt1xV'
const tokens = [
    "cjKTqeXCSNS7_75YML_8Or:APA91bGUX2MW13FTcpISqtR4evlGeX3txVXczS0qohQjGX8VCW9YORrjrQKyJxUxifonNtSCsWXbaifJptYiVsga9bEj-qr9yTKyAenKzUR2ylQx1wfAcrnwqLU_dfqO0zBm1C3UKNNu",
    "fPsrHBTQQLe8KQ4cIck-Jy:APA91bEZkkQtoo1CpTdrcAGKyZKyyAizhHwlX9D0llwYjW0LZRBspqT2yy3Vm9tjA1pbxW4Ld6UQjqCAnrOpbz6RE10BUXUy2XRq0jLqwOzzZVB_Z0Yc4PN56RBwnZGANITYYyGwUV9O",
    "fil5kIbrTju2sawbCqrpdj:APA91bENtPXG1jCm8TjH6-Wk_NUPgQ94O43fb7pd_mv2uenzkCmiNKFE2fju3_hkhBlts7yykS0cMJOpP_kuSZI7Ht4CFA9NF585IbDwzMMxgzsun9xsQND_LxM4-dXvu3A1Vtx1kNva",
    "dE-T3uMxQd2tYDBWtLGyQO:APA91bEGz5uStBAyCSWmpYJXqzPG_1wNJK6_WW_CiLueqMECCwK7tdaneInI0a4SV4wbth9GI-gXhGJi1H_Wf7tnOor6RDliVbh0N3ic83ZlfuFio2Ip_NoXDgYEgMO6yh2e4VyT_S2N"
];

// Criar os agendamentos neste site http://www.cronmaker.com/?1   
const cron1 = '*/1 * * * *';                         // Executa a cada 1 minuto 
const cron2 = '0 0 9 ? * MON,TUE,WED,THU,FRI,SAT *'  // Segunda a sábado as 08:00

module.exports = nodeSchedule.scheduleJob(cron1, () => {
    notify(micksapp, "Micks Informa", "Promoção de carnaval é na Micks Telecom")
});