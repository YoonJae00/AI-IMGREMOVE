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
import JSZip from 'jszip';

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
            
            selectedImages.forEach(index => {
                formData.append('photos', files[index]);
            });

            const response = await fetch('http://localhost:3000/api/remove-background', {
                method: 'POST',
                body: formData
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const events = decoder.decode(value).split('\n\n');
                for (const event of events) {
                    if (!event.trim()) continue;
                    
                    try {
                        const parsedData = JSON.parse(event.replace('data: ', ''));
                        
                        switch (parsedData.type) {
                            case 'progress':
                                const { currentImage } = parsedData.data;
                                const index = selectedImages.findIndex(i => 
                                    files[i].name === currentImage.originalName
                                );
                                
                                if (index !== -1) {
                                    setImageProgress(prev => ({
                                        ...prev,
                                        [index]: {
                                            progress: currentImage.progress,
                                            status: currentImage.status
                                        }
                                    }));

                                    if (currentImage.status === 'completed') {
                                        setProcessedResults(prev => ({
                                            ...prev,
                                            [index]: {
                                                url: currentImage.url,
                                                status: 'completed'
                                            }
                                        }));
                                        setProcessedCount(prev => prev + 1);
                                    }
                                }
                                break;

                            case 'complete':
                                console.log('모든 이미지 처리 완료');
                                break;

                            case 'error':
                                console.error('Error:', parsedData.error);
                                break;
                        }
                    } catch (error) {
                        console.error('Event parsing error:', error);
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            alert('처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadSelected = async () => {
        if (selectedImages.length === 0) {
            alert('다운로드할 이미지를 선택해주세요.');
            return;
        }

        try {
            const zip = new JSZip();
            const promises = selectedImages.map(async (index) => {
                if (processedResults[index]) {
                    const response = await fetch(processedResults[index].url);
                    const blob = await response.blob();
                    const originalFileName = files[index].name;
                    const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf('.'));
                    zip.file(`${fileNameWithoutExt}.png`, blob);
                }
            });

            await Promise.all(promises);
            
            const content = await zip.generateAsync({ type: 'blob' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'processed_images.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('다운로드 중 오류 발생:', error);
            alert('다운로드 중 오류가 발생했습니다.');
        }
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
