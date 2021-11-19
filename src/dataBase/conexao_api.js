const mysql = require('mysql');

// Conecta no BD da Micks
module.exports = mysql.createConnection({
  host: process.env.DBM_HOST,
  user: process.env.DBM_USER,
  password: process.env.DBM_PASS,
  database: process.env.DBM_NAME
  });