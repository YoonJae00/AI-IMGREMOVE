import React from 'react';

function ImageGrid({ 
    previews, 
    onRemove, 
    selectedImages, 
    onSelect,
    processedResults,
    imageProgress,
    isProcessing 
}) {
    return (
        <div className="image-grid">
            {previews.map((preview, index) => {
                const progress = imageProgress[index]?.progress || 0;
                const status = imageProgress[index]?.status || 'pending';

                return (
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
                            <div className={`progress-bar ${status === 'pending' ? 'pending' : ''}`}>
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }} 
                                />
                            </div>
                            <div className="progress-status">
                                <span className={status === 'pending' ? 'pending-text' : ''}>
                                    {status === 'pending' ? '처리 대기 중' : 
                                     status === 'completed' ? '완료' : '처리 중...'}
                                </span>
                                <span>{progress}%</span>
                            </div>
                        </div>

                        <div className="image-item result">
                            {processedResults[index] ? (
                                <img src={processedResults[index].url} alt={`결과 ${index + 1}`} />
                            ) : (
                                <div className="result-placeholder pending">
                                    <span className="pending-icon">⏳</span>
                                    <span>처리 대기 중</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default ImageGrid; 