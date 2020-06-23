const knex = require("knex");
const config = require("../knexfile");

const db = knex(config.development);

module.exports = {
  insert,
  findBy,
  getAll,
};

function getAll() {
  return db("users");
}

function insert(user) {
  return db("users").insert(user);
}

function findBy(username) {
  return db("users").where({ username });
}
