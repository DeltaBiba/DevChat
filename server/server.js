const express = require("express");
const { pool } = require("./database");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors())


const createUsersTable = async () => {
  try{
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
          user_id SERIAL PRIMARY KEY,
          username VARCHAR(50) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL
      )
    `)
  } catch (error) {
    console.error("Error creating users table:", error);
  }
}

createUsersTable();


app.post("/api/register", async (req, res) => {
  try{
    const {username, password} = req.body;
    
    if(!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    
    const userCheck = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  
    if(userCheck.rows.length > 0){
      return res.status(200).json({ error: "User already exists" });
    }
    
    const newUser = await User.create(username, password);
    
    const token = jwt.sign(
      {user_id: newUser.user_id, username },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    
    
    res.status(200).json({
      message: "User created successfully",
      user: {
        id: newUser.user_id,
        username: newUser.rows[0].username,
      },
      token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
})


app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
