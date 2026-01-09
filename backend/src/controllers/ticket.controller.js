import Ticket from '../models/Ticket.model.js';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import { sendEmail, generateTicketReplyEmail, generateNewTicketEmail } from '../services/email.service.js';

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
    try {
        const { status, priority, assignedTo, createdBy, company } = req.query;

        // Build query
        let query = {};

        // Filter by role
        if (req.user.role === 'customer') {
            query.createdBy = req.user.id;
        } else if (req.user.role === 'manager') {
            // Managers see tickets for:
            // 1. Their Employer Company
            // 2. Client Companies they created
            // 3. Tickets they personally created

            let allowedCompanyNames = [];

            // 1. Get Employer Company
            if (req.user.company) {
                const employerCompany = await Company.findById(req.user.company);
                if (employerCompany) {
                    allowedCompanyNames.push(employerCompany.name);
                }
            }

            // 2. Get Client Companies created by Manager
            const createdCompanies = await Company.find({ createdBy: req.user.id });
            const createdCompanyNames = createdCompanies.map(c => c.name);
            allowedCompanyNames = [...allowedCompanyNames, ...createdCompanyNames];

            // 3. Construct Query
            if (allowedCompanyNames.length > 0) {
                query.$or = [
                    { company: { $in: allowedCompanyNames } },
                    { createdBy: req.user.id }
                ];
            } else {
                query.createdBy = req.user.id;
            }
        } else if (req.user.role === 'agent') {
            // Check for permissions
            const hasFullAccess = req.user.permissions && req.user.permissions.includes('view_all_tickets');

            if (!hasFullAccess) {
                // Strict view: Only tickets assigned to this agent
                query.assignedTo = req.user.id;
            }
            // If hasFullAccess, we don't set any default query restrictions (they see all)
            // But filters (status, priority etc) below will still apply.
        }

        // Additional filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;
        if (createdBy) query.createdBy = createdBy;
        if (company) query.company = { $regex: company, $options: 'i' }; // Case insensitive search

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .select({ comments: { $slice: -1 } }) // Get only the last comment
            .populate('comments.user', 'name email role') // Populate user details for that comment
            .sort({ createdAt: -1 });

        res.status(200).json({
            status: 'success',
            results: tickets.length,
            data: { tickets }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('comments.user', 'name email');

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res) => {
    try {
        let creatorId = req.user.id;

        // Allow agents/admins/managers to create tickets on behalf of others
        if (['agent', 'admin', 'super_admin', 'manager'].includes(req.user.role) && req.body.createdBy) {
            creatorId = req.body.createdBy;
        }

        // Fetch creator's details to get company info
        const creator = await User.findById(creatorId).populate('company');

        const ticketData = {
            ...req.body,
            createdBy: creatorId,
            status: 'open', // Enforce default status
            companyId: creator.company ? creator.company._id : undefined,
            company: creator.company ? creator.company.name : ''
        };

        // Handle attachments
        if (req.files && req.files.length > 0) {
            ticketData.attachments = req.files.map(file => ({
                filename: file.originalname,
                url: `/uploads/${file.filename}`, // In production, this would be S3 URL
                uploadedAt: Date.now()
            }));
        }

        const ticket = await Ticket.create(ticketData);

        // Send Email Notification to Creator (and potential CCs if passed)
        try {
            // Get Company for email settings
            let company = null;
            if (creator.company) {
                // Already populated above
                company = creator.company;
            } else if (ticketData.companyId) {
                company = await Company.findById(ticketData.companyId);
            }

            // Check if notification is enabled (default to true if not specified)
            const isEnabled = company?.emailConfig?.notifications?.new_ticket_requester?.enabled ?? true;

            if (isEnabled) {
                const emailHtml = generateNewTicketEmail(ticket, creator);

                // Recipients: Creator + any To/CC provided in body (if UI supports it)
                // Note: Frontend might strictly be using 'addComment' for CC, but if creating new ticket, 
                // we usually send to creator.
                const recipients = [creator.email];

                // If body has to/cc (optional support)
                if (req.body.cc) {
                    const ccs = typeof req.body.cc === 'string' ? req.body.cc.split(',') : req.body.cc;
                    recipients.push(...ccs);
                }

                for (const recipient of recipients) {
                    if (!recipient) continue;
                    await sendEmail(company, {
                        to: recipient,
                        subject: `Request Received: ${ticket.subject} [#${ticket.ticketNumber || ticket._id.toString().slice(-6)}]`,
                        html: emailHtml,
                        text: `Ticket Created: ${ticket.subject}`
                    });
                }
            }
        } catch (emailError) {
            console.error("Failed to send ticket creation email:", emailError);
            // Non-blocking error
        }

        res.status(201).json({
            status: 'success',
            data: { ticket }
        });
    } catch (error) {
        console.error("Create Ticket Error:", error);
        console.error("Request Body:", req.body);
        console.error("User:", req.user);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res) => {
    try {
        let ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Update resolved date if status changed to resolved
        if (req.body.status === 'resolved' && ticket.status !== 'resolved') {
            req.body.resolvedAt = new Date();
        }

        ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { ticket }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { message, isInternal, to, cc } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Helper to normalize recipients (handle FormData string vs array)
        const parseRecipients = (val) => {
            if (!val) return [];
            if (Array.isArray(val)) return val;
            if (typeof val === 'string') {
                try {
                    // Try parsing as JSON array first (e.g. "['a','b']")
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) return parsed;
                } catch (e) {
                    // If not JSON, treat as single value or comma-separated
                    return val.split(',').map(s => s.trim()).filter(Boolean);
                }
                return [val];
            }
            return [];
        };

        const toEmails = parseRecipients(to);
        const ccEmails = parseRecipients(cc);

        // Auto-create users for new emails
        const allRecipients = [...new Set([...toEmails, ...ccEmails])];

        for (const email of allRecipients) {
            if (!email || !email.includes('@')) continue;
            const userExists = await User.findOne({ email });
            if (!userExists) {
                try {
                    const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    await User.create({
                        name,
                        email,
                        password: 'Password@123',
                        role: 'customer'
                    });
                    console.log(`[Auto-create] Created new user for ${email}`);
                } catch (err) {
                    console.error(`[Auto-create] Failed to create user for ${email}:`, err);
                }
            }
        }

        const comment = {
            user: req.user.id,
            message,
            isInternal: isInternal || false,
            to: toEmails,
            cc: ccEmails,
            createdAt: Date.now(),
            attachments: []
        };

        if (req.files && req.files.length > 0) {
            comment.attachments = req.files.map(file => ({
                filename: file.originalname,
                url: `/uploads/${file.filename}`, // In production, this would be S3 URL
                uploadedAt: Date.now()
            }));
        }

        ticket.comments.push(comment);

        // Auto-update status to 'in_progress' if it's 'open' and agent replies
        if (req.user.role !== 'customer' && ticket.status === 'open') {
            ticket.status = 'in_progress';
        }

        // Update resolved date if needed (unlikely on comment but good practice to check logic elsewhere)

        await ticket.save();

        // Populate user info for the new comment to return it immediately
        // We need to re-fetch or just populate the last comment
        // Easier to just re-fetch the ticket with populated comments
        const updatedTicket = await Ticket.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('comments.user', 'name email');

        // Send Email Notification
        try {
            // Only send if the reply is NOT internal
            if (!isInternal) {
                // Get sender's company for email config
                let senderCompany = null;
                if (req.user.company) {
                    senderCompany = await Company.findById(req.user.company);
                }

                // Determine recipients
                const recipients = new Set([...toEmails, ...ccEmails]);

                // If the creator didn't send the comment, notify them
                if (ticket.createdBy && ticket.createdBy.toString() !== req.user.id) {
                    // Fetch creator email if not populated
                    const creator = await User.findById(ticket.createdBy);
                    if (creator && creator.email) {
                        recipients.add(creator.email);
                    }
                }

                // Remove the sender from recipients (don't email yourself)
                recipients.delete(req.user.email);

                if (recipients.size > 0 && senderCompany) {
                    const emailHtml = generateTicketReplyEmail(updatedTicket, comment);

                    // Send to each recipient
                    for (const recipient of recipients) {
                        try {
                            await sendEmail(senderCompany, {
                                to: recipient,
                                subject: `Re: ${ticket.subject} [#${ticket.ticketNumber || ticket._id.toString().slice(-6)}]`,
                                html: emailHtml,
                                text: `New reply on ticket: ${message}`
                            });
                        } catch (emailErr) {
                            console.error(`Failed to send email to ${recipient}:`, emailErr.message);
                            // Don't fail the request if email fails, just log it
                        }
                    }
                }
            }
        } catch (emailError) {
            console.error("Email notification error:", emailError);
        }

        res.status(200).json({
            status: 'success',
            data: { ticket: updatedTicket }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private
export const deleteTicket = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        await ticket.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'Ticket deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Forward ticket via email
// @route   POST /api/tickets/:id/forward
// @access  Private
export const forwardTicket = async (req, res) => {
    try {
        const { email, message, includeHistory } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        // Simulate sending email
        console.log(`[Mock Email] Forwarding Ticket #${ticket._id} to ${email}`);
        console.log(`[Mock Email] Message: ${message}`);
        console.log(`[Mock Email] Include History: ${includeHistory}`);

        // Add system comment
        const comment = {
            user: req.user.id,
            message: `<strong>Forwarded ticket to ${email}</strong><br/>${message}`,
            isInternal: true, // System actions usually internal or visible? Let's make it internal for now as it's an agent action.
            createdAt: Date.now()
        };

        ticket.comments.push(comment);
        await ticket.save();

        res.status(200).json({
            status: 'success',
            message: `Ticket forwarded to ${email}`
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats
// @access  Private
export const getTicketStats = async (req, res) => {
    try {
        let matchStage = {};

        // Apply role-based filtering (logic shared with getTickets)
        if (req.user.role === 'customer') {
            matchStage.createdBy = req.user.id;
        } else if (req.user.role === 'manager') {
            let allowedCompanyNames = [];

            if (req.user.company) {
                const employerCompany = await Company.findById(req.user.company);
                if (employerCompany) {
                    allowedCompanyNames.push(employerCompany.name);
                }
            }

            const createdCompanies = await Company.find({ createdBy: req.user.id });
            const createdCompanyNames = createdCompanies.map(c => c.name);
            allowedCompanyNames = [...allowedCompanyNames, ...createdCompanyNames];

            if (allowedCompanyNames.length > 0) {
                matchStage.$or = [
                    { company: { $in: allowedCompanyNames } },
                    { createdBy: req.user.id }
                ];
            } else {
                matchStage.createdBy = req.user.id;
            }
        } else if (req.user.role === 'agent') {
            const hasFullAccess = req.user.permissions && req.user.permissions.includes('view_all_tickets');
            if (!hasFullAccess) {
                matchStage.assignedTo = req.user.id;
            }
        }

        // 1. Get counts by status
        const statusStats = await Ticket.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 2. Get counts by priority
        const priorityStats = await Ticket.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        // 3. Get total tickets
        // Note: countDocuments supports a query filter, so we use matchStage directly (if it's a simple object)
        // However, matchStage can contain $or, which countDocuments handles.
        // BUT if matchStage is {}, it counts all.
        const totalTickets = await Ticket.countDocuments(matchStage);

        // 4. Get tickets created in last 7 days (volume)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Combine matchStage with date filter
        const volumeMatch = { ...matchStage, createdAt: { $gte: sevenDaysAgo } };
        // NOTE: matchStage might have $or. We need to be careful merging.
        // Correct way: use $and if matchStage has complex logic, or just merge if simple.
        // If matchStage has $or, we can't just spread it if we want to AND it with createdAt.
        // Safer approach for aggregate: use $match pipeline stages.

        const volumePipeline = [
            { $match: matchStage }, // Filter by role first
            { $match: { createdAt: { $gte: sevenDaysAgo } } }, // Then by date
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ];

        const volumeStats = await Ticket.aggregate(volumePipeline);

        // Format data for frontend
        const stats = {
            total: totalTickets,
            status: statusStats.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
            priority: priorityStats.map(p => ({ name: p._id, value: p.count })),
            volume: volumeStats.map(v => ({ date: v._id, tickets: v.count }))
        };

        res.status(200).json({
            status: 'success',
            data: { stats }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
