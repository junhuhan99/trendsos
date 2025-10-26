# BlockPass Ω 배포 가이드

## EC2 배포 방법

### 사전 요구사항

- EC2 인스턴스 (Ubuntu 22.04 LTS)
- 고정 IP: 15.165.30.90
- SSH 접근 권한

### 배포 단계

#### 1. EC2에 SSH 접속

```bash
ssh -i trendsos.pem ubuntu@15.165.30.90
```

#### 2. 배포 스크립트 다운로드

```bash
curl -o deploy.sh https://raw.githubusercontent.com/junhuhan99/tendsos/main/deploy.sh
chmod +x deploy.sh
```

또는 직접 업로드:

```bash
# 로컬에서
scp -i trendsos.pem deploy.sh ubuntu@15.165.30.90:~/

# EC2에서
chmod +x ~/deploy.sh
```

#### 3. 배포 스크립트 실행

```bash
./deploy.sh
```

스크립트가 자동으로 다음 작업을 수행합니다:
1. 시스템 업데이트
2. Node.js 20.x LTS 설치
3. PM2 설치
4. GitHub에서 프로젝트 클론
5. 백엔드 의존성 설치
6. 프론트엔드 빌드
7. Nginx 설치 및 설정
8. PM2로 백엔드 서비스 실행

### 수동 배포 (스크립트 사용 안 함)

#### 1. Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. PM2 설치

```bash
sudo npm install -g pm2
```

#### 3. 프로젝트 클론

```bash
cd ~
git clone https://github.com/junhuhan99/tendsos.git blockpass-omega
cd blockpass-omega
```

#### 4. 백엔드 설정

```bash
cd backend
npm install
cp .env.example .env
```

.env 파일을 필요에 따라 수정하세요.

#### 5. 백엔드 실행

```bash
pm2 start server.js --name "blockpass-backend"
pm2 save
pm2 startup
```

#### 6. 프론트엔드 빌드

```bash
cd ../frontend
npm install
npm run build
```

#### 7. Nginx 설치 및 설정

```bash
sudo apt-get install -y nginx
```

Nginx 설정 파일 생성 (`/etc/nginx/sites-available/blockpass-omega`):

```nginx
server {
    listen 80;
    server_name 15.165.30.90;

    # Frontend
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

    location /health {
        proxy_pass http://localhost:5000;
    }
}
```

설정 활성화:

```bash
sudo ln -s /etc/nginx/sites-available/blockpass-omega /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 접속 확인

- 웹사이트: http://15.165.30.90
- API Health Check: http://15.165.30.90/health

### 유용한 명령어

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs

# 서비스 재시작
pm2 restart blockpass-backend

# Nginx 재시작
sudo systemctl restart nginx

# Nginx 로그
sudo tail -f /var/log/nginx/error.log
```

## 업데이트 방법

### 코드 업데이트

```bash
cd ~/blockpass-omega
git pull origin main

# 백엔드 재시작
cd backend
npm install
pm2 restart blockpass-backend

# 프론트엔드 리빌드
cd ../frontend
npm install
npm run build

# Nginx 재시작
sudo systemctl restart nginx
```

## 트러블슈팅

### 포트 5000이 이미 사용 중인 경우

```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :5000

# 프로세스 종료
sudo kill -9 <PID>
```

### Nginx 에러

```bash
# Nginx 설정 테스트
sudo nginx -t

# Nginx 에러 로그 확인
sudo tail -f /var/log/nginx/error.log
```

### PM2 재설정

```bash
pm2 delete all
pm2 start server.js --name "blockpass-backend"
pm2 save
```

## 보안 그룹 설정

EC2 보안 그룹에서 다음 포트를 개방해야 합니다:

- **80 (HTTP)**: 웹 접속
- **22 (SSH)**: SSH 접속

## 모니터링

```bash
# PM2 모니터링
pm2 monit

# 시스템 리소스 확인
htop

# 디스크 사용량
df -h
```

## 백업

```bash
# 데이터 백업 (향후 DB 연동 시)
pm2 save

# 설정 파일 백업
cp backend/.env backend/.env.backup
```

## 문의

문제가 발생하면 GitHub Issues에 등록하세요:
https://github.com/junhuhan99/tendsos/issues
