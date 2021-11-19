var request = require('request');

module.exports = function abrir_html(linkHtml){
    return new Promise(function(resolve, reject){
        request({uri: linkHtml}, function(err, res, body){
            if (!err && res.statusCode == 200) {
                const info = body.replace(/(\r\n|\n|\r)/gm, "");
                const inicio = info.indexOf("href='") + 6;
                const fim = info.indexOf("'</script>");
                const link_boleto = info.substring(inicio, fim);
                //console.log(link_boleto);
                resolve(link_boleto);
            }else{
                reject(err);
            }
        });
    })
}