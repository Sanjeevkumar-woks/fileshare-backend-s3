const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();

//Middelware for auth
module.exports = function auth(req, res, next) {
  try {
    const token = req.header("x-auth-token");
    jwt.verify(token, process.env.JWT_SECRATE);
    next();
  } catch (err) {
    res.send({ error: err.message });
  }
};
