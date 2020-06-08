const express = require("express"),
  app = express(),
  http = require("http").createServer(app),
  io = require("socket.io").listen(http),
  path = require("path");

const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");

const User = require("./models/user.model");

require("dotenv").config();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(helmet());

const usersConnected = {};
const webSocketHandler = (socket) => {
  socket.on("eatApple", (userID) => {
    if (usersConnected[userID] !== undefined) {
      usersConnected[userID] += 1;
    } else {
      usersConnected[userID] = 0;
    }
  });

  socket.on("endGame", ({ userID, username, highScore }) => {
    // console.log(usersConnected[userID], "USERCONNECTED");
    // console.log(userID, "ID");
    // console.log(username, "USERNAME");

    User.findById(userID).then((user) => {
      if (user.score < usersConnected[userID]) {
        user.username = username;
        user.score = usersConnected[userID];

        user.save();
      }
      usersConnected[userID] = 0;
    });
  });

  socket.on("disconnect", (userID) => {
    delete usersConnected[userID];
  });
};

// cors origin URL - Allow inbound traffic from origin
corsOptions = {
  origin: "https://snakenode.web.app",
  // origin: "http://localhost:3000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

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

io.of("/tick").on("connection", webSocketHandler);

http.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
