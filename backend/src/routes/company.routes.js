import express from 'express';
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany,
    updateEmailConfig,
    testEmail
} from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
    .get(getCompanies)
    .post(authorize('manager', 'admin', 'super_admin'), createCompany);

router.route('/:id')
    .get(getCompany)
    .put(authorize('manager', 'admin', 'super_admin'), updateCompany)
    .delete(authorize('manager', 'admin', 'super_admin'), deleteCompany);

// Email configuration routes
router.route('/:id/email-config')
    .put(authorize('manager', 'admin', 'super_admin'), updateEmailConfig);

router.route('/:id/test-email')
    .post(authorize('manager', 'admin', 'super_admin'), testEmail);

export default router;
