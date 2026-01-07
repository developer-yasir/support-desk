import Company from '../models/Company.model.js';
import User from '../models/User.model.js';

// @desc    Get all companies
// @route   GET /api/companies
// @access  Private
export const getCompanies = async (req, res) => {
    try {
        let query = {};

        // If manager, only show their own company OR companies they created
        if (req.user.role === 'manager') {
            query.$or = [
                { _id: req.user.company },
                { createdBy: req.user.id }
            ];
        }

        const companies = await Company.find(query).sort({ createdAt: -1 });
        res.status(200).json({
            status: 'success',
            data: { companies }
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
        const { name, domain, industry, notes } = req.body;

        const companyExists = await Company.findOne({ name });

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

        const updatedCompany = await Company.findByIdAndUpdate(
            req.params.id,
            req.body,
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
