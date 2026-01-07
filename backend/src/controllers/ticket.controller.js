import Ticket from '../models/Ticket.model.js';

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res) => {
    try {
        const { status, priority, assignedTo } = req.query;

        // Build query
        let query = {};

        // Filter by role
        if (req.user.role === 'customer') {
            query.createdBy = req.user.id;
        } else if (req.user.role === 'agent') {
            query.$or = [
                { assignedTo: req.user.id },
                { assignedTo: null },
                { assignedTo: { $exists: false } }
            ];
        }

        // Additional filters
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (assignedTo) query.assignedTo = assignedTo;

        const tickets = await Ticket.find(query)
            .populate('createdBy', 'name email')
            .populate('assignedTo', 'name email')
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
        const ticketData = {
            ...req.body,
            createdBy: req.user.id
        };

        const ticket = await Ticket.create(ticketData);

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
        const { message, isInternal } = req.body;

        const ticket = await Ticket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({
                status: 'error',
                message: 'Ticket not found'
            });
        }

        const comment = {
            user: req.user.id,
            message,
            isInternal: isInternal || false,
            createdAt: Date.now()
        };

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
