import api from './api';

// Ticket Service
const ticketService = {
    // Get all tickets
    getAllTickets: async (filters = {}) => {
        const response = await api.get('/tickets', { params: filters });
        return response.data;
    },

    // Get single ticket by ID
    getTicketById: async (id) => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    // Create new ticket
    createTicket: async (ticketData) => {
        console.log('🔵 Inside ticketService.createTicket, about to call api.post');
        console.log('🔵 ticketData:', ticketData);
        console.log('🔵 api object:', api);
        try {
            const response = await api.post('/tickets', ticketData);
            console.log('🔵 API response received:', response);
            return response.data;
        } catch (err) {
            console.error('🔴 Error in ticketService.createTicket:', err);
            throw err;
        }
    },

    // Update ticket
    updateTicket: async (id, ticketData) => {
        const response = await api.put(`/tickets/${id}`, ticketData);
        return response.data;
    },

    // Delete ticket
    deleteTicket: async (id) => {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },

    // Add comment to ticket
    addComment: async (ticketId, commentData) => {
        const response = await api.post(`/tickets/${ticketId}/comments`, commentData);
        return response.data;
    },

    // Update ticket status
    updateStatus: async (ticketId, status) => {
        const response = await api.patch(`/tickets/${ticketId}/status`, { status });
        return response.data;
    },

    // Assign ticket to agent
    assignTicket: async (ticketId, agentId) => {
        const response = await api.patch(`/tickets/${ticketId}/assign`, { agentId });
        return response.data;
    },
};

export default ticketService;
