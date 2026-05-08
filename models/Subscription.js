const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    category: {
        type: String,
        enum: ['Entertainment', 'Utilities', 'Software', 'Health', 'Other'],
        default: 'Other'
    },
    usageStatus: {
        type: String,
        enum: ['Active', 'Rarely Used', 'Unused'],
        default: 'Active'
    },
    nextRenewal: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
