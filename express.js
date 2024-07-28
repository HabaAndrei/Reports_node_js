const express = require('express');
const cors = require('cors');
const {exec_comands} = require('./api_query.js');
const { client_db } = require('./config_PG.js');

const app = express();
app.use(cors());
app.use(express.json());


app.post('/add_conv_in_db', async (req, res)=>{
    const {uid, id_conv, token} = req.body;

    try{
        let rez = await exec_comands('add_conv_in_db', {uid, id_conv, token});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }

})

app.post('/add_mess_in_db', async (req, res)=>{
    const {obQuesAndAnsw} = req.body;
    const ar = [obQuesAndAnsw.question, obQuesAndAnsw.answer];

    try{
        let rez = await exec_comands('add_mess_in_db', {ar});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }
})

app.post('/getMessFromId_conv', async (req, res)=>{
    const {id_conversatie, uid, token} = req.body;

    try{
        let rez = await exec_comands('getMessFromId_conv', {id_conversatie, uid, token});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }
})

app.post('/getAllConversations', async (req, res)=>{
    const {uid} = req.body;
    try{
        let rez = await exec_comands('getAllConversations', {uid});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }
})

const PORT = 5500;
app.listen(PORT, ()=>{
    console.log('we are listening on port ', PORT);
})