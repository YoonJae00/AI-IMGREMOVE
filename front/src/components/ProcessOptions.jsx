import React from 'react';
import '../styles/ProcessOptions.css';

function ProcessOptions() {
  return (
    <div className="process-options">
      <h3 className="options-title">처리 옵션</h3>
      
      <div className="option-group">
        <label className="option-label">배경 설정</label>
        <div className="option-buttons">
          <button className="option-button active">
            <span className="option-icon">🔍</span>
            투명 배경
          </button>
          <button className="option-button">
            <span className="option-icon">🎨</span>
            배경 추가
          </button>
        </div>
      </div>

      <div className="option-group">
        <label className="option-label">이미지 품질</label>
        <select className="quality-select">
          <option value="high">고품질 (느림)</option>
          <option value="medium" selected>표준</option>
          <option value="low">빠른 처리</option>
        </select>
      </div>

      <div className="option-group">
        <label className="option-label">출력 형식</label>
        <select className="format-select">
          <option value="png">PNG (투명배경)</option>
          <option value="jpg">JPG</option>
        </select>
      </div>
    </div>
  );
}

export default ProcessOptions; 