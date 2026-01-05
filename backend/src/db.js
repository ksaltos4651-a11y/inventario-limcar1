const { Pool } = require("pg");

const pool = new Pool({
  ssl: false
});

module.exports = { pool };
