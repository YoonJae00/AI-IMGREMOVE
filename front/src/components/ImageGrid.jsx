import React from 'react';

function ImageGrid({ previews, onRemove, selectedImages, onSelect }) {
    return (
        <div className="image-grid">
            {previews.map((preview, index) => (
                <div key={index} className="image-row">
                    <div className="image-item">
                        <input 
                            type="checkbox"
                            className="image-checkbox"
                            checked={selectedImages.includes(index)}
                            onChange={() => onSelect(index)}
                        />
                        <img src={preview.preview} alt={`원본 ${index + 1}`} />
                    </div>
                    
                    <div className="progress-section">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: '30%' }} />
                        </div>
                        <div className="progress-status">
                            <span>처리 중...</span>
                            <span>30%</span>
                        </div>
                        <button className="retry-button">다시 처리하기</button>
                    </div>

                    <div className="image-item">
                        <img src={preview.preview} alt={`결과 ${index + 1}`} />
                        <button className="remove-button" onClick={() => onRemove(index)}>×</button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ImageGrid; 