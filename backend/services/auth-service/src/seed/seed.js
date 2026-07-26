const mongoose = require('mongoose');
const config = require('../config/config');
const authModel = require('../models/auth.model');
const PasswordUtil = require('../utils/password.util');

// Import user schema/model
const userSchema = require('../../../user-service/src/schema/user.schema');
const userModel = mongoose.models.User || mongoose.model('User', userSchema);

const usersData = [
    {
        auth: { email: 'admin@example.com', role: 'ADMIN', isVerified: true, isActive: true },
        profile: { firstName: 'Admin', lastName: 'User', phone: '+1234567890', dob: new Date('1990-01-01'), gender: 'Male', address: '100 Admin Way', city: 'New York', state: 'NY', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin' }
    },
    {
        auth: { email: 'jane.smith@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Jane', lastName: 'Smith', phone: '+1234567891', dob: new Date('1992-05-15'), gender: 'Female', address: '200 Main St', city: 'Los Angeles', state: 'CA', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' }
    },
    {
        auth: { email: 'michael.brown@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Michael', lastName: 'Brown', phone: '+1234567892', dob: new Date('1988-11-20'), gender: 'Male', address: '300 Oak Ave', city: 'Chicago', state: 'IL', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' }
    },
    {
        auth: { email: 'emily.davis@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Emily', lastName: 'Davis', phone: '+1234567893', dob: new Date('1995-03-10'), gender: 'Female', address: '400 Pine Rd', city: 'Houston', state: 'TX', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily' }
    },
    {
        auth: { email: 'david.wilson@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'David', lastName: 'Wilson', phone: '+1234567894', dob: new Date('1985-07-25'), gender: 'Male', address: '500 Maple St', city: 'Phoenix', state: 'AZ', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' }
    },
    {
        auth: { email: 'sarah.taylor@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Sarah', lastName: 'Taylor', phone: '+1234567895', dob: new Date('1993-09-12'), gender: 'Female', address: '600 Cedar Ln', city: 'Philadelphia', state: 'PA', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' }
    },
    {
        auth: { email: 'james.anderson@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'James', lastName: 'Anderson', phone: '+1234567896', dob: new Date('1991-12-05'), gender: 'Male', address: '700 Elm St', city: 'San Antonio', state: 'TX', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' }
    },
    {
        auth: { email: 'jessica.thomas@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Jessica', lastName: 'Thomas', phone: '+1234567897', dob: new Date('1994-08-30'), gender: 'Female', address: '800 Walnut St', city: 'San Diego', state: 'CA', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica' }
    },
    {
        auth: { email: 'robert.jackson@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Robert', lastName: 'Jackson', phone: '+1234567898', dob: new Date('1989-04-18'), gender: 'Male', address: '900 Spruce St', city: 'Dallas', state: 'TX', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert' }
    },
    {
        auth: { email: 'amanda.white@example.com', role: 'USER', isVerified: true, isActive: true },
        profile: { firstName: 'Amanda', lastName: 'White', phone: '+1234567899', dob: new Date('1996-06-22'), gender: 'Female', address: '1000 Birch St', city: 'San Jose', state: 'CA', country: 'USA', profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda' }
    }
];

async function seedUsers() {
    try {
        console.log('Connecting to MongoDB:', config.mongoUri);
        await mongoose.connect(config.mongoUri);
        console.log('Database connected successfully.');

        const defaultPassword = 'Password123!';
        const hashedPassword = await PasswordUtil.hashPassword(defaultPassword);

        const createdRecords = [];

        for (const item of usersData) {
            // Upsert auth user
            let authUser = await authModel.findOne({ email: item.auth.email });
            if (!authUser) {
                authUser = await authModel.create({
                    ...item.auth,
                    password: hashedPassword
                });
                console.log(`Created Auth user: ${authUser.email}`);
            } else {
                console.log(`Auth user already exists: ${authUser.email}`);
            }

            // Upsert profile user
            let userProfile = await userModel.findOne({ authUserId: authUser._id });
            if (!userProfile) {
                userProfile = await userModel.create({
                    authUserId: authUser._id,
                    ...item.profile
                });
                console.log(`Created User profile for: ${item.profile.firstName} ${item.profile.lastName}`);
            } else {
                console.log(`User profile already exists for: ${item.profile.firstName}`);
            }

            createdRecords.push({ auth: authUser, profile: userProfile });
        }

        console.log('\nSuccessfully seeded 10 users!');
        console.log('Default password for all users:', defaultPassword);
        return createdRecords;
    } catch (error) {
        console.error('Error seeding users:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

if (require.main === module) {
    seedUsers();
}

module.exports = seedUsers;
