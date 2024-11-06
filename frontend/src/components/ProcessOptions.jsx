import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import blackStudio from '../assets/samples/black-studio.png';
import whiteStudio from '../assets/samples/white-studio.png';
import gradient from '../assets/samples/gradient.png';
import nature from '../assets/samples/nature.png';
import cafe from '../assets/samples/cafe.png';

function ProcessOptions({ backgroundType, setBackgroundType, customBackground, setCustomBackground }) {
  const [selectedSample, setSelectedSample] = useState(null);
  const sampleBackgrounds = [
    { id: 1, url: whiteStudio, name: '하얀 스튜디오' },
    { id: 2, url: blackStudio, name: '검정 스튜디오' },
    { id: 3, url: gradient, name: '그라데이션' },
    { id: 4, url: nature, name: '자연 배경' },
    { id: 5, url: cafe, name: '카페 배경' }
  ];

  const handleSampleSelect = async (bg) => {
    try {
      const response = await fetch(bg.url);
      const blob = await response.blob();
      const file = new File([blob], `sample-${bg.name}.jpg`, { type: 'image/jpeg' });
      setCustomBackground(file);
      setBackgroundType('custom');
      setSelectedSample(bg.id);
    } catch (error) {
      console.error('샘플 배경 로드 실패:', error);
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setCustomBackground(file);
      setSelectedSample(null);
    }
  };

  return (
    <div className="process-options">
      <h3>배경 설정</h3>
      <div className="background-options">
        <label>
          <input
            type="radio"
            value="transparent"
            checked={backgroundType === 'transparent'}
            onChange={(e) => setBackgroundType(e.target.value)}
          />
          투명 배경
        </label>
        <label>
          <input
            type="radio"
            value="custom"
            checked={backgroundType === 'custom'}
            onChange={(e) => setBackgroundType(e.target.value)}
          />
          배경 추가
        </label>
      </div>

      {backgroundType === 'custom' && (
        <div className="background-selector">
          <div className="sample-backgrounds">
            <h4>샘플 배경</h4>
            <div className="sample-grid">
              {sampleBackgrounds.map(bg => (
                <div 
                  key={bg.id} 
                  className={`sample-item ${selectedSample === bg.id ? 'selected' : ''}`}
                  onClick={() => handleSampleSelect(bg)}
                >
                  <img src={bg.url} alt={bg.name} />
                  <span>{bg.name}</span>
                  {selectedSample === bg.id && <div className="check-icon">✓</div>}
                </div>
              ))}
              <div className="sample-item upload-item">
                <label className="upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  {customBackground && !selectedSample ? (
                    <div className="upload-preview">
                      <img 
                        src={URL.createObjectURL(customBackground)} 
                        alt="업로드된 배경" 
                      />
                      <span>직접 업로드됨</span>
                      <div className="check-icon">✓</div>
                    </div>
                  ) : (
                    <div className="upload-content">
                      <span className="upload-icon">+</span>
                      <span>직접 업로드</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessOptions; 