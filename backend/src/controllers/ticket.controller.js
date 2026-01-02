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
            query.assignedTo = req.user.id;
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
