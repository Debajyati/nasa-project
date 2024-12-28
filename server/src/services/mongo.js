const mongoose = require("mongoose");

require('dotenv').config();
const MONGODB_URL = process.env.MONGO_URL;

mongoose.connection.once("open", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error(
    "MongoDB connection error. Please make sure MongoDB is running. " + err,
  );
  process.exit(1);
});

async function mongoConnect() {
  await mongoose.connect(MONGODB_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect,
};
