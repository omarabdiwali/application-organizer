import mongoose, { Schema } from "mongoose";

let AccountSchema = new Schema({
  name: String,
  email: String,
  applications: [{ title: String, url: String, status: String, date: Date }]
});

module.exports = mongoose.models.Accounts || mongoose.model("Accounts", AccountSchema);