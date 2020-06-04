const mongoose = require('mongoose');

const { Schema } = mongoose;
// signup schema for saving and verifying users
const userEntrySchema = new Schema({
email:String,
password:String,
confirmpassword:String
});

const UserEntry = mongoose.model('UserEntry', userEntrySchema);
// exprting the schema
module.exports = UserEntry;