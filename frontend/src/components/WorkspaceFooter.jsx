import React from 'react';
import '../styles/components.css';

function WorkspaceFooter({ 
    estimatedTime, 
    remainingQuota,
    totalQuota, 
    onBulkProcess, 
    onDownloadAll, 
    isProcessing,
    totalImages
}) {
    const handleBulkProcessClick = () => {
        console.log('일괄 처리 시작 버튼 클릭됨');
        onBulkProcess();
    };

    return (
        <div className="workspace-footer">
            <div className="processing-info">
                <div className="info-item">
                    <span className="info-icon">⏱️</span>
                    <div className="info-text">
                        <span className="info-label">예상 처리 시간</span>
                        <span className="info-value">약 {estimatedTime}분</span>
                    </div>
                </div>
                <div className="info-item">
                    <span className="info-icon">🎯</span>
                    <div className="info-text">
                        <span className="info-label">남은 처리 횟수</span>
                        <span className="info-value">{remainingQuota}/{totalQuota}회</span>
                    </div>
                </div>
            </div>
            
            <div className="action-buttons">
                <button 
                    className="action-button"
                    onClick={onDownloadAll}
                    disabled={isProcessing || totalImages === 0}
                >
                    <span className="button-icon">📥</span>
                    전체 다운로드
                </button>
                <button 
                    className="action-button primary"
                    onClick={handleBulkProcessClick}
                    disabled={isProcessing || totalImages === 0 || remainingQuota === 0}
                >
                    <span className="button-icon">✨</span>
                    {isProcessing ? '처리 중...' : '일괄 처리 시작'}
                </button>
            </div>
        </div>
    );
}

export default WorkspaceFooter; 