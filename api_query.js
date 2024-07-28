const { values } = require('pdf-lib');
const {client_db} = require('./config_PG.js');

const comands = {
    add_conv_in_db : {
        func : async (oo)=>{
            const { uid, id_conv, token} =  oo;
            const query = {
                text: 'insert into lista_conversatii (uid, id_conv, token) values ($1, $2, $3);',
                values : [uid, id_conv, token],
            };
            return await client_db.query(query);
        },
        require_params : ['uid', 'id_conv', 'token']
    },
    add_mess_in_db : {
        func : async (oo)=>{
            const { ar } =  oo;
            const query = {
                text: `
                INSERT INTO lista_mesaje (mesaj, tip_mesaj, uid, id_conversatie, token)
                SELECT (json_data->>'mesaj')::text, (json_data->>'tip_mesaj')::text, (json_data->>'uid')::text,
                (json_data->>'id_conversatie')::text,  (json_data->>'token')::text
                FROM json_array_elements($1::json) AS json_data
                `,
                values : [JSON.stringify(ar)],
            };
            return await client_db.query(query);
        },
        require_params : ['ar']
    },
    getMessFromId_conv : {
        func : async (oo)=>{
            const {id_conversatie, uid, token} = oo;
            const query =  {
                text : 'select mesaj , tip_mesaj from lista_mesaje where id_conversatie = $1 and uid = $2 and token = $3 order by id ',
                values : [id_conversatie, uid, token],
            }
            return await client_db.query(query);
        }, 
        require_params: ['id_conversatie', 'uid', 'token']
    },
    getAllConversations:{
        func : async (oo)=>{
            const {uid} = oo;
            const query= {
                text: `
                    with min_ids as (
                    select min(l1.id) as min_id from lista_mesaje l1 
                    where l1.tip_mesaj = 'raspuns' and l1.uid = $1 
                    group by l1.id_conversatie
                    )
                    select l1.min_id, l2.mesaj, l2.id_conversatie, l2.token from min_ids l1 join (select id, mesaj, id_conversatie, token from lista_mesaje) l2 on l1.min_id = l2.id

                `,
                values: [uid]
            }
            return client_db.query(query);
        },
        require_params: ['uid'],
    },
    deleteChat:{
        func : async (oo) =>{
            const { uid, id_conversatie} = oo;
            const query = {
                text : `
                `,
                values : [uid, id_conversatie],
            }
            return client_db.query(query);
        },
        require_params: ['uid', 'id_conversatie'],
    }
    
}

function check_required_params(paramsIn, paramsReq){
    let rez ;
    const keys= Object.keys(paramsIn);
    const missing_req_params = paramsReq?.filter((req_pa)=> !keys.includes(req_pa));
    if(missing_req_params?.length){
        rez = {status: false, params: missing_req_params}
    }else{
        rez = {status: true}
    }
    return rez;
}

async function exec_comands(comand_name, params={}){

    const rez_req_param = check_required_params(params, comands[comand_name].require_params);

    if(!rez_req_param.status)return {type: false, err: `missing params ${params}`};

    try{
        let rez =  await comands[comand_name].func(params);
        return {type: true, data: rez.rows};
    }catch(err){
        console.log(err);
        return {type: false, err: err};
        

    }
}
// exec_comands('get_mess', {uid:'uid', id_conversatie: 'id_conversatie'})

module.exports = {exec_comands};