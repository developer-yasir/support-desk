import express from 'express';
import {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
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

export default router;
