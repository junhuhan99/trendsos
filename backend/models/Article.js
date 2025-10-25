const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['개발', 'AI', 'IT서비스', '기획', '디자인', '비즈니스', '프로덕트', '커리어', '트렌드', '스타트업'],
  },
  thumbnail: {
    type: String,
    default: '',
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  featured: {
    type: Boolean,
    default: false,
  },
  readTime: {
    type: Number,
    default: 5,
  },
  isNew: {
    type: Boolean,
    default: true,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
  // SEO 필드
  slug: {
    type: String,
    unique: true,
    sparse: true,
  },
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
  metaKeywords: {
    type: [String],
    default: [],
  },
  ogImage: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Slug 생성 (제목을 URL 친화적으로 변환)
articleSchema.methods.generateSlug = function() {
  const baseSlug = this.title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);

  const timestamp = Date.now().toString(36);
  this.slug = `${baseSlug}-${timestamp}`;
};

// 저장 전에 slug 자동 생성
articleSchema.pre('save', function(next) {
  if (this.isNew && !this.slug) {
    this.generateSlug();
  }

  // 메타 필드 자동 설정
  if (!this.metaTitle) {
    this.metaTitle = this.title;
  }
  if (!this.metaDescription) {
    this.metaDescription = this.summary;
  }
  if (!this.ogImage) {
    this.ogImage = this.thumbnail;
  }

  next();
});

// 조회수 증가
articleSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

module.exports = mongoose.model('Article', articleSchema);
