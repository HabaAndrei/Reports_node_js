require('dotenv').config();
const { Client } = require("pg");

const {HOST, USER_PG, PORT, PASSWORD, DATABASE} = process.env;

const client = new Client({
  host:HOST, user:USER_PG, port:PORT, password:PASSWORD, database:DATABASE
});

client.connect();
const client_db = client;

module.exports = {client_db};