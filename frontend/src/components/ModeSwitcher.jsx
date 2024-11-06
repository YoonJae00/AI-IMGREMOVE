import React from 'react';


function ModeSwitcher({ activeMode, onModeChange }) {
  return (
    <div className="mode-switcher">
      <button 
        className={`mode-button ${activeMode === 'removeBackground' ? 'active' : ''}`}
        onClick={() => onModeChange('removeBackground')}
      >
        <span className="mode-icon">🖼️</span>
        <div className="mode-info">
          <span className="mode-title">대량가공  </span>
          <span className="mode-desc">최대 50장 동시처리</span>
        </div>
      </button>

      <button 
        className={`mode-button ${activeMode === 'studio' ? 'active' : ''}`}
        onClick={() => onModeChange('studio')}
      >
        <span className="mode-icon">📸</span>
        <div className="mode-info">
          <span className="mode-title">스튜디오조명  </span>
          <span className="mode-desc">고품질 1장 처리</span>
        </div>
      </button>
    </div>
  );
}

export default ModeSwitcher; 