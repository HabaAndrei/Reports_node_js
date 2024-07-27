const {client_db} = require('./config_PG.js');

const comands = {
    add_mess : {
        func : async (oo)=>{
            const {mesaj, tip_mesaj, uid, id_conversatie} = oo; 
            const query = {
                text : 'insert into lista_mesaje (mesaj, tip_mesaj, uid, id_conversatie) values ($1, $2, $3, $4);',
                values: [mesaj, tip_mesaj, uid, id_conversatie]
            }
            return await client_db.query(query);
        },
        require_params : ['mesaj', 'tip_mesaj', 'uid', 'id_conversatie']
    },
    get_mess : {
        func : async (oo)=>{
            const {uid, id_conversatie} = oo;
            const query = {
                text : 'select mesaj, tip_mesaj from lista_mesaje where uid = $1 and id_conversatie = $2 order by id;',
                values: [uid, id_conversatie]
            
            }
            return await client_db.query(query);
        }, 
        require_params : ['uid', 'id_conversatie'],
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
        console.log(rez.rows, 'perfect');
        return {type: true, data: rez.rows};
    }catch(err){
        console.log(err);
        return {type: false, err: err};
        

    }
}
exec_comands('get_mess', {uid:'uid', id_conversatie: 'id_conversatie'})