import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import StudioMode from './components/StudioMode.jsx';
import './styles/App.css';

function App() {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);
  const [activeTab, setActiveTab] = useState('removeBackground');

  return (
    <div className="App">
      <div className="notice">
        <p>IP당 하루 요청 10번만 가능합니다</p>
      </div>
      <h1>AI Seller 서비스 </h1>
      <div className="tab-container">
        <button 
          className={`tab ${activeTab === 'removeBackground' ? 'active' : ''}`}
          onClick={() => setActiveTab('removeBackground')}
        >
          이미지 배경 제거 모드
        </button>
        <button 
          className={`tab ${activeTab === 'studioMode' ? 'active' : ''}`}
          onClick={() => setActiveTab('studioMode')}
        >
          스튜디오 사진 모드
        </button>
      </div>
      {activeTab === 'removeBackground' ? (
        <>
          <ImageUploader setImages={setImages} setProcessedImages={setProcessedImages} />
          <DownloadButton processedImages={processedImages} />
        </>
      ) : (
        <StudioMode />
      )}
    </div>
  );
}

export default App;