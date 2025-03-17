const cassandraClient = require("./cassandra");

const createTables = async () => {
  try {
    // ✅ Store only recent chats in Cassandra
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS recent_chats (
        user_id TEXT,                  // The logged-in user's ID
        contact_id TEXT,               // The ID of the person they chatted with
        last_message TEXT,             // Last message in this conversation
        timestamp TIMESTAMP,           // When the last message was sent
        unread_count INT,              // Unread message count for notifications
        PRIMARY KEY ((user_id), contact_id) 
      ) WITH CLUSTERING ORDER BY (contact_id ASC);
    `);

    // ✅ Store only recent messages in Cassandra (Full chat history in MySQL)
    await cassandraClient.execute(`
      CREATE TABLE IF NOT EXISTS messages (
        conversation_id UUID,          // Unique conversation ID
        sender_id TEXT,                // ID of the sender
        receiver_id TEXT,              // ID of the receiver
        message TEXT,                  // The message content
        timestamp TIMESTAMP,           // When the message was sent
        PRIMARY KEY ((conversation_id), timestamp)
      ) WITH CLUSTERING ORDER BY (timestamp DESC);
    `);

    console.log("✅ Tables created successfully.");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  }
};

// Run the function to create tables
createTables();
