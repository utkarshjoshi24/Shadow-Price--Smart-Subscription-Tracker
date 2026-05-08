require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Subscription = require('./models/Subscription');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shadowprice');

const seedDB = async () => {
    try {
        await User.deleteMany({});
        await Subscription.deleteMany({});

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const testUser = new User({
            username: 'testuser',
            password: hashedPassword
        });
        await testUser.save();

        const today = new Date();

        const mockSubs = [
            {
                userId: testUser._id,
                name: 'Netflix',
                price: 649,
                billingCycle: 'monthly',
                category: 'Entertainment',
                usageStatus: 'Active',
                nextRenewal: new Date(today.getFullYear(), today.getMonth() + 1, 15)
            },
            {
                userId: testUser._id,
                name: 'Spotify Premium',
                price: 119,
                billingCycle: 'monthly',
                category: 'Entertainment',
                usageStatus: 'Active',
                nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
            },
            {
                userId: testUser._id,
                name: 'Gym Membership',
                price: 1500,
                billingCycle: 'monthly',
                category: 'Health',
                usageStatus: 'Rarely Used',
                nextRenewal: new Date(today.getFullYear(), today.getMonth() + 1, 1)
            },
            {
                userId: testUser._id,
                name: 'AWS Cloud',
                price: 2500,
                billingCycle: 'monthly',
                category: 'Software',
                usageStatus: 'Active',
                nextRenewal: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 12)
            },
            {
                userId: testUser._id,
                name: 'Adobe Creative Cloud',
                price: 4230,
                billingCycle: 'monthly',
                category: 'Software',
                usageStatus: 'Unused',
                nextRenewal: new Date(today.getFullYear(), today.getMonth() + 1, 10)
            }
        ];

        await Subscription.insertMany(mockSubs);
        console.log('Database seeded successfully! Login with testuser / password123');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedDB();
