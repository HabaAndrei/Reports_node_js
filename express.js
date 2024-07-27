const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors());

const PORT = 5500;
app.listen(PORT, ()=>{
    console.log('we are listening on port ', PORT);
})