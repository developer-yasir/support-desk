import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a company name'],
        trim: true
    },
    type: {
        type: String,
        enum: ['main-company', 'client-company'],
        default: 'client-company'
    },
    domain: {
        type: String,
        trim: true
    },
    industry: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    logo: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Enforce unique company name per user
companySchema.index({ name: 1, createdBy: 1 }, { unique: true });

const Company = mongoose.model('Company', companySchema);

export default Company;
