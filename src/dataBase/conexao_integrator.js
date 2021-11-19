const mysql = require('mysql');


// Conecta no BD da Micks
module.exports = mysql.createConnection({
  host: process.env.DBI_HOST,
  user: process.env.DBI_USER,
  password: process.env.DBI_PASS,
  database: process.env.DBI_NAME
  });