const cassandra = require("cassandra-driver");
const path = require("path");
require("dotenv").config();

const client = new cassandra.Client({
  cloud: { secureConnectBundle: path.resolve(__dirname, `../${process.env.ASTRA_DB_BUNDLE}`) },
  credentials: {
    username: process.env.ASTRA_DB_CLIENT_ID,  // Ensure these are set in .env
    password: process.env.ASTRA_DB_CLIENT_SECRET,
  },
  keyspace: process.env.ASTRA_DB_KEYSPACE,
});

client.connect()
  .then(() => console.log("✅ Connected to Astra DB"))
  .catch(err => console.error("❌ Astra DB connection error:", err));

module.exports = client;
