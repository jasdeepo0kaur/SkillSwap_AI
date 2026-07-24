const mongoose = require('mongoose');
const dns = require('dns');

// Force using Google DNS servers to resolve MongoDB Atlas SRV hostnames (bypasses ISP DNS restrictions)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (err) {
  console.warn('Could not set custom DNS servers:', err.message);
}

// Force IPv4 first DNS lookup to prevent connection timeouts/errors on MongoDB Atlas
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skill_swap', {
      serverSelectionTimeoutMS: 5000 // fail fast if there's a network/IP issue
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('\n==================================================================');
    console.error('❌ MONGODB CONNECTION ERROR: Failed to connect to the database.');
    console.error(`Error details: ${error.message}`);
    console.error('==================================================================');
    console.error('If you are trying to connect to MongoDB Atlas, please check the following:');
    console.error('1. IP Whitelisting: Go to MongoDB Atlas -> Network Access, and make sure');
    console.error('   your IP address is whitelisted, or add 0.0.0.0/0 to allow access from anywhere.');
    console.error('2. URI Format: Ensure the connection string in your backend/.env is formatted correctly:');
    console.error('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/<database_name>?retryWrites=true&w=majority');
    console.error('3. Special Characters: If your password contains special characters like @, :, /, or +,');
    console.error('   they MUST be URL-encoded (e.g., @ becomes %40, + becomes %2B).');
    console.error('4. Local MongoDB: If you want to use local MongoDB, make sure MongoDB Service is running.');
    console.error('==================================================================\n');
    process.exit(1);
  }
};

module.exports = connectDB;
