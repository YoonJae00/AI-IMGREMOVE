# ForSeller 이미지 가공 서비스

<img src='https://github.com/user-attachments/assets/bf4549ea-b889-4963-84d2-b5d1ccb3f7e1'>

<img src='https://github.com/user-attachments/assets/e180c7ad-f7af-4792-a45f-921b378c1922'>

## 프로젝트 개요

ForSeller는 대량가공 쇼핑몰 셀러 들을 위한 이미지 가공 서비스입니다. 이 서비스는 사용자가 업로드한 이미지의 배경을 자동으로 제거하고, 처리된 이미지를 다운로드할 수 있게 해줍니다.

## 기술 스택

### 프론트엔드
- React
- Vite
- Axios
- react-dropzone

### 백엔드
- Node.js
- Express
- Multer
- Archiver
- express-rate-limit

## 주요 기능

1. 이미지 업로드 (최대 10개)
2. 배경 제거 처리
3. 처리된 이미지 다운로드
4. IP 기반 일일 요청 제한 (기본 10회)
5. 무제한 IP 관리
6. 사용 통계 대시보드

## 설치 및 실행 방법

### 프론트엔드

1. 프로젝트 클론
   ```
   git clone <repository-url>
   cd <project-folder>/front
   ```

2. 의존성 설치
   ```
   npm install
   ```

3. 개발 서버 실행
   ```
   npm run dev
   ```

4. 빌드
   ```
   npm run build
   ```

### 백엔드

1. 프로젝트 폴더로 이동
   ```
   cd <project-folder>/backend
   ```

2. 의존성 설치
   ```
   npm install
   ```

3. 서버 실행
   ```
   node server.js
   ```

## 프론트엔드 구조

```
front/
├── src/
│   ├── components/
│   │   ├── ImageUploader.jsx
│   │   ├── DownloadButton.jsx
│   │   └── Footer.jsx
│   ├── styles/
│   │   ├── App.css
│   │   └── ImageUploader.css
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── forseller-icon.svg
├── index.html
├── package.json
└── vite.config.js
```

### 주요 컴포넌트

1. ImageUploader: 이미지 업로드 및 처리 담당
   
```6:40:front/src/components/ImageUploader.jsx
function ImageUploader() {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (previews.length + acceptedFiles.length > 10) {
      alert('최대 10개의 이미지만 업로드할 수 있습니다.');
      acceptedFiles = acceptedFiles.slice(0, 10 - previews.length);
    }

    const newPreviews = [...previews, ...acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))];
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  }, [previews]);

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  const uploadAndDownload = async () => {
```


2. DownloadButton: 처리된 이미지 다운로드 기능 제공

3. Footer: 페이지 하단 정보 표시

## 백엔드 구조

```
backend/
├── server.js
├── public/
│   └── stats.html
└── package.json
```

### 주요 기능

1. 이미지 업로드 및 처리
2. 요청 제한 관리
3. 무제한 IP 관리
4. 통계 데이터 제공


```36:46:backend/server.js
// Rate limiter 설정
const limiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 시간
  max: (req) => {
    const clientIp = getClientIp(req);
    return unlimitedIPs.includes(clientIp) ? 1000000 : 10; // 무제한 IP는 높은 제한, 그 외는 10회
  },
  message: '일일 요청 한도를 초과했습니다. 내일 다시 시도해 주세요.',
  standardHeaders: true,
  legacyHeaders: false,
});
```


## 환경 변수

프론트엔드와 백엔드 모두 `.env` 파일을 사용하여 환경 변수를 관리합니다. 예시:

```
VITE_API_URL=http://localhost:3101
PORT=3101
```

## 배포

- 프론트엔드: Vercel 또는 Netlify를 통한 정적 사이트 배포
- 백엔드: AWS EC2 또는 Heroku를 통한 서버 배포

## 통계 대시보드

`/dashboard` 엔드포인트에서 사용 통계를 확인할 수 있습니다.


```58:80:backend/public/stats.html
    <div class="container">
        <h1>ForSeller 통계 대시보드</h1>
        <div class="stats-grid">
            <div class="stat-card">
                <h2 id="totalAccesses">-</h2>
                <p>총 접속 수</p>
            </div>
            <div class="stat-card">
                <h2 id="uniqueVisitors">-</h2>
                <p>고유 방문자 수</p>
            </div>
            <div class="stat-card">
                <h2 id="mostActiveHour">-</h2>
                <p>가장 활발한 시간대</p>
            </div>
            <div class="stat-card">
                <h2 id="averageDailyAccesses">-</h2>
                <p>일일 평균 접속 수</p>
            </div>
            <div class="stat-card">
                <h2 id="mostActiveIP">-</h2>
                <p>가장 활발한 IP (접속 횟수)</p>
              </div>
```


## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 기여

버그 리포트, 기능 제안, 풀 리퀘스트 등 모든 형태의 기여를 환영합니다.

## 연락처

프로젝트 관리자: realyoon77@gmail.com

## 개선사항
<img src='https://github.com/user-attachments/assets/35f03666-c3fa-4d99-9a9e-1e87f55aa3a2'>

