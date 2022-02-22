const mysql = require('mysql');

// Conecta no BD da Micks
module.exports = mysql.createPool({
  host: process.env.radius_HOST,
  user: process.env.radius_USER,
  password: process.env.radius_PASS,
  database: process.env.radius_NAME
  });