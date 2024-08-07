if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
  
  const express = require("express");
  const app = express();
  const cors = require("cors");
  // const port = process.env.PORT || 3000
  const router = require("./routers");
  
  
  //CORS
  app.use(cors());
  
  // Body Parser
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  //Router
  app.use(router);
  
  
  // app.listen(port, () => {
  //   console.log(`Example app listening on port ${port}`);
  // });
  
  module.exports = app;