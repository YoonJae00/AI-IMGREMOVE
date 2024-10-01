import React from 'react';
import '../styles/ImageDisplay.css';

function ImageDisplay({ processedImages }) {
  return (
    <div className="ImageDisplay">
      <h2>처리된 이미지</h2>
      <div className="image-grid">
        {processedImages.map((image, index) => (
          <div key={index} className="image-item">
            <img src={image} alt={`처리된 이미지 ${index + 1}`} className="processed-image" />
            <span className="image-number">{index + 1}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageDisplay;