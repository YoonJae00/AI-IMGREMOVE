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
    const [processedResults, setProcessedResults] = useState([]);
    const [currentProgress, setCurrentProgress] = useState({});

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
        try {
            setIsProcessing(true);
            const formData = new FormData();
            
            // 선택된 이미지만 처리
            const selectedFiles = selectedImages.map(index => files[index]);
            selectedFiles.forEach(file => {
                formData.append('photos', file);
            });

            if (backgroundType === 'custom' && customBackground) {
                formData.append('background', customBackground);
            }

            const response = await axios.post('http://localhost:3000/process-images', formData, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setCurrentProgress(prev => ({
                        ...prev,
                        total: progress
                    }));
                }
            });

            const processedImageUrls = await handleProcessedResponse(response);
            setProcessedResults(prev => ({
                ...prev,
                ...processedImageUrls
            }));
            setProcessedCount(prev => prev + selectedFiles.length);

        } catch (error) {
            console.error('처리 중 오류 발생:', error);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
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
                                currentProgress={currentProgress}
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
