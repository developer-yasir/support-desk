import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import User from '../models/User.model.js';
import Ticket from '../models/Ticket.model.js';
import Company from '../models/Company.model.js';

// Configuration for default system email (fallback)
const getSystemConfig = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
    return {
        imap: {
            user: process.env.EMAIL_USER,
            password: process.env.EMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            authTimeout: 3000,
            tlsOptions: { rejectUnauthorized: false }
        },
        context: {
            isSystem: true,
            companyName: 'System', // Or default company
            folders: { inbox: 'INBOX', sent: '[Gmail]/Sent Mail' }
        }
    };
};

/**
 * Connect to IMAP and poll for new emails for all configured accounts
 */
export const startEmailPolling = async () => {
    console.log('Starting Email Poller Service...');

    // Poll every 60 seconds
    setInterval(pollAllAccounts, 60000);

    // Initial check
    await pollAllAccounts();
};

const pollAllAccounts = async () => {
    console.log('Polling all email accounts...');

    // 1. Poll System Email
    const systemConfig = getSystemConfig();
    if (systemConfig) {
        await pollAccount(systemConfig);
    }

    // 2. Poll Company Emails
    try {
        const companies = await Company.find({ 'emailConfig.enabled': true });
        for (const company of companies) {
            const companyConfig = {
                imap: {
                    user: company.emailConfig.user,
                    password: company.emailConfig.pass,
                    host: company.emailConfig.host,
                    port: company.emailConfig.port,
                    tls: company.emailConfig.secure,
                    authTimeout: 3000,
                    tlsOptions: { rejectUnauthorized: false }
                },
                context: {
                    isSystem: false,
                    companyId: company._id,
                    companyName: company.name,
                    folders: company.emailConfig.folders || { inbox: 'INBOX', sent: '[Gmail]/Sent Mail' }
                }
            };
            await pollAccount(companyConfig);
        }
    } catch (error) {
        console.error('Error fetching companies for email polling:', error);
    }
};

const pollAccount = async (config) => {
    let connection;
    try {
        connection = await imaps.connect(config);

        // Poll INBOX
        await processFolder(connection, config.context.folders.inbox, config.context, 'inbox');

        // Poll Sent Items
        await processFolder(connection, config.context.folders.sent, config.context, 'sent');

        connection.end();
    } catch (error) {
        console.error(`Email Poller Error (${config.context.companyName}):`, error);
        if (connection) connection.end();
    }
};

const processFolder = async (connection, folderName, context, folderType) => {
    try {
        await connection.openBox(folderName);

        await connection.openBox(folderName);

        // Fetch emails from the last 24 hours for ALL folders (Inbox & Sent)
        // This ensures we catch all emails even if they are already read in Gmail
        const sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - 1); // Look back 1 day
        const searchCriteria = [['SINCE', sinceDate.toISOString()]];

        const fetchOptions = {
            bodies: ['HEADER', 'TEXT', ''],
            markSeen: true
        };

        const messages = await connection.search(searchCriteria, fetchOptions);

        if (messages.length > 0) {
            console.log(`[${context.companyName}] Found ${messages.length} new messages in ${folderName}`);
        }

        for (const item of messages) {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid;
            const idHeader = 'Imap-Id: ' + id + '\r\n';

            const mail = await simpleParser(idHeader + all.body);
            await processEmail(mail, context, folderType);
        }
    } catch (error) {
        console.error(`Failed to process folder ${folderName} for ${context.companyName}:`, error.message);
    }
};

const processEmail = async (mail, context, folderType) => {
    try {
        const messageId = mail.messageId;

        // Deduplication: Check if ticket already exists for this email
        if (messageId) {
            const existingTicket = await Ticket.findOne({ messageId });
            if (existingTicket) {
                console.log(`Skipping duplicate email processing (Message-ID: ${messageId})`);
                return;
            }
        }

        const fromEmail = mail.from.value[0].address;
        const fromName = mail.from.value[0].name || fromEmail.split('@')[0];
        const subject = mail.subject || 'No Subject';
        const body = mail.text || mail.html || 'No Content';

        console.log(`Processing ${folderType} email from: ${fromEmail} - Subject: ${subject}`);

        // Is this an email sent BY the system/agent?
        // Logic: if folderType is 'sent', acts as Agent. 
        // If folderType is 'inbox', acts as Customer (unless sender is an agent, but for now simplify).

        let user = await User.findOne({ email: fromEmail });

        // If Sent folder, we expect the user (Sender) to be an admin/agent/manager.
        // If they don't exist, we probably shouldn't create a customer ticket for them?
        // But per request "create ticket of that mail".

        if (!user) {
            // Only auto-create users for INCOMING emails (Cusomters)
            if (folderType === 'sent') {
                // It's the system account sending out?
                // or manual send from gmail interface.
                // Let's attribute it to a default admin or find user.
                console.log('Outgoing email from unknown user, attempting to link to system/company context.');
                // For now, if we can't find the sender of a Sent email, we might skip or create a dummy user
                // Requirement: "create a ticket of that mail"
            }

            console.log(`Creating new user for ${fromEmail}`);
            const randomPassword = Math.random().toString(36).slice(-8) + 'Aa1!';
            user = await User.create({
                name: fromName,
                email: fromEmail,
                password: randomPassword,
                role: 'customer' // Default
            });
        }

        // Logic for Sent Emails (Outgoing)
        if (folderType === 'sent') {
            // Created by Agent/User
            // Status might be 'closed' or 'responded'? 
            // Or just Open ticket created by agent?
            // "users can also add their own company imap settings" -> implies agents working via email.

            // Check if this is a reply to an existing ticket (subject contains #TKT-XXXX)?
            // (Skipping complex reply logic for now as per simplified plan)

            const ticket = await Ticket.create({
                subject: `[Outgoing] ${subject}`,
                description: body,
                status: 'open',
                priority: 'medium',
                category: 'General',
                createdBy: user._id,
                assignedTo: user._id, // Assign to self?
                companyId: context.companyId,
                company: context.companyName,
                messageId: messageId, // Store Message-ID
                via: 'email-outgoing'
            });
            console.log(`Ticket #${ticket.ticketNumber} created from OUTGOING email.`);
            return;
        }

        // Logic for Inbox Emails (Incoming)
        let companyId = context.companyId;
        let companyName = context.companyName;

        // If context is system, try to associate based on user
        if (context.isSystem && !companyId && user.company) {
            companyId = user.company;
            const company = await Company.findById(companyId);
            if (company) companyName = company.name;
        }

        const ticket = await Ticket.create({
            subject: subject,
            description: body,
            status: 'open',
            priority: 'medium',
            category: 'General',
            createdBy: user._id,
            companyId: companyId,
            company: companyName,
            messageId: messageId, // Store Message-ID
            via: 'email'
        });

        console.log(`Ticket #${ticket.ticketNumber} created from INCOMING email.`);

    } catch (error) {
        console.error('Failed to process email:', error);
    }
};
