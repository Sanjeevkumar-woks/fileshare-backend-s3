const router = require("express").Router();
const jwt = require("jsonwebtoken");
const UserLogin = require("../models/user");
const { v4: uuid4 } = require("uuid");



//LOGIN
router.post("/", async (req, res) => {
  const decoded = req.body
  const { email, email_verified, name, picture } = decoded;
  //check user existance
  const isUserExist = await UserLogin.findOne({ email });

  if (isUserExist) {
    try {
      const storedToken = isUserExist.jwt_token;
      jwt.verify(storedToken, process.env.JWT_SECRATE);
      if (email_verified)
        res.send({ email, email_verified, name, picture, "jwt_token": storedToken, uuid: isUserExist.uuid });
    } catch (err) {
      res.send({ error: err.message });
    }
  } else if (email_verified) {
    // check user google varified 
    var jwt_token = jwt.sign({ email }, process.env.JWT_SECRATE);
    const user = new UserLogin({
      email, email_verified, name, picture, jwt_token, uuid: uuid4()
    });
    await user.save();
    const userCredentials = await UserLogin.findOne({ email });
    res.send(userCredentials);

  } else {
    res.send({ error: "login failed!!" });
  }
});

router.delete("/", async (req, res) => {
  const respo = await UserLogin.deleteMany({});
  res.send(respo);
})

module.exports = router;
