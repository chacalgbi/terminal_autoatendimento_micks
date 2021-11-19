const express = require("express");
const routes = require('./routes');
const cors = require('cors');

const app = express();

class App{
  constructor(){
      this.app = express();
      this.middlewares();
      this.routes();
  }
  middlewares(){
    this.app.use(express.json());
    this.app.use(cors());
  }
  routes(){
      this.app.use(routes);
  }
}

module.exports = new App().app;