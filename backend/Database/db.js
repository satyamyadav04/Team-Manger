const dns = require('node:dns');
const mongoose = require('mongoose');

const DEFAULT_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const configureDnsForMongoSrv = () => {
  const uri = process.env.MONGO_URI || '';

  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  const configuredServers = process.env.DNS_SERVERS
    ? process.env.DNS_SERVERS.split(',').map((server) => server.trim()).filter(Boolean)
    : DEFAULT_DNS_SERVERS;

  if (!configuredServers.length) {
    return;
  }

  dns.setServers(configuredServers);
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not configured.');
    }

    configureDnsForMongoSrv();
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
2