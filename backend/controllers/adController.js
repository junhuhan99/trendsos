const Ad = require('../models/Ad');

// 광고 목록 조회 (승인된 활성 광고만)
exports.getActiveAds = async (req, res) => {
  try {
    const { position } = req.query;

    const now = new Date();
    const query = {
      status: 'approved',
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    };

    if (position) {
      query.position = position;
    }

    const ads = await Ad.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    console.error('Get active ads error:', error);
    res.status(500).json({ message: '광고를 불러올 수 없습니다.' });
  }
};

// 모든 광고 조회 (관리자용)
exports.getAllAds = async (req, res) => {
  try {
    const { status, position } = req.query;

    const query = {};
    if (status) query.status = status;
    if (position) query.position = position;

    const ads = await Ad.find(query)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    console.error('Get all ads error:', error);
    res.status(500).json({ message: '광고를 불러올 수 없습니다.' });
  }
};

// 내 광고 목록 조회
exports.getMyAds = async (req, res) => {
  try {
    const ads = await Ad.find({ owner: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    console.error('Get my ads error:', error);
    res.status(500).json({ message: '광고를 불러올 수 없습니다.' });
  }
};

// 광고 등록
exports.createAd = async (req, res) => {
  try {
    const { title, description, imageUrl, linkUrl, position, startDate, endDate } = req.body;

    // 날짜 유효성 검증
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: '종료일은 시작일보다 늦어야 합니다.' });
    }

    const ad = new Ad({
      title,
      description,
      imageUrl,
      linkUrl,
      position,
      startDate,
      endDate,
      owner: req.user._id,
    });

    await ad.save();

    const populatedAd = await Ad.findById(ad._id)
      .populate('owner', 'name email');

    res.status(201).json({
      message: '광고가 등록되었습니다. 관리자 승인 후 게시됩니다.',
      ad: populatedAd,
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ message: '광고 등록에 실패했습니다.' });
  }
};

// 광고 수정
exports.updateAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    // 소유자이거나 관리자만 수정 가능
    if (req.user.role !== 'admin' && ad.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    const { title, description, imageUrl, linkUrl, position, startDate, endDate, isActive } = req.body;

    if (title !== undefined) ad.title = title;
    if (description !== undefined) ad.description = description;
    if (imageUrl !== undefined) ad.imageUrl = imageUrl;
    if (linkUrl !== undefined) ad.linkUrl = linkUrl;
    if (position !== undefined) ad.position = position;
    if (startDate !== undefined) ad.startDate = startDate;
    if (endDate !== undefined) ad.endDate = endDate;
    if (isActive !== undefined && req.user.role === 'admin') ad.isActive = isActive;

    // 수정 시 다시 승인 대기 상태로 (관리자가 아닌 경우)
    if (req.user.role !== 'admin') {
      ad.status = 'pending';
    }

    await ad.save();

    const populatedAd = await Ad.findById(ad._id)
      .populate('owner', 'name email');

    res.json({
      message: '광고가 수정되었습니다.',
      ad: populatedAd,
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ message: '광고 수정에 실패했습니다.' });
  }
};

// 광고 삭제
exports.deleteAd = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    // 소유자이거나 관리자만 삭제 가능
    if (req.user.role !== 'admin' && ad.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: '권한이 없습니다.' });
    }

    await Ad.findByIdAndDelete(req.params.id);

    res.json({ message: '광고가 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ message: '광고 삭제에 실패했습니다.' });
  }
};

// 광고 승인/거부 (관리자 전용)
exports.approveAd = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: '유효하지 않은 상태입니다.' });
    }

    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    ad.status = status;
    await ad.save();

    res.json({
      message: status === 'approved' ? '광고가 승인되었습니다.' : '광고가 거부되었습니다.',
      ad,
    });
  } catch (error) {
    console.error('Approve ad error:', error);
    res.status(500).json({ message: '광고 승인 처리에 실패했습니다.' });
  }
};

// 광고 노출수 증가
exports.incrementImpressions = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    await ad.incrementImpressions();

    res.json({ impressions: ad.impressions });
  } catch (error) {
    console.error('Increment impressions error:', error);
    res.status(500).json({ message: '노출수 증가에 실패했습니다.' });
  }
};

// 광고 클릭수 증가
exports.incrementClicks = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: '광고를 찾을 수 없습니다.' });
    }

    await ad.incrementClicks();

    res.json({ clicks: ad.clicks });
  } catch (error) {
    console.error('Increment clicks error:', error);
    res.status(500).json({ message: '클릭수 증가에 실패했습니다.' });
  }
};
