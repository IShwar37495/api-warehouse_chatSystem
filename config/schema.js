const cassandraClient = require("./cassandra");

const createTables = async () => {
  try {
    // Create users table
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS users (
        email TEXT PRIMARY KEY,
        username TEXT,
        created_at TIMESTAMP
      );
    `);

    // Create messages table with correct PRIMARY KEY structure
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID,
        sender_email TEXT,
        receiver_email TEXT,
        message TEXT,
        timestamp TIMESTAMP,
        PRIMARY KEY (id, timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC);
    `);

    console.log("✅ Tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

// Run the function to create tables
createTables();
