
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.model.js';
import Ticket from './models/Ticket.model.js';
import Company from './models/Company.model.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // 1. Clear Database
        console.log('🧹 Clearing database...');
        await Promise.all([
            User.deleteMany({}),
            Ticket.deleteMany({}),
            Company.deleteMany({})
        ]);

        // 2. Create Companies
        console.log('🏢 Creating Companies...');
        const mainCompany = await Company.create({
            name: 'Support Desk HQ',
            domain: 'supportdesk.com',
            type: 'main-company',
            industry: 'Technology',
            status: 'active'
        });

        const clientCompany1 = await Company.create({
            name: 'Acme Corp',
            domain: 'acme.com',
            type: 'client-company',
            industry: 'Manufacturing',
            status: 'active'
        });

        const clientCompany2 = await Company.create({
            name: 'Globex Inc',
            domain: 'globex.com',
            type: 'client-company',
            industry: 'Logistics',
            status: 'active'
        });

        // 3. Create Users
        console.log('👥 Creating Users...');

        // Super Admin
        await User.create({
            name: 'Super Admin',
            email: 'admin@test.com',
            password: 'password123',
            role: 'super_admin',
            company: mainCompany._id,
            isActive: true
        });

        // Company Manager
        const manager = await User.create({
            name: 'Test Manager',
            email: 'manager@test.com',
            password: 'password123',
            role: 'manager',
            company: mainCompany._id,
            isActive: true
        });

        // Agents
        const agent1 = await User.create({
            name: 'Agent Smith',
            email: 'agent1@test.com',
            password: 'password123',
            role: 'agent',
            company: mainCompany._id, // Agents belong to main company usually
            permissions: ['view_all_tickets'],
            isActive: true,
            jobTitle: 'Senior Support Agent'
        });

        const agent2 = await User.create({
            name: 'Agent Doe',
            email: 'agent2@test.com',
            password: 'password123',
            role: 'agent',
            company: mainCompany._id,
            permissions: [], // Limited permissions
            isActive: true,
            jobTitle: 'Junior Support Agent'
        });

        // Customers (Contacts)
        const contact1 = await User.create({
            name: 'Alice Acme',
            email: 'alice@acme.com',
            password: 'password123',
            role: 'customer',
            company: clientCompany1._id,
            isActive: true,
            jobTitle: 'IT Manager',
            phone: '+1-555-0101'
        });

        const contact2 = await User.create({
            name: 'Bob Globex',
            email: 'bob@globex.com',
            password: 'password123',
            role: 'customer',
            company: clientCompany2._id,
            isActive: true,
            jobTitle: 'Operations Lead',
            phone: '+1-555-0102'
        });

        // 4. Create Tickets
        console.log('🎫 Creating Tickets...');

        const tickets = [
            {
                subject: 'Cannot access VPN',
                description: 'I am getting a timeout error when trying to connect to the VPN.',
                status: 'open',
                priority: 'high',
                category: 'incident',
                companyId: clientCompany1._id,
                company: clientCompany1.name,
                assignedTo: agent1._id,
                createdBy: contact1._id
            },
            {
                subject: 'Request for new software license',
                description: 'We need 5 more licenses for Adobe Creative Cloud.',
                status: 'in_progress',
                priority: 'medium',
                category: 'request',
                companyId: clientCompany1._id,
                company: clientCompany1.name,
                assignedTo: agent1._id,
                createdBy: contact1._id
            },
            {
                subject: 'Printer not working',
                description: 'The main hallway printer is jamming repeatedly.',
                status: 'resolved',
                priority: 'low',
                category: 'incident',
                companyId: clientCompany2._id,
                company: clientCompany2.name,
                assignedTo: agent2._id,
                createdBy: contact2._id
            },
            {
                subject: 'System Slowness',
                description: 'The inventory system is very slow today.',
                status: 'open',
                priority: 'urgent',
                category: 'incident',
                companyId: clientCompany2._id,
                company: clientCompany2.name,
                // Unassigned
                createdBy: contact2._id
            },
            {
                subject: 'Q4 Budget Report Inquiry',
                description: 'Questions about the generated Q4 report figures.',
                status: 'closed',
                priority: 'medium',
                category: 'question',
                companyId: clientCompany1._id,
                company: clientCompany1.name,
                assignedTo: manager._id,
                createdBy: contact1._id
            }
        ];

        for (const ticket of tickets) {
            await Ticket.create(ticket);
        }

        console.log('✅ Seeding complete!');
        console.log('-----------------------------------');
        console.log('Main Company: Support Desk HQ');
        console.log('Client Companies: Acme Corp, Globex Inc');
        console.log('-----------------------------------');
        console.log('Credentials (password: password123):');
        console.log('SuperAdmin: admin@test.com');
        console.log('Manager:    manager@test.com');
        console.log('Agent 1:    agent1@test.com');
        console.log('Agent 2:    agent2@test.com');
        console.log('Contact 1:  alice@acme.com');
        console.log('Contact 2:  bob@globex.com');
        console.log('-----------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDB();
