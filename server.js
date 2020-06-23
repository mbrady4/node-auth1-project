const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const server = express();

const DB = require("./data/userModel");

server.use(express.json());

server.use(
  session({
    name: "user_session",
    secret: "test_secret",
    cookie: {
      maxAge: 1 * 24 * 60 * 60 * 60 * 1000,
      secure: false,
    },
    httpOnly: true,
    resave: false,
    saveUnitialized: false,
  })
);

server.post("/api/register", (req, res) => {
  if ((req.body.username === undefined) | (!req.body.password === undefined)) {
    res.status(400).json({ message: "Missing fields." });
  }
  const credentials = req.body;
  const hash = bcrypt.hashSync(credentials.password, 14);
  credentials.password = hash;
  if (!credentials.username && !credentials.password) {
    res.status(400).json({ message: "Missing fields." });
  }
  DB.insert(req.body)
    .then(() => res.status(201).json({ message: "Success" }))
    .catch(() => res.status(500).json({ message: "error" }));
});

server.post("/api/login", (req, res) => {
  let { username, password } = req.body;

  DB.findBy(username)
    .first()
    .then((user) => {
      if (bcrypt.compareSync(password, user.password)) {
        req.session.name = "test";
        res.status(200).json({ message: `Welcome ${user.username}.` });
      } else {
        res.status(400).json({ message: "Invalid Credentials" });
      }
    })
    .catch(() => res.status(500).json({ message: "Error." }));
});

server.get("/api/users", protected, (req, res) => {
  DB.getAll()
    .then((users) => res.status(200).json(users))
    .catch(() => res.status(500).json({ message: "Error." }));
});

function protected(req, res, next) {
  if (req.session && req.session.name) {
    next();
  } else {
    res.status(401).json({
      message: "You need to be logged in to access this information.",
    });
  }
}

module.exports = server;
