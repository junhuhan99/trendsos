const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  linkUrl: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    enum: ['top-banner', 'sidebar-left', 'sidebar-right', 'content-top', 'content-middle', 'content-bottom', 'hero-slider'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  impressions: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// 광고가 현재 활성화 상태인지 확인
adSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive &&
         this.status === 'approved' &&
         this.startDate <= now &&
         this.endDate >= now;
};

// 노출수 증가
adSchema.methods.incrementImpressions = async function() {
  this.impressions += 1;
  await this.save();
};

// 클릭수 증가
adSchema.methods.incrementClicks = async function() {
  this.clicks += 1;
  await this.save();
};

module.exports = mongoose.model('Ad', adSchema);
