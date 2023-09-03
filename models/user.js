const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, require: true },
    jwt_token: { type: String, require: true },
    uuid: { type: String, require: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserLogin", userSchema);