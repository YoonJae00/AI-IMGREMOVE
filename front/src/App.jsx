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
            <h1>For Seller</h1>
            <div className="mode-descriptions">
                <div className={`mode-description ${activeTab === 'removeBackground' ? 'active' : ''}`}>
                    <h2>이미지 배경 제거 모드</h2>
                    <p>이미지의 배경을 깔끔하게 제거하고, 사용자가 원하는 배경 이미지를 추가할 수 있는 기능입니다.</p>
                </div>
                <div className={`mode-description ${activeTab === 'studioMode' ? 'active' : ''}`}>
                    <h2>스튜디오 사진 모드</h2>
                    <p>이미지의 배경을 제거한 후, AI를 활용한 스튜디오 조명 효과를 적용하여 마치 전문 스튜디오에서 촬영한 것처럼 연출해줍니다.</p>
                </div>
            </div>
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