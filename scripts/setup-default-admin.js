const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Import the TeamMember model
const TeamMember = require('../models/TeamMember').default;

async function setupDefaultAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'joel.schrock@presidentialdigs.com';
    
    // Check if admin already exists
    const existingAdmin = await TeamMember.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating to ensure admin role...');
      
      // Update existing user to ensure they have admin role
      await TeamMember.findOneAndUpdate(
        { email: adminEmail },
        {
          role: 'admin',
          status: 'active',
          department: 'Presidential Digs Real Estate',
          position: 'Owner',
          isGoogleUser: true
        },
        { new: true }
      );
      
      console.log('✅ Admin user updated successfully');
    } else {
      // Create new admin user
      const adminUser = new TeamMember({
        name: 'Joel Schrock',
        email: adminEmail,
        role: 'admin',
        status: 'active',
        department: 'Presidential Digs Real Estate',
        position: 'Owner',
        joinDate: new Date(),
        isGoogleUser: true,
        skills: ['Leadership', 'Management', 'Real Estate'],
        bio: 'Owner and Administrator of Presidential Digs Real Estate'
      });
      
      await adminUser.save();
      console.log('✅ Default admin user created successfully');
    }
    
    // Verify the admin user
    const admin = await TeamMember.findOne({ email: adminEmail });
    console.log('Admin user details:', {
      name: admin.name,
      email: admin.email,
      role: admin.role,
      position: admin.position,
      isGoogleUser: admin.isGoogleUser
    });
    
  } catch (error) {
    console.error('❌ Error setting up default admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup
setupDefaultAdmin(); 