const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Teacher schema - stores teacher account details
// bcrypt is used to hash the password before saving (never store plain text passwords)
const TeacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,   // Name is mandatory
    trim: true,       // Remove extra spaces
  },
  email: {
    type: String,
    required: true,
    unique: true,     // No two teachers can have the same email
    lowercase: true,  // Store email in lowercase always
    trim: true,
  },
  password: {
    type: String,
    required: true,   // Hashed password
  },
}, { timestamps: true }); // Adds createdAt and updatedAt automatically

// Before saving a teacher to the DB, hash their password
// "pre('save')" is a Mongoose middleware that runs before the save operation
TeacherSchema.pre('save', async function () {
  // Only hash if the password field was changed (avoids re-hashing on profile updates)
  if (!this.isModified('password')) return;

  // bcrypt.genSalt generates a "salt" (random data added to password before hashing)
  const salt = await bcrypt.genSalt(10);
  // bcrypt.hash creates the actual hash
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare entered password with stored hash during login
TeacherSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Teacher', TeacherSchema);
