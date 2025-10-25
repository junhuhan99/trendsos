// 단일 이미지 업로드
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // 파일 URL 생성
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.json({
      message: '이미지가 업로드되었습니다.',
      url: fileUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ message: '이미지 업로드에 실패했습니다.' });
  }
};

// 다중 이미지 업로드
exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: '파일이 업로드되지 않았습니다.' });
    }

    // 파일 URL 배열 생성
    const fileUrls = req.files.map(file => ({
      url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
      filename: file.filename,
    }));

    res.json({
      message: '이미지들이 업로드되었습니다.',
      files: fileUrls,
    });
  } catch (error) {
    console.error('Upload images error:', error);
    res.status(500).json({ message: '이미지 업로드에 실패했습니다.' });
  }
};
