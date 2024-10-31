import React from 'react';
import '../styles/WorkspaceFooter.css';

function WorkspaceFooter() {
  return (
    <div className="workspace-footer">
      <div className="processing-info">
        <div className="time-estimate">
          <span className="info-label">예상 처리 시간:</span>
          <span className="info-value">약 3분</span>
        </div>
        <div className="daily-quota">
          <span className="info-label">남은 처리 횟수:</span>
          <span className="info-value">8/10회</span>
        </div>
      </div>
      
      <div className="action-buttons">
        <button className="action-button">
          <span className="button-icon">📥</span>
          ZIP 다운로드
        </button>
        <button className="action-button primary">
          <span className="button-icon">✨</span>
          일괄 처리 시작
        </button>
      </div>
    </div>
  );
}

export default WorkspaceFooter; 