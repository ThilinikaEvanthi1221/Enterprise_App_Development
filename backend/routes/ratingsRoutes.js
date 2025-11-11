const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { verifyToken } = require("../middleware/authMiddleware");

// Rating Schema
const RatingSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, index: true },
    vehicleNo: { type: String, required: true, index: true },
    serviceType: { type: String, required: true, index: true },
    date: { type: Date, required: true, index: true },
    overallRating: { type: Number, required: true, min: 1, max: 5 },
    serviceQuality: { type: Number, min: 1, max: 5, default: 0 },
    timeliness: { type: Number, min: 1, max: 5, default: 0 },
    professionalism: { type: Number, min: 1, max: 5, default: 0 },
    pricingTransparency: { type: Number, min: 1, max: 5, default: 0 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

const Rating = mongoose.models.Rating || mongoose.model('Rating', RatingSchema);

// Apply authentication to all routes
router.use(verifyToken);

// Get all ratings with pagination and filters
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'date', sortOrder = 'desc', dateFrom, dateTo, minRating, maxRating, serviceType } = req.query;
    const query = {};
    
    if (search) {
      const pattern = new RegExp(search, 'i');
      query.$or = [{ customerName: pattern }, { vehicleNo: pattern }, { comment: pattern }];
    }
    
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }
    
    if (minRating || maxRating) {
      query.overallRating = {};
      if (minRating) query.overallRating.$gte = Number(minRating);
      if (maxRating) query.overallRating.$lte = Number(maxRating);
    }
    
    if (serviceType) query.serviceType = serviceType;

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const [items, total] = await Promise.all([
      Rating.find(query).sort(sort).skip((page - 1) * limit).limit(Number(limit)),
      Rating.countDocuments(query)
    ]);
    
    res.json({ page: Number(page), limit: Number(limit), total, items });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get ratings summary
router.get("/summary", async (req, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [kpis] = await Rating.aggregate([
      {
        $facet: {
          all: [
            { 
              $group: { 
                _id: null, 
                total: { $sum: 1 }, 
                avgOverall: { $avg: '$overallRating' }, 
                positive: { $sum: { $cond: [{ $gte: ['$overallRating', 4] }, 1, 0] } } 
              } 
            }
          ],
          month: [ 
            { $match: { date: { $gte: monthStart } } }, 
            { $count: 'count' } 
          ],
          breakdown: [
            { 
              $group: { 
                _id: null, 
                serviceQuality: { $avg: '$serviceQuality' }, 
                timeliness: { $avg: '$timeliness' }, 
                professionalism: { $avg: '$professionalism' }, 
                pricingTransparency: { $avg: '$pricingTransparency' }, 
                overallSatisfaction: { $avg: '$overallRating' } 
              } 
            }
          ]
        }
      }
    ]);
    
    const all = kpis.all[0] || { total: 0, avgOverall: 0, positive: 0 };
    const breakdown = kpis.breakdown[0] || { 
      serviceQuality: 0, 
      timeliness: 0, 
      professionalism: 0, 
      pricingTransparency: 0, 
      overallSatisfaction: 0 
    };
    const servicesThisMonth = kpis.month[0]?.count || 0;
    
    res.json({
      averageOverallRating: Number(all.avgOverall?.toFixed(1) || 0),
      totalFeedbacks: all.total,
      servicesRatedThisMonth: servicesThisMonth,
      positiveReviewPercent: all.total ? Math.round((all.positive / all.total) * 100) : 0,
      breakdown
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create a new rating
router.post("/", async (req, res) => {
  try {
    const rating = await Rating.create(req.body);
    res.status(201).json(rating);
  } catch (error) {
    console.error('Error creating rating:', error);
    res.status(400).json({ success: false, message: error.message });
  }
});

// Seed sample data
router.post("/seed", async (req, res) => {
  try {
    const sample = generateSampleRatings(120);
    await Rating.deleteMany({});
    await Rating.insertMany(sample);
    res.json({ success: true, inserted: sample.length });
  } catch (error) {
    console.error('Error seeding ratings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get rating by ID
router.get("/:id", async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }
    res.json({ success: true, data: rating });
  } catch (error) {
    console.error('Error fetching rating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update rating
router.put("/:id", async (req, res) => {
  try {
    const rating = await Rating.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!rating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }
    res.json({ success: true, data: rating });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete rating
router.delete("/:id", async (req, res) => {
  try {
    const rating = await Rating.findByIdAndDelete(req.params.id);
    if (!rating) {
      return res.status(404).json({ success: false, message: "Rating not found" });
    }
    res.json({ success: true, message: "Rating deleted" });
  } catch (error) {
    console.error('Error deleting rating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function to generate sample ratings
function randomInt(min, max) { 
  return Math.floor(Math.random() * (max - min + 1)) + min; 
}

function generateSampleRatings(count) {
  const names = ['Devon Lane', 'Kathryn Murphy', 'Courtney Henry', 'Guy Hawkins', 'Eleanor Pena', 'John Smith', 'Jane Doe', 'Mike Johnson'];
  const services = ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Diagnostics', 'AC Repair', 'Battery Replacement', 'Transmission Service'];
  const comments = [
    'Quick and friendly!', 
    'Great service and professional staff.', 
    'Could be faster but overall satisfied.', 
    'Transparent pricing. Will return.', 
    'Not happy with the wait time.',
    'Excellent work, highly recommend!',
    'Very thorough inspection.',
    'Fair prices and honest service.'
  ];
  const today = new Date();
  const arr = [];
  
  for (let i = 0; i < count; i++) {
    const overall = randomInt(3, 5);
    arr.push({
      customerName: names[randomInt(0, names.length - 1)],
      vehicleNo: `CAD-${randomInt(1000, 9999)}`,
      serviceType: services[randomInt(0, services.length - 1)],
      date: new Date(today.getTime() - randomInt(0, 90) * 24 * 60 * 60 * 1000),
      overallRating: overall,
      serviceQuality: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      timeliness: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      professionalism: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      pricingTransparency: Math.max(1, Math.min(5, overall + randomInt(-1, 1))),
      comment: comments[randomInt(0, comments.length - 1)]
    });
  }
  return arr;
}

module.exports = router;
