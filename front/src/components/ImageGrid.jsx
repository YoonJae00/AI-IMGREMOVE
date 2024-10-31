import React, { useState } from 'react';
import ImageCard from './ImageCard';
import '../styles/ImageGrid.css';

function ImageGrid({ images = [], onImageSelect }) {
  const [selectedImages, setSelectedImages] = useState([]);

  const toggleImageSelection = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === images.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(img => img.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedImages([]);
  };

  return (
    <div className="image-grid">
      <div className="grid-header">
        <div className="grid-stats">
          <span className="total-images">총 {images.length}장</span>
          <span className="selected-images">선택됨 {selectedImages.length}장</span>
        </div>
        <div className="grid-actions">
          <button 
            className="select-all"
            onClick={handleSelectAll}
          >
            {selectedImages.length === images.length ? '선택해제' : '전체선택'}
          </button>
          <button 
            className="clear-all"
            onClick={handleClearSelection}
            disabled={selectedImages.length === 0}
          >
            선택해제
          </button>
        </div>
      </div>

      <div className="grid-content">
        {images.map((image, index) => (
          <ImageCard 
            key={image.id}
            image={image}
            isSelected={selectedImages.includes(image.id)}
            onSelect={() => toggleImageSelection(image.id)}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageGrid; 