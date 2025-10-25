const User = require('../models/User');
const Article = require('../models/Article');

// 작가 신청
exports.applyAuthor = async (req, res) => {
  try {
    const { authorBio, authorCategory } = req.body;

    const user = await User.findById(req.user._id);

    if (user.isAuthor) {
      return res.status(400).json({ message: '이미 작가로 등록되어 있습니다.' });
    }

    if (user.authorStatus === 'pending') {
      return res.status(400).json({ message: '작가 신청이 이미 진행 중입니다.' });
    }

    user.authorBio = authorBio;
    user.authorCategory = authorCategory;
    user.authorStatus = 'pending';

    await user.save();

    res.json({
      message: '작가 신청이 완료되었습니다. 관리자 승인을 기다려주세요.',
      user: {
        id: user._id,
        authorStatus: user.authorStatus,
      },
    });
  } catch (error) {
    console.error('Apply author error:', error);
    res.status(500).json({ message: '작가 신청에 실패했습니다.' });
  }
};

// 작가 신청 승인/거부 (관리자)
exports.approveAuthor = async (req, res) => {
  try {
    const { userId, status } = req.body; // status: 'approved' or 'rejected'

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    if (status === 'approved') {
      user.isAuthor = true;
      user.authorStatus = 'approved';
    } else {
      user.authorStatus = 'rejected';
    }

    await user.save();

    res.json({
      message: status === 'approved' ? '작가가 승인되었습니다.' : '작가 신청이 거부되었습니다.',
      user: {
        id: user._id,
        name: user.name,
        isAuthor: user.isAuthor,
        authorStatus: user.authorStatus,
      },
    });
  } catch (error) {
    console.error('Approve author error:', error);
    res.status(500).json({ message: '작가 승인 처리에 실패했습니다.' });
  }
};

// 작가 신청 목록 (관리자)
exports.getPendingAuthors = async (req, res) => {
  try {
    const pendingAuthors = await User.find({ authorStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ authors: pendingAuthors });
  } catch (error) {
    console.error('Get pending authors error:', error);
    res.status(500).json({ message: '작가 신청 목록을 불러올 수 없습니다.' });
  }
};

// 작가 목록
exports.getAuthors = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;

    const query = { isAuthor: true };
    if (category) query.authorCategory = category;

    const skip = (page - 1) * limit;

    const authors = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // 각 작가의 게시글 수와 팔로워 수 추가
    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const articleCount = await Article.countDocuments({ author: author._id });
        return {
          ...author.toObject(),
          articleCount,
          followerCount: author.followers.length,
        };
      })
    );

    const total = await User.countDocuments(query);

    res.json({
      authors: authorsWithStats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({ message: '작가 목록을 불러올 수 없습니다.' });
  }
};

// 작가 상세 정보
exports.getAuthor = async (req, res) => {
  try {
    const author = await User.findById(req.params.id).select('-password');

    if (!author || !author.isAuthor) {
      return res.status(404).json({ message: '작가를 찾을 수 없습니다.' });
    }

    // 작가의 게시글 목록
    const articles = await Article.find({ author: author._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const articleCount = await Article.countDocuments({ author: author._id });

    res.json({
      author: {
        ...author.toObject(),
        articleCount,
        followerCount: author.followers.length,
        followingCount: author.following.length,
      },
      articles,
    });
  } catch (error) {
    console.error('Get author error:', error);
    res.status(500).json({ message: '작가 정보를 불러올 수 없습니다.' });
  }
};

// 팔로우/언팔로우
exports.toggleFollow = async (req, res) => {
  try {
    const authorId = req.params.id;
    const userId = req.user._id;

    if (authorId === userId.toString()) {
      return res.status(400).json({ message: '자기 자신을 팔로우할 수 없습니다.' });
    }

    const author = await User.findById(authorId);
    const user = await User.findById(userId);

    if (!author) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const isFollowing = user.following.includes(authorId);

    if (isFollowing) {
      // 언팔로우
      user.following = user.following.filter(id => id.toString() !== authorId);
      author.followers = author.followers.filter(id => id.toString() !== userId.toString());
    } else {
      // 팔로우
      user.following.push(authorId);
      author.followers.push(userId);
    }

    await user.save();
    await author.save();

    res.json({
      message: isFollowing ? '언팔로우했습니다.' : '팔로우했습니다.',
      isFollowing: !isFollowing,
      followerCount: author.followers.length,
    });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({ message: '팔로우 처리에 실패했습니다.' });
  }
};

// 팔로잉 목록
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('following', 'name email avatar bio isAuthor authorCategory');

    res.json({ following: user.following });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ message: '팔로잉 목록을 불러올 수 없습니다.' });
  }
};

// 팔로워 목록
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id || req.user._id)
      .populate('followers', 'name email avatar bio');

    res.json({ followers: user.followers });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ message: '팔로워 목록을 불러올 수 없습니다.' });
  }
};
