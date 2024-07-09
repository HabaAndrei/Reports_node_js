const fs = require('fs');
const {arPdfPage} = require('./variable');


function writeVariable(numeFisier, numeVariabila, cotinutVariabila){

    const arrayToWrite = ` \n const ${numeVariabila} = ${JSON.stringify(cotinutVariabila, null, 2)};`;
    fs.appendFileSync(`${numeFisier}`, arrayToWrite);
}


function returnArrayForFuzzySearch(){
    let arFinal = [];
    for(let ob of arPdfPage){
        arFinal.push(ob.nume, ob.token);
    }
    writeVariable('./variable.js', 'arForFuzzySearch', arFinal);
}
returnArrayForFuzzySearch()



module.exports={writeVariable};