import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function StudioMode() {
    const [studioImage, setStudioImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setStudioImage({
                file,
                preview: URL.createObjectURL(file)
            });
        }
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png']
        },
        multiple: false,
        maxFiles: 1
    });

    const handleStudioProcess = async () => {
        try {
            setIsProcessing(true);
            const formData = new FormData();
            formData.append('photo', studioImage.file);

            const response = await axios.post('http://localhost:3000/process-studio', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setProgress(progress);
                }
            });

            // 처리된 이미지 다운로드
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'studio_result.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('스튜디오 처리 중 오류:', error);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
            setProgress(0);
        }
    };

    return (
        <>
            <div className="workspace-header">
                <div className="workspace-stats">
                    <div className="stat-item">
                        <span className="stat-label">처리 시간</span>
                        <span className="stat-value">약 30초</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-label">처리 상태</span>
                        <span className="stat-value">{isProcessing ? '처리 중...' : '대기 중'}</span>
                    </div>
                </div>
            </div>

            <div className="studio-workspace">
                <div className="studio-preview-area">
                    {studioImage ? (
                        <div className="studio-image-preview">
                            <img src={studioImage.preview} alt="스튜디오 이미지" />
                            {isProcessing && (
                                <div className="processing-overlay">
                                    <div className="progress-bar">
                                        <div 
                                            className="progress-fill" 
                                            style={{ width: `${progress}%` }} 
                                        />
                                    </div>
                                    <span className="progress-text">{progress}%</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="studio-upload-placeholder">
                            <span className="upload-icon">📸</span>
                            <p>고품질 처리를 위한 이미지를 업로드하세요</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="workspace-footer">
                <div className="processing-info">
                    <div className="time-estimate">
                        <span className="info-label">예상 처리 시간:</span>
                        <span className="info-value">약 30초</span>
                    </div>
                    <div className="daily-quota">
                        <span className="info-label">남은 처리 횟수:</span>
                        <span className="info-value">9/10회</span>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button 
                        className="action-button primary"
                        onClick={handleStudioProcess}
                        disabled={!studioImage || isProcessing}
                    >
                        <span className="button-icon">✨</span>
                        {isProcessing ? '처리 중...' : '고품질 처리 시작'}
                    </button>
                </div>
            </div>
        </>
    );
}

export default StudioMode;
