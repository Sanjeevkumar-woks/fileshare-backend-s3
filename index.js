const express = require("express");
const cors = require('cors')
const app = express();
const dotenv = require("dotenv").config();

const PORT = process.env.PORT;

const connectDB = require("./config/db");
connectDB();
app.use(express.json())
app.use(cors());
app.use("/api/files", require("./routes/files"));
app.use("/api/files/login", require("./routes/login"));

app.get('/', (req, res) => {
  res.send("Hello welcome to code base");
})
app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
