import React from 'react';
import '../styles/WorkspaceHeader.css';

function WorkspaceHeader() {
  return (
    <div className="workspace-header">
      <div className="workspace-stats">
        <div className="stat-item">
          <span className="stat-label">총 이미지</span>
          <span className="stat-value">32장</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">처리완료</span>
          <span className="stat-value">12장</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">남은시간</span>
          <span className="stat-value">약 3분</span>
        </div>
      </div>
      
      <div className="workspace-actions">
        <button className="action-button">
          <span className="action-icon">📥</span>
          선택 다운로드
        </button>
        <button className="action-button primary">
          <span className="action-icon">✨</span>
          일괄 처리
        </button>
      </div>
    </div>
  );
} 

export default WorkspaceHeader; 