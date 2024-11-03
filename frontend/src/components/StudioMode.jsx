import React, { useState, useEffect } from 'react';
import './StudioMode.css';

function StudioMode({ studioImage, quota, limits, checkQuota, incrementQuota }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedImage, setProcessedImage] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [originalFileName, setOriginalFileName] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        return () => {
            if (studioImage?.preview) {
                URL.revokeObjectURL(studioImage.preview);
            }
        };
    }, [studioImage]);

    const handleStudioProcess = async () => {
        if (!studioImage) return;
        
        if (!checkQuota('studio')) {
            alert('일일 처리 한도를 초과했습니다.');
            return;
        }
        
        setIsProcessing(true);
        setError(null);
        
        try {
            const formData = new FormData();
            formData.append('image', studioImage.file);

            const response = await fetch('/api/studio-process', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('이미지 처리 실패');
            }

            const result = await response.json();
            
            if (result.success) {
                setProcessedImage(result.data.url);
                setDownloadUrl(result.data.url);
                setOriginalFileName(studioImage.file.name);
                incrementQuota('studio');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('처리 중 오류:', error);
            setError(error.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl || !originalFileName) return;
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = originalFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="studio-workspace">
            <div className="workspace-header">
                <div className="workspace-info">
                    <div className="info-item">
                        <span className="info-icon">✨</span>
                        <div className="info-text">
                            <span className="info-label">남은 처리 횟수</span>
                            <span className="info-value">{quota.studio}/{limits.STUDIO}회</span>
                        </div>
                    </div>
                </div>
                <button 
                    className="process-button"
                    onClick={handleStudioProcess}
                    disabled={!studioImage || isProcessing}
                >
                    {isProcessing ? '처리 중...' : '고품질 처리 시작'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="workspace-content">
                <div className="image-container">
                    <div className="image-section">
                        <div className="image-header">
                            <h3>원본 이미지</h3>
                        </div>
                        <div className="image-view">
                            {studioImage ? (
                                <img src={studioImage.preview} alt="원본" />
                            ) : (
                                <div className="empty-state">
                                    <span className="icon">📸</span>
                                    <p>이미지를 업로드해주세요</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="image-section">
                        <div className="image-header">
                            <h3>처리된 이미지</h3>
                            {processedImage && (
                                <button 
                                    className="download-button"
                                    onClick={handleDownload}
                                >
                                    다운로드
                                </button>
                            )}
                        </div>
                        <div className="image-view">
                            {processedImage ? (
                                <img src={processedImage} alt="처리된 이미지" />
                            ) : (
                                <div className="empty-state">
                                    <span className="icon">✨</span>
                                    <p>처리된 이미지가 여기에 표시됩니다</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudioMode;
