function sformat(s) {
    var fm = [
          Math.floor(s / 60 / 60 / 24), // dias
          Math.floor(s / 60 / 60) % 24, // horas
          Math.floor(s / 60) % 60, // minutos
          s % 60 // segundos
    ];
    return `${fm[0]}d ${fm[1]}h:${fm[2]}m:${fm[3]}s`
}

console.log(sformat(1227702))