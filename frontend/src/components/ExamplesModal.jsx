import React from 'react';


function ExamplesModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="example-tabs">
          <div className="example-section">
            <h3>대량 가공 모드</h3>
            <div className="example-features">
              <div className="feature">
                <span className="feature-badge">최대 50장</span>
                <span className="feature-desc">한 번에 최대 50장까지 처리</span>
              </div>
              <div className="feature">
                <span className="feature-badge">배경 선택</span>
                <span className="feature-desc">투명 배경 또는 새로운 배경 선택</span>
              </div>
            </div>
            <div className="example-images">
              <div className="image-comparison">
                <div className="image-container">
                  <img src="/examples/background-before.jpg" alt="Before" />
                  <span className="image-label">Before</span>
                </div>
                <div className="image-container">
                  <img src="/examples/background-after.jpg" alt="After" />
                  <span className="image-label">After</span>
                </div>
              </div>
            </div>
          </div>

          <div className="example-section">
            <h3>스튜디오 모드</h3>
            <div className="example-features">
              <div className="feature">
                <span className="feature-badge">1장씩 처리</span>
                <span className="feature-desc">고품질 스튜디오 효과</span>
              </div>
            </div>
            <div className="example-images">
              <div className="image-comparison">
                <div className="image-container">
                  <img src="/examples/studio-before.jpg" alt="Before" />
                  <span className="image-label">Before</span>
                </div>
                <div className="image-container">
                  <img src="/examples/studio-after.jpg" alt="After" />
                  <span className="image-label">After</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamplesModal; 