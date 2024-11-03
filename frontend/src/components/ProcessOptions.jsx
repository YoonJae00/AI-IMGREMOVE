import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function ProcessOptions({ backgroundType, setBackgroundType, customBackground, setCustomBackground }) {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setCustomBackground(acceptedFiles[0]);
    }
  }, [setCustomBackground]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: false
  });

  return (
    <div className="process-options">
      <h3 className="options-title">처리 옵션</h3>
      
      <div className="option-group">
        <label className="option-label">배경 설정</label>
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

      {backgroundType === 'custom' && (
        <div className="background-section">
          <div className="background-upload-area" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className="upload-content">
              <span className="upload-icon">📁</span>
              <p>{customBackground ? '배경 이미지 변경하기' : '배경 이미지를 끌어다 놓거나 클릭하세요'}</p>
            </div>
          </div>
          
          {customBackground && (
            <div className="background-preview">
              <img 
                src={URL.createObjectURL(customBackground)} 
                alt="배경 미리보기" 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ProcessOptions; 