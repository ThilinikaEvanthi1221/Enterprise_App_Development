const mongoose = require("mongoose");
require("dotenv").config();

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

async function seedRatings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/vehicle_service");
    console.log("Connected to MongoDB");

    // Check if ratings already exist
    const existingCount = await Rating.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️ Found ${existingCount} existing ratings. Clearing...`);
      await Rating.deleteMany({});
    }

    // Generate and insert sample ratings
    const sampleRatings = generateSampleRatings(120);
    await Rating.insertMany(sampleRatings);
    
    console.log(`✅ Successfully seeded ${sampleRatings.length} ratings!`);
    
    // Show summary
    const summary = await Rating.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$overallRating' },
          total: { $sum: 1 }
        }
      }
    ]);
    
    console.log(`📊 Average Rating: ${summary[0].avgRating.toFixed(2)}`);
    console.log(`📝 Total Reviews: ${summary[0].total}`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding ratings:", error);
    process.exit(1);
  }
}

seedRatings();
