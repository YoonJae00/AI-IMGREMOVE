import React from 'react';
import '../styles/ImageCard.css';

function ImageCard({ image, isSelected, onSelect }) {
  return (
    <div 
      className={`image-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="image-preview">
        <img src={image.preview} alt={image.name} />
        {isSelected && (
          <div className="selected-overlay">
            <span className="checkmark">✓</span>
          </div>
        )}
      </div>
      <div className="image-info">
        <span className="image-name">{image.name}</span>
        <span className="image-status">{image.status}</span>
      </div>
    </div>
  );
}

export default ImageCard; 