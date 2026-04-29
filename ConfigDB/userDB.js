import mongoose from "mongoose";

const UserDB = async () => {
  try {
    await mongoose.connect(process.env.nameDb);
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.log("❌ Error connecting to UserDB:", err.message);
  }
};

export default UserDB;