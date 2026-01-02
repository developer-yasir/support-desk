import express from 'express';
import {
    getTickets,
    getTicket,
    createTicket,
    updateTicket,
    deleteTicket
} from '../controllers/ticket.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/tickets
// @desc    Get all tickets
// @access  Private
router.get('/', getTickets);

// @route   GET /api/tickets/:id
// @desc    Get single ticket
// @access  Private
router.get('/:id', getTicket);

// @route   POST /api/tickets
// @desc    Create new ticket
// @access  Private
router.post('/', createTicket);

// @route   PUT /api/tickets/:id
// @desc    Update ticket
// @access  Private
router.put('/:id', updateTicket);

// @route   DELETE /api/tickets/:id
// @desc    Delete ticket
// @access  Private
router.delete('/:id', deleteTicket);

export default router;
