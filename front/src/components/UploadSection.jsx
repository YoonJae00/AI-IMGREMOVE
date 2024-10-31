import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/UploadSection.css';

function UploadSection({ onFilesAccepted }) {
  const [backgroundType, setBackgroundType] = useState('transparent');

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFilesAccepted,
    accept: 'image/*',
    multiple: true
  });

  return (
    <div className="upload-section">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <div className="upload-content">
          <span className="upload-icon">📁</span>
          <span className="upload-text">이미지 끌어다 놓기</span>
          <span className="upload-subtext">또는</span>
          <button className="upload-button">
            컴퓨터에서 선택
          </button>
        </div>
      </div>
      
      <div className="background-options">
        <h3>배경 설정</h3>
        <div className="option-buttons">
          <button 
            className={`option-button ${backgroundType === 'transparent' ? 'active' : ''}`}
            onClick={() => setBackgroundType('transparent')}
          >
            <span className="option-icon">🔍</span>
            투명 배경
          </button>
          <button 
            className={`option-button ${backgroundType === 'custom' ? 'active' : ''}`}
            onClick={() => setBackgroundType('custom')}
          >
            <span className="option-icon">🎨</span>
            배경 추가
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadSection; 