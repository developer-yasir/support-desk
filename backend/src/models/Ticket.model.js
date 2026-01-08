import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    ticketNumber: {
        type: String,
        unique: true
    },
    subject: {
        type: String,
        required: [true, 'Please provide a subject'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide a description']
    },
    status: {
        type: String,
        enum: ['open', 'pending', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        default: 'General'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    company: {
        type: String,
        default: ''
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    tags: [{
        type: String
    }],
    attachments: [{
        filename: String,
        url: String,
        uploadedAt: Date
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        to: [String], // Array of email addresses
        cc: [String], // Array of email addresses
        isInternal: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        attachments: [{
            filename: String,
            url: String,
            uploadedAt: Date
        }]
    }],
    dueDate: {
        type: Date
    },
    resolvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Auto-generate ticket number
ticketSchema.pre('save', async function (next) {
    if (!this.ticketNumber) {
        const count = await mongoose.model('Ticket').countDocuments();
        this.ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
