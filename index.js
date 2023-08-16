const express = require("express");
const session = require("express-session");
const { createClient } = require("redis");
const RedisStore = require("connect-redis").default;
require("dotenv").config();

const app = express();

const { REDIS_PORT, SESSION_SECRET, REDIS_HOST, REDIS_PASSWORD } = process.env;

const redisClient = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
  },
});
redisClient.connect().catch(console.error);

const redisStore = new RedisStore({
  client: redisClient,
});

app.use(express.json());

app.use(
  session({
    store: redisStore,
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 30, // 30 minutes
    },
  })
);

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  req.session.sessionID = username;
  res.json("you are logged in");
});

app.use((req, res, next) => {
  if (!req.session || !req.session.clientId) {
    const err = new Error("You can't pass");
    err.statusCode = 401;
    return next(err);
  }
  next();
});

app.get("/profile", (req, res) => {
  res.json(req.session);
});

app.listen(1338, () => {
  console.log("server is running on port 1338");
});
