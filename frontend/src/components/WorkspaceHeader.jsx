import React from 'react';
import '../styles/components.css';

function WorkspaceHeader({ 
    totalImages, 
    processedImages, 
    estimatedTime, 
    selectedCount,
    onBulkProcess,
    onDownloadSelected,
    isProcessing,
    onSelectAll,
    isAllSelected,
    remainingQuota
}) {
    const handleProcessClick = () => {
        console.log('처리 버튼 클릭됨');
        onBulkProcess();
    };

    return (
        <div className="workspace-header">
            <div className="workspace-stats">
                <button 
                    className="select-all-button"
                    onClick={onSelectAll}
                    disabled={totalImages === 0}
                >
                    {isAllSelected ? '전체 해제' : '전체 선택'}
                </button>
                <div className="stat-item">
                    <span className="stat-label">총 이미지</span>
                    <span className="stat-value">{totalImages}장</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">처리완료</span>
                    <span className="stat-value">{processedImages}장</span>
                </div>
                <div className="stat-item">
                    <span className="stat-label">예상 시간</span>
                    <span className="stat-value">약 {estimatedTime}분</span>
                </div>
            </div>
            
            <div className="workspace-actions">
                <button 
                    className="action-button" 
                    disabled={selectedCount === 0 || isProcessing}
                    onClick={onDownloadSelected}
                >
                    <span className="action-icon">📥</span>
                    선택 다운로드 ({selectedCount})
                </button>
                <button 
                    className="action-button primary"
                    onClick={handleProcessClick}
                    disabled={selectedCount === 0 || isProcessing || remainingQuota <= 0}
                >
                    <span className="action-icon">✨</span>
                    {isProcessing ? '처리 중...' : 
                     remainingQuota <= 0 ? '일일 한도 초과' : '선택 처리하기'}
                </button>
            </div>
        </div>
    );
} 

export default WorkspaceHeader; 