# 트렌드OS 배포 완료

## 배포 정보

### 서버 정보
- **EC2 IP**: 15.165.30.90
- **Frontend URL**: http://15.165.30.90
- **Backend API**: http://15.165.30.90/api
- **GitHub**: https://github.com/junhuhan99/trendsos

### 관리자 계정
- **이메일**: admin@trendsos.com
- **비밀번호**: admin123!@#

## 설치된 소프트웨어

### EC2 (Ubuntu 22.04)
- Node.js v20.19.5
- npm v10.8.2
- MongoDB v7.0.25
- Nginx v1.18.0
- PM2 (프로세스 관리자)

## 프로젝트 구조

```
trendsos/
├── frontend/           # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   └── Header.jsx
│   │   │   └── home/
│   │   │       ├── HeroSlider.jsx
│   │   │       ├── PopularArticles.jsx
│   │   │       └── ArticleGrid.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ArticleDetail.jsx
│   │   │   └── AdminDashboard.jsx
│   │   └── utils/
│   │       └── api.js
│   └── dist/           # 빌드된 정적 파일
│
└── backend/            # Node.js + Express + MongoDB
    ├── models/
    │   ├── User.js
    │   ├── Article.js
    │   └── Comment.js
    ├── controllers/
    │   ├── authController.js
    │   ├── articleController.js
    │   └── commentController.js
    ├── routes/
    │   ├── auth.js
    │   └── articles.js
    ├── middleware/
    │   └── auth.js
    ├── config/
    │   └── database.js
    └── server.js
```

## 주요 기능

### 사용자 기능
1. **회원가입/로그인**
   - JWT 기반 인증
   - 비밀번호 암호화 (bcryptjs)
   - 로컬 스토리지를 통한 세션 관리

2. **게시글 조회**
   - 메인 페이지 히어로 슬라이더
   - 인기 게시글 목록
   - 카테고리별 필터링
   - 게시글 상세 보기

3. **인터랙션**
   - 게시글 좋아요
   - 게시글 북마크
   - 댓글 작성/삭제
   - 조회수 자동 증가

### 관리자 기능
1. **게시글 관리**
   - 게시글 작성
   - 게시글 수정
   - 게시글 삭제
   - 오늘의 토픽 설정

2. **대시보드**
   - 게시글 목록 보기
   - 통계 정보 (게시글 수, 조회수 등)

## API 엔드포인트

### 인증 (Authentication)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 현재 사용자 정보

### 게시글 (Articles)
- `GET /api/articles` - 게시글 목록 (쿼리: category, sort, featured, limit, page)
- `GET /api/articles/:id` - 게시글 상세
- `POST /api/articles` - 게시글 작성 (관리자)
- `PUT /api/articles/:id` - 게시글 수정 (관리자/작성자)
- `DELETE /api/articles/:id` - 게시글 삭제 (관리자/작성자)
- `POST /api/articles/:id/like` - 게시글 좋아요
- `POST /api/articles/:id/bookmark` - 게시글 북마크

### 댓글 (Comments)
- `GET /api/articles/:articleId/comments` - 댓글 목록
- `POST /api/articles/:articleId/comments` - 댓글 작성
- `DELETE /api/articles/:articleId/comments/:commentId` - 댓글 삭제

## 서버 관리

### PM2 명령어
```bash
# 서버 상태 확인
pm2 status

# 로그 확인
pm2 logs trendsos-backend

# 서버 재시작
pm2 restart trendsos-backend

# 서버 중지
pm2 stop trendsos-backend

# 서버 시작
pm2 start trendsos-backend
```

### Nginx 명령어
```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 설정 테스트
sudo nginx -t
```

### MongoDB 명령어
```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 접속
mongosh

# 데이터베이스 사용
use trendsos

# 사용자 목록 확인
db.users.find()

# 게시글 목록 확인
db.articles.find()
```

## 업데이트 방법

### 코드 업데이트
```bash
# EC2 접속
ssh -i trendsos.pem ubuntu@15.165.30.90

# 프로젝트 디렉토리로 이동
cd ~/trendsos

# 최신 코드 받기
git pull origin main

# Backend 재시작
cd backend
npm install
pm2 restart trendsos-backend

# Frontend 재빌드
cd ../frontend
npm install
npm run build

# Nginx 재시작 (필요시)
sudo systemctl restart nginx
```

## 보안 고려사항

1. **환경 변수**
   - JWT_SECRET은 프로덕션에서 강력한 시크릿 키 사용
   - MongoDB URI는 프로덕션 데이터베이스 사용

2. **방화벽**
   - EC2 보안 그룹에서 80번 포트 (HTTP) 열기
   - 필요시 443번 포트 (HTTPS) 설정

3. **SSL/TLS**
   - Let's Encrypt를 사용한 HTTPS 설정 권장
   - Certbot으로 자동 인증서 갱신 설정

## 문제 해결

### Frontend가 로드되지 않을 때
```bash
# Nginx 설정 확인
sudo nginx -t

# Nginx 재시작
sudo systemctl restart nginx

# Frontend 빌드 파일 확인
ls -la ~/trendsos/frontend/dist/
```

### Backend API가 응답하지 않을 때
```bash
# PM2 프로세스 확인
pm2 status

# Backend 로그 확인
pm2 logs trendsos-backend

# Backend 재시작
pm2 restart trendsos-backend
```

### MongoDB 연결 오류
```bash
# MongoDB 상태 확인
sudo systemctl status mongod

# MongoDB 시작
sudo systemctl start mongod
```

## 모니터링

### 시스템 리소스
```bash
# CPU, 메모리 사용량 확인
htop

# 디스크 사용량 확인
df -h

# 프로세스 확인
pm2 monit
```

## 참고 사항

- Frontend는 `http://15.165.30.90`에서 접근 가능
- Backend API는 `http://15.165.30.90/api`로 프록시됨
- MongoDB는 localhost:27017에서 실행 중
- PM2는 시스템 재부팅 시 자동으로 Backend 서버 시작

## 다음 단계 (선택사항)

1. **HTTPS 설정**
   - Let's Encrypt 인증서 설치
   - Nginx HTTPS 리다이렉트 설정

2. **도메인 연결**
   - DNS 설정
   - Nginx 서버 블록 업데이트

3. **이미지 업로드**
   - Multer 설정
   - S3 또는 로컬 스토리지 연동

4. **검색 기능**
   - Elasticsearch 또는 MongoDB Atlas Search

5. **알림 기능**
   - 댓글 알림
   - 좋아요 알림

---

배포 완료일: 2025년 10월 25일
