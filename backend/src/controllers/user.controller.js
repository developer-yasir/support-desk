import User from '../models/User.model.js';
import Company from '../models/Company.model.js';

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin/Manager)
export const getUsers = async (req, res) => {
    try {
        const { role, companyId } = req.query;
        let query = {};

        if (role) {
            // Support comma-separated roles
            const roles = role.split(',');
            if (roles.length > 1) {
                query.role = { $in: roles };
            } else {
                query.role = role;
            }
        }

        // If manager, force query to their company and its client companies
        if (req.user.role === 'company_manager') {
            const companyId = req.user.company._id || req.user.company;
            const userCompany = await Company.findById(companyId);
            let companyIds = [companyId];

            if (userCompany && userCompany.type === 'main-company') {
                const clientCompanies = await Company.find({ parentCompany: userCompany._id });
                companyIds = [...companyIds, ...clientCompanies.map(c => c._id)];
            }

            query.company = { $in: companyIds };
        } else if (companyId) {
            query.company = companyId;
        }

        const users = await User.find(query)
            .select('-password')
            .populate('company', 'name domain');

        res.status(200).json({
            status: 'success',
            results: users.length,
            data: { users }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Create new user (admin/manager)
// @route   POST /api/users
// @access  Private (Admin/Manager)
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, company, phone, jobTitle } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        let userRole = role || 'customer';
        let userCompany = company;

        // Security check for Managers
        if (req.user.role === 'company_manager') {
            // Managers can only create users for their own company
            userCompany = req.user.company;

            // Managers can only create 'agent' or 'customer' roles
            if (!['agent', 'customer'].includes(userRole)) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Managers can only create Agents or Customers'
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password: password || '123456', // Default password if not provided
            role: userRole,
            company: userCompany,
            phone,
            jobTitle
        });

        res.status(201).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('company', 'name domain');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
export const updateUser = async (req, res) => {
    try {
        // Check if user is updating their own profile or is admin
        if (req.params.id !== req.user.id.toString() &&
            !['super_admin', 'admin', 'company_manager'].includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to update this user'
            });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            status: 'success',
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
