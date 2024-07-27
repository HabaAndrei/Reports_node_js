const fs = require('fs');
const {arPdfPage} = require('./variable');


function writeVariable(numeFisier, numeVariabila, cotinutVariabila){

    const arrayToWrite = ` \n const ${numeVariabila} = ${JSON.stringify(cotinutVariabila, null, 2)};`;
    fs.appendFileSync(`${numeFisier}`, arrayToWrite);
}


function createFuzzySearchVariable(){
    const arTokens = fs.readFileSync('./token.txt', "utf8").replace(/\r/g, '').split('\n');

    let arFuzzy = [];
    for(let token of arTokens){
        let ob = arPdfPage.find((ob)=>ob.token == token)
        arFuzzy.push(ob.nume, ob.token);
    }

    writeVariable("./variable.js", "arForFuzzySearch", arFuzzy)
}

function variableNameToken(){
    let arObNameToken = [];
    arPdfPage.forEach((ob)=>{
        arObNameToken.push({nume: ob.nume, token: ob.token});
    })
    writeVariable("./variable.js", "arObNameToken", arObNameToken);
}
variableNameToken()
module.exports={writeVariable};