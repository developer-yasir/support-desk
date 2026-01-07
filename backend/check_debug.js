import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

import Ticket from './src/models/Ticket.model.js';
import User from './src/models/User.model.js';

const checkData = async () => {
    try {
        console.log('Connecting to MongoDB...', process.env.MONGODB_URI);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        console.log('\n--- USERS ---');
        const users = await User.find({});
        users.forEach(u => {
            console.log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Role: ${u.role}`);
        });

        console.log('\n--- TICKETS ---');
        const tickets = await Ticket.find({});
        console.log(`Total Tickets: ${tickets.length}`);
        tickets.forEach(t => {
            console.log(`ID: ${t._id}, No: ${t.ticketNumber}, Status: ${t.status}, Subject: ${t.subject}`);
            console.log(`   CreatedBy: ${t.createdBy}, AssignedTo: ${t.assignedTo}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
