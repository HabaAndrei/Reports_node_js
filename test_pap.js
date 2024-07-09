const  puppeteer = require('puppeteer');
const download = require('download');
const fs = require('fs');
const pdfParse = require('pdf-parse');
require('dotenv').config()
const axios = require('axios');
const { PDFDocument } = require('pdf-lib');
const {writeVariable} = require('./diverse.js');
const {arPageCompany} = require('./variable.js');

const {ADDRESS_FLASK_SERVER} = process.env;


// -----------------------------------------------------------
async function mainFunction(){
    try{
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        
        await page.goto('https://bvb.ro/FinancialInstruments/Markets/Shares', {waitUntil : 'domcontentloaded'});

        await page.setViewport({width: 1200, height: 850});
        
        const ar_links = await returnArrayWithLinks(page)
        writeVariable('./variable.js', 'arPageCompany', ar_links);

        console.log(ar_links.length);
        // let arCuPdfRap = [];
        // for(let  i = 0 ; i<ar_links.length; i++){
        //     let ob = ar_links[i];
        //     const rap_page = await raportPage(ob.href);
        //     const {nume, token} = ob;
        //     console.log(i, nume, token, rap_page, '=<<<<<<<<<<<<<<,!!!!!!!!!!!!!!!!!!!!')
        //     arCuPdfRap.push(rap_page);
        //     // if(rap_page){
        //     //     await sendRequest(nume, token, rap_page);
        //     // }
        //     break;
        // }
        // fs.writeFileSync('./ok', JSON.stringify(ar_links));

   
    }catch(err){
        console.log('am avut o eroare dar e ok', err)
    }
}
// mainFunction();


//-----------------------------------------------------------------

async function sendRequest(nume, token, href){

    return new Promise(async (resolve, reject)=>{
        await axios.post(`${ADDRESS_FLASK_SERVER}/insert_rap`, {nume, token, href}).then((data)=>{
            console.log(data.data);
            resolve('');
        }).catch((err)=>{
            reject(err);
        })
    })
}



//----------------------------------------------------------------
async function returnBigPdf(arLinks){
    return new Promise(async (resolve, reject)=>{
        let obCuPag = {}
        let arCuNr = [];
        try{
            for(let a of arLinks){
                
                if(a.includes('EN.pdf') || a.includes('en.zip') || a.includes('.zip'))continue;
                const nrPag = await  numberOfPages(a);
                obCuPag[nrPag] = a;
                arCuNr.push(nrPag);
            }
            arCuNr.sort((a, b )=> b-a);
            resolve(obCuPag[arCuNr[0]])

            resolve('');

        }catch(err){
            reject(err);
        }

    })
}




//----------------------------------------------------------------


async function raportPage(link){
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(link, {waitUntil : 'domcontentloaded'});
    await page.setViewport({width: 1200, height: 850});


    
    await page.evaluate(async ()=>{
        //div cu inputuri (butoane)  
        let elem = document.querySelector("#ctl00_body_IFTC_btnlist");
        //apas pe inputul cu inf financiare
        let inputs = elem.querySelectorAll('input');
        await inputs[4].click();        
    })
    


    // tabelul cu rapoarte 
    await page.waitForSelector('#gvRepDoc');
    const arElemA = await page.evaluate(async ()=>{
        const tabel = document.querySelectorAll('#gvRepDoc tbody tr');
        const arrayTr = Array.from(tabel);
        let hrefs = [];
        for(let tr of arrayTr){
            const tds = tr.querySelectorAll('td');
            const titlu = tds[1]?.innerText;
            if(titlu === 'Raport anual 2023' ){
                const tag = tds[2];
                const miniTabel = tag.querySelectorAll('a');
                miniTabel.forEach(a => {
                    hrefs.push(a.href);
                });
            }
        }
        //
        //
        return hrefs;
    })
    const href_anual_raport = await returnBigPdf(arElemA);

    await browser.close();

    if(href_anual_raport){
        return href_anual_raport
    }else{
        return false;
    }

}

// console.log(raportPage('https://bvb.ro/FinancialInstruments/Details/FinancialInstrumentsDetails.aspx?s=TLV'))


//----------------------------------------------------------------
async function returnArrayWithLinks(page){
    
    let allLinksWithTokens = [];
    return new Promise((resolve, reject)=>{
        async function recursivitate(){
            try{
                const rows = await page?.evaluate(_ =>{ 
                    let elem  = document.querySelectorAll('#gv > tbody  tr');
                    let arElem = Array.from(elem);
                    return arElem.map((row)=>{
                        const token = row.querySelector('td span a b')?.innerText
                        const nume = row.querySelectorAll('td')[1]?.innerText;
                        const href = row.querySelector('td span a').href;
                        // console.log({href, token, nume})
                        return {href, token, nume}
                    })
                });
                // console.log(rows.length, '<<<= rows')
                // allLinksWithTokens.concat(rows);
                const arUnice = arrayCuObUnice([...allLinksWithTokens, ...rows])
                allLinksWithTokens = [...arUnice];
                if (allLinksWithTokens.length >= 86) {
                    // console.log('a intrat aici si ce se intampla ??????/', allLinksWithTokens.length)
                    resolve(allLinksWithTokens);
                    
                }else{
    
                    await page.click("#gv_next"); 
                    // console.log(allLinksWithTokens.length, '=<<<< a intrat la recursivitate!!')   
                    await recursivitate();
                }
            }catch(err){
                reject(err);
            }
        }
        recursivitate();
    })
}


// --------------------------------------------------------------

async function numberOfPages(linkPDF){

    try{
        const lastIndexOfBar = linkPDF.split('').reverse().indexOf('/');
        const numeFisier = linkPDF.slice(-`${lastIndexOfBar}`);



        const numarPag = await download(linkPDF, './pdf_documents', numeFisier).then(async ()=>{
            const pdfBytes = fs.readFileSync(`./pdf_documents/${numeFisier}`);
            const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
            const numberOfPages = pdfDoc.getPageCount();

            fs.unlinkSync(`./pdf_documents/${numeFisier}`);
            return numberOfPages;
        })
        // console.log(numarPag);
        return numarPag;
    }catch(err){
        console.log(err, 'eroare la numberOfPages');
    }
}

// console.log(numberOfPages('https://bvb.ro/infocont/infocont24/RMAH_20240425161858_RMAH-Raport-anual-2023-25-04-2024---RO.pdf'))
// --------------------------------------------------------------


function arrayCuObUnice(arCuObiecte){
    let obCuValTest = {};
    arCuObiecte.forEach((ob)=>{
        obCuValTest[JSON.stringify(ob)] = ob;
    })
    return (Object.values(obCuValTest))

}

//------------------------------------------------
async function recreateOb(array){
    let arrayNou = [];

    try{
        for(let i = 0 ; i<array.length; i++){
            try{
                let obNou  = {};
                let ob  = array[i];
                let hrefNou = await raportPage(ob.href);
                obNou = {...ob, href : hrefNou};
                arrayNou.push(obNou);
                console.log(i)
            }catch(err){
                console.log('a intrat in asta mica');
                continue;
            }
        }
    }catch(err){
        console.log('mergem mai departe ')
    }
    writeVariable('./variable.js', 'arPdfPage', arrayNou);

}
recreateOb(arPageCompany)


module.exports = {raportPage};