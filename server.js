const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(helmet());

const whitelisted = ["::ffff:127.0.0.1", "::1", "::ffff:10.69.173.87"];

const validateReq = function (req, res, next) {
  // if (req.connection.remoteAddress === "https://snakenode.web.app") {
  console.log(req.ip, "connection");
  if (whitelisted.includes(req.ip)) {
    next();
  }
  return res.status(400).json("Error...");
};

// cors origin URL - Allow inbound traffic from origin
corsOptions = {
  origin: "https://snakenode.web.app",
  // origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.use(validateReq);

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection successful");
});

const usersRouter = require("./routes/users");

app.use("/users", usersRouter);

app.get("/test", (req, res) => {
  res.send(req.ip);
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
