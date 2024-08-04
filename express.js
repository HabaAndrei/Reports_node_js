const express = require('express');
const cors = require('cors');
const {exec_comands} = require('./api_query.js');
const { client_db } = require('./config_PG.js');
const admin = require('firebase-admin');
const {ob_firebase} = require('./ob_firebase.js');
const app = express();
app.use(cors());
app.use(express.json());

const config = {
    credential: admin.credential.cert(ob_firebase),
};

admin.initializeApp(config);



async function verify_id_token(user_token){
    try{
        let rez = await admin.auth().verifyIdToken(user_token);
        let uid = rez.uid;
        if(uid){
            return {type: true, uid}
        }else{  return {type: false} };
    }catch(err){
        return {type: false, err};
    }
}

async function test_middleware(req, res, next){
    const {uid, user_token} = req.body;
    let rez_token = await verify_id_token(user_token)
    if(rez_token.type && rez_token.uid === uid){
        next();
    }else{
        res.status(401).send('Unauthorized');
    }
}


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



app.post('/getAllConversations', test_middleware,  async (req, res)=>{

    const {uid, user_token} = req.body;
    try{
        let rez = await exec_comands('getAllConversations', {uid});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }
})


app.post('/deleteChat', async  (req, res)=>{
    const {uid, id_conversatie} = req.body;
    try{
        let rez = await exec_comands('deleteChat', {uid, id_conversatie});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }

})

app.post('/manage_question_FU', async (req, res)=>{
    const {ip} = req.body;
    try{
        let rez = await exec_comands('manage_question_FU', {ip});
        res.send(rez);
    }catch(err){
        res.send({type: false, err: err});
    }
})

const PORT = 5500;
app.listen(PORT, ()=>{
    console.log('we are listening on port ', PORT);
})