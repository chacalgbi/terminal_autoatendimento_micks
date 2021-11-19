module.exports = function tempo(tempo){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{ 
            resolve(`Tempo: ${tempo}ms`);
        }, tempo);
    });
}