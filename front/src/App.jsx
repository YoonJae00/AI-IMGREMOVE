import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader.jsx';
import DownloadButton from './components/DownloadButton.jsx';
import './styles/App.css';
import Footer from './components/Footer.jsx';

function App() {
  const [images, setImages] = useState([]);
  const [processedImages, setProcessedImages] = useState([]);

  return (
    <div className="App">
      <div className="notice">
        <p>IP당 하루 요청 10번만 가능합니다</p>
      </div>
      <h1>이미지 가공 for Seller</h1>
      <ImageUploader setImages={setImages} setProcessedImages={setProcessedImages} />
      <DownloadButton processedImages={processedImages} />
      <div style={{ marginBottom: '100px' }}></div>
      <Footer />
    </div>
  );
}

export default App;