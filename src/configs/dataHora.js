module.exports = function data_hora(){
    var data = new Date();
    var dia     = data.getDate();           // 1-31
    var dia_sem = data.getDay();            // 0-6 (zero=domingo)
    var mes     = data.getMonth();          // 0-11 (zero=janeiro)
    var ano4    = data.getFullYear();       // 4 dígitos
    var hora    = data.getHours();          // 0-23
    var min     = data.getMinutes();        // 0-59
    var seg     = data.getSeconds();        // 0-59
    var mseg    = data.getMilliseconds();   // 0-999
    var tz      = data.getTimezoneOffset(); // em minutos

    let semana = '';
    if(dia_sem == 0){semana = 'Dom'}    
    if(dia_sem == 1){semana = 'Seg'}    
    if(dia_sem == 2){semana = 'Ter'}    
    if(dia_sem == 3){semana = 'Qua'}    
    if(dia_sem == 4){semana = 'Qui'}    
    if(dia_sem == 5){semana = 'Sex'}    
    if(dia_sem == 6){semana = 'Sab'}    

    var str_data = dia + '/' + (mes+1) + '/' + ano4;
    var str_hora = hora + ':' + min + ':' + seg+'.'+mseg+'ms - ';
    var data_hora = semana + ' ' + str_data + ' ' + str_hora;
    return data_hora;
}