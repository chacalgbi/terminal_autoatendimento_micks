const mysql = require('mysql');


// Conecta no BD do Integrator
module.exports = mysql.createPool({
  host: process.env.DBI_HOST,
  user: process.env.DBI_USER,
  password: process.env.DBI_PASS,
  database: process.env.DBI_NAME
  });