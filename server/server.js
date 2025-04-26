const express = require("express");
const { pool } = require("./database");
require("dotenv").config();


// Middleware to parse JSON requests

const app = express();

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
