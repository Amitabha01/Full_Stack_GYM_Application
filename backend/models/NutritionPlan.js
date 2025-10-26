import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  name: String,
  time: String,
  foods: [{
    item: String,
    quantity: String,
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
  }],
  totalCalories: Number
});

const nutritionPlanSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  goal: {
    type: String,
    enum: ['weight-loss', 'muscle-gain', 'maintenance', 'athletic-performance'],
    required: true
  },
  dailyCalorieTarget: {
    type: Number,
    required: true
  },
  macroTargets: {
    protein: Number, // grams
    carbs: Number,
    fats: Number
  },
  meals: [mealSchema],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  notes: String,
  supplements: [String]
}, {
  timestamps: true
});

const NutritionPlan = mongoose.model('NutritionPlan', nutritionPlanSchema);

export default NutritionPlan;
