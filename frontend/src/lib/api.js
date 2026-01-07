import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('workdesks_token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response) => {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }
    return data;
};

export const api = {
    // Auth
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    register: async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Tickets
    getTickets: async () => {
        try {
            const response = await fetch(`${API_URL}/tickets`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get tickets error:', error);
            throw error;
        }
    },

    getTicket: async (id) => {
        try {
            const response = await fetch(`${API_URL}/tickets/${id}`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get ticket error:', error);
            throw error;
        }
    },

    createTicket: async (ticketData) => {
        try {
            const response = await fetch(`${API_URL}/tickets`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(ticketData),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Create ticket error:', error);
            throw error;
        }
    },

    updateTicket: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/tickets/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Update ticket error:', error);
            throw error;
        }
    },

    addComment: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/tickets/${id}/comments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Add comment error:', error);
            throw error;
        }
    },

    // Users/Agents (if needed later)
    getAgents: async () => {
        // This endpoint might need to be created on backend or use existing user logic
        // For now we might need to rely on what we have or add an endpoint
        return [];
    }
};
