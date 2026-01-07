
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Ticket from './models/Ticket.model.js';

dotenv.config();

const users = [
    {
        name: 'Test Manager',
        email: 'manager@test.com',
        password: 'password123',
        role: 'manager',
        // Note: User model does not have companyId, so we manage it via logic/naming for now 
    },
    {
        name: 'Test Agent',
        email: 'agent@test.com',
        password: 'password123',
        role: 'agent',
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Clear existing test users if you want, or just add new ones
        // await User.deleteMany({ email: { $in: users.map(u => u.email) } });

        for (const user of users) {
            const exists = await User.findOne({ email: user.email });
            if (exists) {
                console.log(`User ${user.email} already exists`);
                continue;
            }
            await User.create(user);
            console.log(`User ${user.email} created`);
        }

        console.log('✅ Seeding complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
