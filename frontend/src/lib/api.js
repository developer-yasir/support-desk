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

    register: async (data) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    },

    // Tickets
    getTickets: async (params = {}) => {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await fetch(`${API_URL}/tickets?${queryString}`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get tickets error:', error);
            throw error;
        }
    },

    getDashboardStats: async () => {
        try {
            const response = await fetch(`${API_URL}/tickets/stats`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get stats error:', error);
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

    forwardTicket: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/tickets/${id}/forward`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Forward ticket error:', error);
            throw error;
        }
    },

    // Users/Agents (if needed later)
    // Companies
    getCompanies: async () => {
        try {
            const response = await fetch(`${API_URL}/companies`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get companies error:', error);
            throw error;
        }
    },

    createCompany: async (data) => {
        try {
            const response = await fetch(`${API_URL}/companies`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Create company error:', error);
            throw error;
        }
    },

    updateCompany: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/companies/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Update company error:', error);
            throw error;
        }
    },

    deleteCompany: async (id) => {
        try {
            const response = await fetch(`${API_URL}/companies/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Delete company error:', error);
            throw error;
        }
    },

    // Contacts (Users)
    getContacts: async (params = {}) => {
        try {
            const queryString = new URLSearchParams({ role: 'customer', ...params }).toString();
            const response = await fetch(`${API_URL}/users?${queryString}`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get contacts error:', error);
            throw error;
        }
    },

    createContact: async (data) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Create contact error:', error);
            throw error;
        }
    },

    updateContact: async (id, data) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Update contact error:', error);
            throw error;
        }
    },

    deleteContact: async (id) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Delete contact error:', error);
            throw error;
        }
    },

    // Reports
    getReportData: async (range) => {
        try {
            const response = await fetch(`${API_URL}/reports/dashboard?range=${range}`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get report data error:', error);
            throw error;
        }
    },

    getAgents: async () => {
        try {
            const response = await fetch(`${API_URL}/users?role=agent`, {
                method: 'GET',
                headers: getHeaders(),
            });
            return handleResponse(response);
        } catch (error) {
            console.error('Get agents error:', error);
            throw error;
        }
    }
};
