const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/reports/summary
router.get('/summary', protect, async (req, res) => {
  try {
    const [totalLost, totalFound, totalMatched, totalReturned, totalUsers] = await Promise.all([
      Item.countDocuments({ type: 'lost' }),
      Item.countDocuments({ type: 'found' }),
      Item.countDocuments({ status: 'matched' }),
      Item.countDocuments({ status: 'returned' }),
      User.countDocuments({ role: 'user' })
    ]);

    // Last 7 days activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentLost = await Item.countDocuments({ type: 'lost', createdAt: { $gte: sevenDaysAgo } });
    const recentFound = await Item.countDocuments({ type: 'found', createdAt: { $gte: sevenDaysAgo } });

    // Category breakdown by location
    const locationStats = await Item.aggregate([
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Monthly trend last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await Item.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, type: '$type' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      totalLost, totalFound, totalMatched, totalReturned, totalUsers,
      recentLost, recentFound,
      locationStats,
      monthlyTrend,
      successRate: totalLost > 0 ? Math.round((totalReturned / totalLost) * 100) : 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
