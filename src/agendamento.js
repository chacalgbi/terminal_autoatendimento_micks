const nodeSchedule = require('node-schedule');
const notify = require('./notify')

const tokens = [
    'dMeCY6jwTC-Ujw52xZ4WV6:APA91bGKJvslitu4yoVt_IOZ5Kfqjr8DwWeroyvwdjtctikowKk9mGdyJYK6Om9X4F531WIgY0pLQUJ56DC6-SEKMHHJbXGNxz3GxfuBRb1OdETcD8b58dZJmFk9nMGm4RBK4iMYt1xV',
    'eDPIHff3Ry6H_MCL_McIGs:APA91bFr8km46qcb11cKPe_3PPeTiKxlQt1HMio6htNnDKfzWUTkbV3lkfuAILXx4Qad_xKzLSmZGo0qv8qUoTpqbhj0UGgtWDCAKvYzhJ6fBq_h5hi4xe-LPjubT_1Cuh-fGJO5U1r5'
];

// Criar os agendamentos neste site http://www.cronmaker.com/?1   
const cron1 = '*/1 * * * *';                         // Executa a cada 1 minuto 
const cron2 = '0 0 9 ? * MON,TUE,WED,THU,FRI,SAT *'  // Segunda a sábado as 08:00

module.exports = nodeSchedule.scheduleJob(cron2, () => {
    notify(tokens, "Micks Informa", "Promoção de carnaval é na Micks Telecom")
});