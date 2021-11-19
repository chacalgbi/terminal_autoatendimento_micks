              // Talvez essa parte não vai usar se consegui pegar os valores no boleto.
              if(parseInt(item.dias) <= 0 ){ // Se a fatura estiver em dia concede o desconto caso exista.
                if(fatura.porcentagem != null){ // Se existir desconto
                  let porcent = parseFloat(fatura.porcentagem).toFixed(2);
                  let valor = parseFloat(item.valor);
                  let valor_final = valor - ((valor*porcent)/100).toFixed(2);
                  obj.valor_a_pagar = valor_final.toFixed(2);
                  obj.desconto = ((valor*porcent)/100).toFixed(2);
                }else{
                  obj.valor_a_pagar = parseFloat(item.valor_com_juros).toFixed(2);
                  obj.desconto = "0";
                }
              }else{
                obj.valor_a_pagar = parseFloat(item.valor_com_juros).toFixed(2);
                obj.desconto = "0";
              }
              // Talvez essa parte não vai usar se consegui pegar os valores no boleto.












            if (err){
              console.log(err);
              pdf_lido.erro = "sim";
              //reject(pdf_lido);
            }
            else{
              if(item != undefined){
                if(item.text){
                    count ++;
                    console.log(count, " * ", item.text);
                    if(item.text.match(/DESCONTO DE /)){
                        console.log(count, " - ", item.text);
                        let array = item.text.split(' ');
                        let desconto = array[2].replace('R$', '');
                        //console.log(desconto);
                        pdf_lido.desconto= desconto;
                        //resolve(pdf_lido);
                    }else{
                        pdf_lido.desconto= "sem_desconto";
                    }
                }
              }
            }