# 트렌드OS

IT 트렌드와 개발 지식을 공유하는 콘텐츠 플랫폼

## 기술 스택

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React (아이콘)

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT 인증
- bcryptjs

## 주요 기능

- 게시글 작성/조회/수정/삭제 (CRUD)
- 사용자 인증 (회원가입, 로그인)
- 관리자 대시보드
- 게시글 좋아요/북마크
- 댓글 기능
- 카테고리별 필터링
- 인기 콘텐츠 정렬
- 반응형 디자인

## 로컬 개발 환경 설정

### 1. 저장소 클론
```bash
git clone https://github.com/junhuhan99/trendsos.git
cd trendsos
```

### 2. Backend 설정
```bash
cd backend
npm install
cp .env.example .env
# .env 파일 수정 (MongoDB URI, JWT_SECRET 등)
npm run dev
```

### 3. Frontend 설정
```bash
cd frontend
npm install
cp .env.example .env
# .env 파일 수정
npm run dev
```

### 4. MongoDB 설치 및 실행
```bash
# Ubuntu
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

## 배포

### EC2 배포 (Ubuntu)

1. **서버 접속**
```bash
ssh -i trendsos.pem ubuntu@15.165.30.90
```

2. **Node.js 설치**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **MongoDB 설치**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **프로젝트 클론 및 설정**
```bash
git clone https://github.com/junhuhan99/trendsos.git
cd trendsos

# Backend
cd backend
npm install
# .env 파일 설정
npm start

# Frontend (새 터미널)
cd frontend
npm install
npm run build
```

5. **Nginx 설정**
```bash
sudo apt-get install -y nginx

# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/trendsos
```

Nginx 설정 내용:
```nginx
server {
    listen 80;
    server_name 15.165.30.90;

    location / {
        root /home/ubuntu/trendsos/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/trendsos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. **PM2로 백엔드 실행**
```bash
sudo npm install -g pm2
cd ~/trendsos/backend
pm2 start server.js --name trendsos-backend
pm2 startup
pm2 save
```

## 관리자 계정 생성

MongoDB에서 직접 관리자 계정 생성:

```bash
mongosh
use trendsos

db.users.insertOne({
  name: "Admin",
  email: "admin@trendsos.com",
  password: "$2a$10$...", // bcrypt로 해시된 비밀번호
  role: "admin",
  bio: "트렌드OS 관리자",
  avatar: "",
  bookmarks: [],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## API 엔드포인트

### 인증
- POST `/api/auth/register` - 회원가입
- POST `/api/auth/login` - 로그인
- GET `/api/auth/me` - 현재 사용자 정보

### 게시글
- GET `/api/articles` - 게시글 목록
- GET `/api/articles/:id` - 게시글 상세
- POST `/api/articles` - 게시글 작성 (관리자)
- PUT `/api/articles/:id` - 게시글 수정
- DELETE `/api/articles/:id` - 게시글 삭제
- POST `/api/articles/:id/like` - 좋아요
- POST `/api/articles/:id/bookmark` - 북마크

### 댓글
- GET `/api/articles/:articleId/comments` - 댓글 목록
- POST `/api/articles/:articleId/comments` - 댓글 작성
- DELETE `/api/articles/:articleId/comments/:commentId` - 댓글 삭제

## 라이선스

MIT
