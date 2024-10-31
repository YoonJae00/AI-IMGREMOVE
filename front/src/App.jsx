import React, { useState, useCallback } from 'react';
import ModeSwitcher from './components/ModeSwitcher';
import UploadSection from './components/UploadSection';
import ProcessOptions from './components/ProcessOptions';
import WorkspaceHeader from './components/WorkspaceHeader';
import ImageGrid from './components/ImageGrid';
import WorkspaceFooter from './components/WorkspaceFooter';
import StudioMode from './components/StudioMode';
import './styles/design-system.css';
import './styles/components.css';
import axios from 'axios';

function App() {
    const [activeTab, setActiveTab] = useState('removeBackground');
    const [showExamples, setShowExamples] = useState(false);
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [processedCount, setProcessedCount] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedResults, setProcessedResults] = useState({});
    const [imageProgress, setImageProgress] = useState({});
    const [backgroundType, setBackgroundType] = useState('transparent');
    const [customBackground, setCustomBackground] = useState(null);

    const handleFileDrop = useCallback((acceptedFiles) => {
        if (activeTab === 'removeBackground' && previews.length + acceptedFiles.length > 50) {
            alert('최대 50개의 이미지만 업로드할 수 있습니다.');
            acceptedFiles = acceptedFiles.slice(0, 50 - previews.length);
        }

        const newPreviews = [...previews, ...acceptedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }))];
        setPreviews(newPreviews);
        setFiles(newPreviews.map(preview => preview.file));
    }, [previews, activeTab]);

    const removeImage = (index) => {
        const newPreviews = [...previews];
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
        setFiles(newPreviews.map(preview => preview.file));
    };

    const estimatedTime = Math.ceil(previews.length * 5 / 60); // 분 단위로 변환

    const handleImageSelect = (index) => {
        setSelectedImages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const handleBulkProcess = async () => {
        if (selectedImages.length === 0) {
            alert('처리할 이미지를 선택해주세요.');
            return;
        }

        try {
            setIsProcessing(true);
            const formData = new FormData();
            
            // 선택된 이미지들 추가
            const selectedFiles = selectedImages.map(index => files[index]);
            selectedFiles.forEach(file => {
                formData.append('photos', file);
            });

            // 배경 타입과 배경 이미지 추가
            formData.append('backgroundType', backgroundType);
            if (backgroundType === 'custom' && customBackground) {
                formData.append('background', customBackground);
            }

            // 진행 상태 모니터링 설정
            const eventSource = new EventSource('http://localhost:3000/api/remove-background/progress');
            
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                // 이미지 ID로 인덱스 찾기
                const index = selectedImages.findIndex(i => 
                    files[i].name === data.imageId || // 파일명으로 매칭
                    i === parseInt(data.imageId) // 인덱스로 매칭
                );
                
                if (index !== -1) {
                    setImageProgress(prev => ({
                        ...prev,
                        [index]: {
                            progress: data.progress,
                            status: data.status
                        }
                    }));
                }
            };

            // API 요청
            const response = await axios.post('http://localhost:3000/api/remove-background', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            eventSource.close();

            if (response.data.success) {
                const { processedImages } = response.data.data;
                
                // 처리된 이미지 결과 저장
                const newResults = {};
                processedImages.forEach(img => {
                    // 파일명이나 인덱스로 매칭
                    const index = selectedImages.findIndex(i => 
                        files[i].name === img.originalName || 
                        i === parseInt(img.id)
                    );
                    
                    if (index !== -1) {
                        newResults[index] = {
                            url: img.url,
                            status: img.status,
                            error: img.error
                        };
                    }
                });

                setProcessedResults(prev => ({
                    ...prev,
                    ...newResults
                }));

                // 처리된 이미지 수 업데이트
                setProcessedCount(prev => prev + processedImages.length);

                // 성공적으로 처리된 이미지가 있다면 알림
                const successCount = processedImages.filter(img => img.status === 'completed').length;
                if (successCount > 0) {
                    alert(`${successCount}개의 이미지가 성공적으로 처리되었습니다.`);
                }
            } else {
                throw new Error(response.data.error?.message || '처리 중 오류가 발생했습니다.');
            }

        } catch (error) {
            console.error('처리 중 오류 발생:', error);
            alert(error.message || '처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
            setImageProgress({});
        }
    };

    const handleDownloadSelected = () => {
        selectedImages.forEach(index => {
            if (processedResults[index]) {
                const link = document.createElement('a');
                link.href = processedResults[index];
                link.download = `processed_image_${index + 1}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedImages.length === previews.length) {
            // 모두 선택된 상태면 전체 해제
            setSelectedImages([]);
        } else {
            // 아니면 전체 선택
            setSelectedImages(previews.map((_, index) => index));
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <div className="header-content">
                    <div className="logo">
                        <h1>For Seller</h1>
                    </div>
                    <div className="header-actions">
                        <span className="quota">일일 처리 가능: 10회</span>
                        <button className="help-button">도움말</button>
                    </div>
                </div>
            </header>

            <main className="main-content">
                <aside className="sidebar">
                    <ModeSwitcher 
                        activeMode={activeTab} 
                        onModeChange={(mode) => {
                            setActiveTab(mode);
                            setPreviews([]);
                            setFiles([]);
                        }} 
                    />
                    <UploadSection 
                        onDrop={handleFileDrop}
                        mode={activeTab}
                    />
                    {activeTab === 'removeBackground' && <ProcessOptions />}
                </aside>

                <section className="workspace">
                    {activeTab === 'removeBackground' ? (
                        <>
                            <WorkspaceHeader 
                                totalImages={previews.length}
                                processedImages={processedCount}
                                estimatedTime={estimatedTime}
                                selectedCount={selectedImages.length}
                                onBulkProcess={handleBulkProcess}
                                onDownloadSelected={handleDownloadSelected}
                                isProcessing={isProcessing}
                                onSelectAll={handleSelectAll}
                                isAllSelected={selectedImages.length === previews.length}
                            />
                            <ImageGrid 
                                previews={previews}
                                onRemove={removeImage}
                                selectedImages={selectedImages}
                                onSelect={handleImageSelect}
                                processedResults={processedResults}
                                imageProgress={imageProgress}
                                isProcessing={isProcessing}
                            />
                            <WorkspaceFooter 
                                estimatedTime={estimatedTime}
                                remainingQuota={10 - processedCount}
                                onBulkProcess={handleBulkProcess}
                                onDownloadAll={handleDownloadSelected}
                                isProcessing={isProcessing}
                                totalImages={previews.length}
                            />
                        </>
                    ) : (
                        <StudioMode />
                    )}
                </section>
            </main>
        </div>
    );
}

export default App;
