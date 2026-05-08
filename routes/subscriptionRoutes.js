const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const authMiddleware = require('../middleware/authMiddleware');

// Get all subscriptions for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ userId: req.user.userId }).sort({ nextRenewal: 1 });
        res.json(subscriptions);
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Add a new subscription
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, price, billingCycle, category, nextRenewal, usageStatus } = req.body;
        
        const newSub = new Subscription({
            userId: req.user.userId,
            name,
            price,
            billingCycle,
            category,
            nextRenewal,
            usageStatus: usageStatus || 'Active'
        });

        await newSub.save();
        res.status(201).json(newSub);
    } catch (err) {
        res.status(400).json({ message: 'Error adding subscription' });
    }
});

// Update a subscription
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const sub = await Subscription.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        if (!sub) return res.status(404).json({ message: 'Subscription not found' });
        res.json(sub);
    } catch (err) {
        res.status(400).json({ message: 'Error updating subscription' });
    }
});

// Delete a subscription
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const sub = await Subscription.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        if (!sub) return res.status(404).json({ message: 'Subscription not found' });
        res.json({ message: 'Subscription deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// Analytics Dashboard Endpoint
router.get('/analytics', authMiddleware, async (req, res) => {
    try {
        const subs = await Subscription.find({ userId: req.user.userId, isActive: true });
        
        let monthlyTotal = 0;
        let yearlyWastedTotal = 0;
        const categoryBreakdown = {};

        subs.forEach(sub => {
            const monthlyPrice = sub.billingCycle === 'yearly' ? sub.price / 12 : sub.price;
            monthlyTotal += monthlyPrice;
            
            const yearlyPrice = monthlyPrice * 12;

            if (sub.usageStatus === 'Unused') {
                yearlyWastedTotal += yearlyPrice;
            } else if (sub.usageStatus === 'Rarely Used') {
                yearlyWastedTotal += yearlyPrice * 0.5; // assuming 50% wasted
            }

            if (!categoryBreakdown[sub.category]) {
                categoryBreakdown[sub.category] = 0;
            }
            categoryBreakdown[sub.category] += monthlyPrice;
        });

        let healthScore = 100;
        if (monthlyTotal > 0) {
            const yearlyTotal = monthlyTotal * 12;
            const utilized = yearlyTotal - yearlyWastedTotal;
            healthScore = Math.round((utilized / yearlyTotal) * 100);
        }

        res.json({
            monthlyTotal: monthlyTotal.toFixed(2),
            yearlyTotal: (monthlyTotal * 12).toFixed(2),
            fiveYearTotal: (monthlyTotal * 12 * 5).toFixed(2),
            moneyWastedThisYear: yearlyWastedTotal.toFixed(2),
            healthScore,
            categoryBreakdown
        });
    } catch (err) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
