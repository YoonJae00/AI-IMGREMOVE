FROM node:18-alpine

WORKDIR /app

# 패키지 파일 복사 및 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

EXPOSE 3000

ENV HOST=0.0.0.0
ENV PORT=3000