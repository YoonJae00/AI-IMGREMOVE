# ForSeller - AI 기반 이미지 가공 서비스

<img src='https://github.com/user-attachments/assets/e180c7ad-f7af-4792-a45f-921b378c1922'>

<img src='https://github.com/user-attachments/assets/eca52747-39b6-4336-ab17-0a2096a83cd2'>

## 프로젝트 개요

ForSeller는 쇼핑몰 셀러를 위한 AI 기반 이미지 가공 서비스입니다. 대량의 상품 이미지를 한 번에 처리할 수 있으며, 배경 제거, 스튜디오 모드 변환 등 다양한 기능을 제공합니다.

### 주요 특징
- 최대 50장 이미지 동시 처리
- AI 기반 정교한 배경 제거
- 스튜디오 촬영 효과 적용
- 실시간 처리 상태 모니터링
- 로드 밸런싱을 통한 빠른 처리 속도

## 시스템 아키텍처

### 전체 구성도
```mermaid
graph TB
    subgraph "클라이언트"
        FE[프론트엔드<br/>React + Vite]
        FE --> |API 요청| NG[Nginx Proxy]
    end

    subgraph "서버"
        NG --> |프록시| BE[백엔드<br/>Node.js + Express]
        BE --> |이미지 처리| CM[ComfyUI Manager]
    end

    subgraph "ComfyUI 클러스터"
        CM --> |로드밸런싱| C1[ComfyUI Server 1]
        CM --> |로드밸런싱| C2[ComfyUI Server 2]
        CM --> |로드밸런싱| C3[ComfyUI Server 3]
        CM --> |로드밸런싱| C4[ComfyUI Server 4]
    end
```

## 기술 스택

### 프론트엔드
- React 18
- Vite
- React-dropzone
- Axios
- JSZip

### 백엔드
- Node.js
- Express
- Multer (파일 업로드)
- Express-rate-limit (요청 제한)
- Docker & Docker Compose

### 인프라
- Nginx (리버스 프록시)
- ComfyUI (AI 이미지 처리)
- Docker Container

## 주요 기능

### 1. 대량 이미지 처리
- 최대 50장 동시 업로드
- 드래그 앤 드롭 지원
- 실시간 처리 상태 표시
- 일괄 다운로드

### 2. AI 배경 제거
- 투명 배경 변환
- 커스텀 배경 적용
- 정교한 경계선 처리

### 3. 스튜디오 모드
- 전문 스튜디오 촬영 효과
- 조명 및 그림자 최적화
- 상품 이미지 품질 개선

### 4. 시스템 관리
- IP 기반 요청 제한
- 로드 밸런싱
- 실시간 서버 상태 모니터링

## 시스템 특징

### 확장성
- Docker 기반 마이크로서비스 아키텍처
- 수평적 확장 가능한 ComfyUI 클러스터
- 로드 밸런싱을 통한 부하 분산

### 안정성
- 서버 헬스 체크
- 자동 페일오버
- 에러 핸들링 및 복구

### 성능
- 이미지 병렬 처리
- 연결 유지(Keep-Alive)
- 캐시 최적화

## 설치 및 실행

1. 저장소 클론
```bash
git clone <repository-url>
cd forseller
```

2. 환경 변수 설정
```bash
# .env 파일 생성
cp .env.example .env
```

3. Docker Compose 실행
```bash
docker-compose up -d
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 연락처

개발자: realyoon77@gmail.com
