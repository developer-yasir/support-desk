import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import Ticket from '../models/Ticket.model.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { testEmailConfig } from '../services/email.service.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
export const getCompanies = async (req, res) => {
    try {
        const { type } = req.query;
        let query = {};

        // If manager, only show their own company OR companies they created
        if (req.user.role === 'manager') {
            const managerFilter = {
                $or: [
                    { _id: req.user.company },
                    { createdBy: req.user.id }
                ]
            };

            // If type filter is provided, combine it with manager filter
            if (type) {
                query = {
                    $and: [
                        managerFilter,
                        { type: type }
                    ]
                };
            } else {
                query = managerFilter;
            }
        } else {
            // For super admin, just apply type filter if provided
            if (type) {
                query.type = type;
            }
        }

        const companies = await Company.find(query).sort({ createdAt: -1 });

        // Add statistics for each company
        const companiesWithStats = await Promise.all(companies.map(async (company) => {
            const companyObj = company.toObject();

            // Count tickets for this company
            const ticketCount = await Ticket.countDocuments({ companyId: company._id });

            // Count agents (users with role 'agent' in this company)
            const agentCount = await User.countDocuments({
                company: company._id,
                role: 'agent'
            });

            // Count contacts (users with role 'customer' in this company)
            const contactCount = await User.countDocuments({
                company: company._id,
                role: 'customer'
            });

            return {
                ...companyObj,
                ticketCount,
                agentCount,
                contactCount
            };
        }));

        res.status(200).json({
            status: 'success',
            data: { companies: companiesWithStats }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get single company
// @route   GET /api/companies/:id
// @access  Private
export const getCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { company }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Create new company
// @route   POST /api/companies
// @access  Private/Manager
export const createCompany = async (req, res) => {
    try {
        const { name, domain, industry, notes, type } = req.body;

        const companyExists = await Company.findOne({
            name,
            createdBy: req.user.id
        });

        if (companyExists) {
            return res.status(400).json({
                status: 'error',
                message: 'Company already exists'
            });
        }

        const company = await Company.create({
            name,
            domain,
            industry,
            notes,
            type: type || 'client-company',
            createdBy: req.user.id
        });

        res.status(201).json({
            status: 'success',
            data: { company }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update company
// @route   PUT /api/companies/:id
// @access  Private/Manager
export const updateCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // If domain and industry are provided, mark setup as completed
        const updateData = { ...req.body };
        if (updateData.domain && updateData.industry && !company.setupCompleted) {
            updateData.setupCompleted = true;
        }

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            status: 'success',
            data: { company: updatedCompany }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Delete company
// @route   DELETE /api/companies/:id
// @access  Private/Manager
export const deleteCompany = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // Check if company has associated users
        const hasUsers = await User.exists({ company: req.params.id });
        if (hasUsers) {
            return res.status(400).json({
                status: 'error',
                message: 'Cannot delete company with associated users. Please reassign or delete the users first.'
            });
        }

        await company.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'Company deleted'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update company email configuration
// @route   PUT /api/companies/:id/email-config
// @access  Private (Manager of the company)
export const updateEmailConfig = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'superadmin' &&
            req.user.company?.toString() !== req.params.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this company'
            });
        }

        const { enabled, host, port, secure, user, pass, from, notifications } = req.body;

        // Encrypt password if provided
        const emailConfig = {
            enabled: enabled || false,
            host,
            port,
            secure,
            user,
            from,
            notifications: notifications || {}
        };

        // Only encrypt and update password if a new one is provided
        if (pass) {
            emailConfig.pass = encrypt(pass);
        } else if (company.emailConfig?.pass) {
            // Keep existing encrypted password if no new password provided
            emailConfig.pass = company.emailConfig.pass;
        }

        company.emailConfig = emailConfig;
        await company.save();

        // Return config without password
        const safeConfig = {
            ...company.emailConfig.toObject(),
            pass: undefined
        };

        res.status(200).json({
            status: 'success',
            data: { emailConfig: safeConfig }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Test email configuration
// @route   POST /api/companies/:id/test-email
// @access  Private (Manager of the company)
export const testEmail = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({
                status: 'error',
                message: 'Company not found'
            });
        }

        // Check authorization
        if (req.user.role !== 'superadmin' &&
            req.user.company?.toString() !== req.params.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to test this company email'
            });
        }

        const { testRecipient } = req.body;

        if (!testRecipient) {
            return res.status(400).json({
                status: 'error',
                message: 'Test recipient email is required'
            });
        }

        // Decrypt password for testing
        const emailConfig = {
            host: company.emailConfig.host,
            port: company.emailConfig.port,
            secure: company.emailConfig.secure,
            user: company.emailConfig.user,
            pass: decrypt(company.emailConfig.pass),
            from: company.emailConfig.from
        };

        const result = await testEmailConfig(emailConfig, testRecipient);

        res.status(result.success ? 200 : 400).json({
            status: result.success ? 'success' : 'error',
            message: result.message
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
