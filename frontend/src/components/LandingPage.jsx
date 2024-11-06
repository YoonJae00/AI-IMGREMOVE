import React from 'react';
import '../styles/landing-page.css';
import rmbgGif from '../assets/rmbg.gif';
import studioGif from '../assets/promode.gif';

function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            <span className="gradient-text">AI 기술로</span><br />
            상품 이미지를 더 쉽게
          </h1>
          <p className="hero-description">
            셀러를 위한 대량 이미지 처리 솔루션<br />
            배경 제거부터 스튜디오 촬영 효과까지 한 번에
          </p>
          <button className="cta-button" onClick={onGetStarted}>
            지금 시작하기
          </button>
        </div>
        <div className="hero-image">
          {/* <img src="/hero-image.png" alt="AI 이미지 처리 예시" /> */}
        </div>
      </section>

      <section className="features-section">
        <h2>주요 기능</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>대량 배경 제거</h3>
            <p>최대 50장의 이미지를 한 번에 처리<br />투명 배경 또는 새로운 배경으로 변경</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📸</div>
            <h3>스튜디오 모드</h3>
            <p>전문 스튜디오에서 촬영한 것 같은<br />고품질 이미지로 변환</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3>대표이미지 가공</h3>
            <p>상품 대표이미지에 최적화된<br />1024x1024 정사각형 리사이즈</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>빠른 처리 속도</h3>
            <p>AI 기술로 빠르고 정확하게<br />이미지 처리 완료</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💾</div>
            <h3>간편한 다운로드</h3>
            <p>처리된 이미지를 ZIP 파일로<br />한 번에 다운로드</p>
          </div>
        </div>
      </section>

      <section className="usage-section">
        <h2>이렇게 사용하세요</h2>
        <div className="usage-grid">
          <div className="usage-item">
            <h3>대량 이미지 가공 모드</h3>
            <div className="usage-video">
              <img src={rmbgGif} alt="배경 제거 사용법" />
            </div>
            <div className="usage-steps">
              <p>1. 이미지를 드래그앤드롭으로 업로드</p>
              <p>2. 원하는 배경 옵션 선택</p>
              <p>3. 처리 후 ZIP 파일로 다운로드</p>
            </div>
          </div>
          <div className="usage-item">
            <h3>스튜디오 모드</h3>
            <div className="usage-video">
              <img src={studioGif} alt="스튜디오 모드 사용법" />
            </div>
            <div className="usage-steps">
              <p>1. 스튜디오 모드 선택</p>
              <p>2. 이미지 한 장 업로드</p>
              <p>3. AI가 자동으로 보정</p>
            </div>
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>이런 효과를 얻을 수 있어요</h2>
        <div className="demo-grid">
          <div className="demo-item">
            <div className="demo-images">
              <div className="demo-image">
                <img src="https://i.ibb.co/yg7vB0Z/ZENT00004228.jpg" alt="처리 전" />
                <span className="image-label">처리 전</span>
              </div>
              <div className="demo-image">
                <img src="https://i.ibb.co/SQXNcRt/ZENT00004228.png" alt="처리 후" />
                <span className="image-label">처리 후</span>
              </div>
            </div>
            <p>배경 제거 후 투명 배경으로 변환</p>
          </div>
          <div className="demo-item">
            <div className="demo-images">
              <div className="demo-image">
                <img src="https://i.ibb.co/yg7vB0Z/ZENT00004228.jpg" alt="처리 전" />
                <span className="image-label">처리 전</span>
              </div>
              <div className="demo-image">
                <img src="https://i.ibb.co/BGMMJdB/ZENT00004228.png" alt="처리 후" />
                <span className="image-label">처리 후</span>
              </div>
            </div>
            <p>원하는 배경으로 자동 변경</p>
          </div>
          <div className="demo-item">
            <div className="demo-images">
              <div className="demo-image">
                <img src="https://i.ibb.co/p4qcxsN/before.jpg" alt="처리 전" />
                <span className="image-label">처리 전</span>
              </div>
              <div className="demo-image">
                <img src="https://i.ibb.co/mC33h0g/after.png" alt="처리 후" />
                <span className="image-label">처리 후</span>
              </div>
            </div>
            <p>스튜디오 모드로 전문적인 느낌 연출</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>지금 바로 시작하세요</h2>
        <p>하루 최대 1,000장 무료 처리</p>
        <button className="cta-button" onClick={onGetStarted}>
          무료로 시작하기
        </button>
      </section>
    </div>
  );
}

export default LandingPage; 