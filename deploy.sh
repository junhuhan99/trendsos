#!/bin/bash

# BlockPass Ω EC2 배포 스크립트
# Ubuntu 22.04 LTS 기준

set -e

echo "========================================="
echo "  BlockPass Ω 배포 시작"
echo "========================================="
echo ""

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. 시스템 업데이트
echo -e "${BLUE}[1/8] 시스템 업데이트 중...${NC}"
sudo apt-get update -y
sudo apt-get upgrade -y

# 2. Node.js 설치 (v20.x LTS)
echo -e "${BLUE}[2/8] Node.js 설치 중...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "${GREEN}Node.js 버전: $(node --version)${NC}"
echo -e "${GREEN}NPM 버전: $(npm --version)${NC}"

# 3. PM2 설치
echo -e "${BLUE}[3/8] PM2 설치 중...${NC}"
sudo npm install -g pm2

# 4. 프로젝트 클론
echo -e "${BLUE}[4/8] 프로젝트 클론 중...${NC}"
cd ~
if [ -d "blockpass-omega" ]; then
    echo "기존 디렉토리 삭제 중..."
    rm -rf blockpass-omega
fi

git clone https://github.com/junhuhan99/tendsos.git blockpass-omega
cd blockpass-omega

# 5. 백엔드 설정
echo -e "${BLUE}[5/8] 백엔드 설정 중...${NC}"
cd backend
npm install

# 환경 변수 파일이 없으면 생성
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# 6. 프론트엔드 빌드
echo -e "${BLUE}[6/8] 프론트엔드 빌드 중...${NC}"
cd ../frontend
npm install
npm run build

# 7. Nginx 설치 및 설정
echo -e "${BLUE}[7/8] Nginx 설치 및 설정 중...${NC}"
sudo apt-get install -y nginx

# Nginx 설정 파일 생성
sudo tee /etc/nginx/sites-available/blockpass-omega > /dev/null <<'EOF'
server {
    listen 80;
    server_name 15.165.30.90;

    # Frontend (React)
    location / {
        root /home/ubuntu/blockpass-omega/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000;
    }
}
EOF

# Nginx 설정 활성화
sudo ln -sf /etc/nginx/sites-available/blockpass-omega /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 8. PM2로 백엔드 실행
echo -e "${BLUE}[8/8] 백엔드 서비스 시작 중...${NC}"
cd ~/blockpass-omega/backend
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 start server.js --name "blockpass-backend"
pm2 save
pm2 startup

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  BlockPass Ω 배포 완료!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}서비스 정보:${NC}"
echo -e "  - 웹사이트: http://15.165.30.90"
echo -e "  - API: http://15.165.30.90/api"
echo -e "  - Health Check: http://15.165.30.90/health"
echo ""
echo -e "${BLUE}유용한 명령어:${NC}"
echo -e "  - PM2 상태 확인: pm2 status"
echo -e "  - PM2 로그: pm2 logs"
echo -e "  - PM2 재시작: pm2 restart blockpass-backend"
echo -e "  - Nginx 재시작: sudo systemctl restart nginx"
echo -e "  - Nginx 로그: sudo tail -f /var/log/nginx/error.log"
echo ""
