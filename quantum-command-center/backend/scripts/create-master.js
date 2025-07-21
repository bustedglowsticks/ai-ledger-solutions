/*
 * 🚀 CREATE MASTER ADMIN SCRIPT
 * Initialize the master admin user for the Quantum Bot Command Center
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// User schema (simplified for script)
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['master', 'admin'], default: 'admin' },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalCommissions: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const User = mongoose.model('User', userSchema);

async function createMasterAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if master admin already exists
    const existingMaster = await User.findOne({ role: 'master' });
    if (existingMaster) {
      console.log('⚠️  Master admin already exists:', existingMaster.email);
      process.exit(0);
    }

    // Create master admin
    const masterEmail = 'master@quantumbot.com';
    const masterPassword = 'QuantumMaster2024!';
    const hashedPassword = await bcrypt.hash(masterPassword, 12);

    const masterAdmin = new User({
      email: masterEmail,
      password: hashedPassword,
      name: 'Master Admin',
      role: 'master'
    });

    await masterAdmin.save();

    console.log('🚀 Master admin created successfully!');
    console.log('📧 Email:', masterEmail);
    console.log('🔑 Password:', masterPassword);
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating master admin:', error);
    process.exit(1);
  }
}

createMasterAdmin();
