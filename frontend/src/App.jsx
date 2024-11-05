import React, { useState, useCallback } from 'react';
import ModeSwitcher from './components/ModeSwitcher';
import UploadSection from './components/UploadSection';
import ProcessOptions from './components/ProcessOptions';
import WorkspaceHeader from './components/WorkspaceHeader';
import ImageGrid from './components/ImageGrid';
import WorkspaceFooter from './components/WorkspaceFooter';
import StudioMode from './components/StudioMode';
import Footer from './components/Footer';
import './styles/design-system.css';
import './styles/components.css';
import axios from 'axios';
import JSZip from 'jszip';
import { useQuota } from './hooks/useQuota';

function App() {
    const { quota, incrementQuota, checkQuota, limits } = useQuota();
    const [activeTab, setActiveTab] = useState('removeBackground');
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processedResults, setProcessedResults] = useState({});
    const [backgroundType, setBackgroundType] = useState('transparent');
    const [customBackground, setCustomBackground] = useState(null);
    const [studioImage, setStudioImage] = useState(null);
    const [error, setError] = useState(null);
    const [imageProgress, setImageProgress] = useState({});

    const handleFileDrop = useCallback((acceptedFiles) => {
        if (activeTab === 'studio') {
            const file = acceptedFiles[0];
            const preview = URL.createObjectURL(file);
            setStudioImage({ file, preview });
        } else {
            if (previews.length + acceptedFiles.length > 50) {
                alert('최대 50개의 이미지만 업로드할 수 있습니다.');
                acceptedFiles = acceptedFiles.slice(0, 50 - previews.length);
            }
            
            const newPreviews = acceptedFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            setPreviews(prev => [...prev, ...newPreviews]);
            setFiles(prev => [...prev, ...newPreviews.map(preview => preview.file)]);
        }
    }, [activeTab, previews.length]);

    const handleBulkProcess = async () => {
        if (!checkQuota('background')) {
            alert('일일 처리 한도를 초과했습니다.');
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);
            
            const initialProgress = {};
            selectedImages.forEach(index => {
                initialProgress[index] = { progress: 0, status: 'pending' };
            });
            setImageProgress(initialProgress);
            
            const formData = new FormData();
            selectedImages.forEach(index => {
                formData.append('photos', files[index]);
            });

            formData.append('backgroundType', backgroundType);

            if (backgroundType === 'custom' && customBackground) {
                formData.append('background', customBackground);
            }

            const response = await fetch('/api/remove-background', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error || '이미지 처리 실패');
            
            const completedProgress = {};
            selectedImages.forEach(index => {
                completedProgress[index] = { progress: 100, status: 'completed' };
            });
            setImageProgress(completedProgress);
            
            const newResults = {};
            result.data.forEach((img, idx) => {
                const index = selectedImages[idx];
                newResults[index] = { url: img.url };
            });
            
            setProcessedResults(prev => ({...prev, ...newResults}));
            selectedImages.forEach(() => incrementQuota('background'));
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
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
            console.error('다운로드 중 오류:', error);
            setError('다운로드 중 오류가 발생했습니다.');
        }
    };

    const handleImageSelect = (index) => {
        setSelectedImages(prev => {
            if (prev.includes(index)) {
                return prev.filter(i => i !== index);
            }
            return [...prev, index];
        });
    };

    const estimatedTime = Math.ceil(previews.length * 5 / 60); // 분 단위로 변환

    const handleSelectAll = () => {
        if (selectedImages.length === previews.length) {
            // 모두 선택된 상태면 전 해제
            setSelectedImages([]);
        } else {
            // 아니면 전체 선택
            setSelectedImages(previews.map((_, index) => index));
        }
    };

    const removeImage = (index) => {
        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[index].preview);
        newPreviews.splice(index, 1);
        setPreviews(newPreviews);
        
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
        
        // 선택된 이미지에서도 제거
        setSelectedImages(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
        
        // 처리된 결과에서도 제거
        const newResults = { ...processedResults };
        delete newResults[index];
        // 인덱스 재조정
        const adjustedResults = {};
        Object.entries(newResults).forEach(([key, value]) => {
            const newKey = Number(key) > index ? Number(key) - 1 : Number(key);
            adjustedResults[newKey] = value;
        });
        setProcessedResults(adjustedResults);
    };

    return (
        <div className="app-container">
            <div className="app-content">
                <header className="header">
                    <div className="header-content">
                        <div className="logo">
                            <h1>For Seller</h1>
                        </div>
                        <div className="header-actions">
                            <div className="quota-container">
                                <div className="quota-item">
                                    <span className="quota-icon">🎯</span>
                                    <div className="quota-text">
                                        <span className="quota-label">배경제거</span>
                                        <span className="quota-value">{quota.background}/{limits.BACKGROUND}</span>
                                    </div>
                                </div>
                                <div className="quota-item">
                                    <span className="quota-icon">✨</span>
                                    <div className="quota-text">
                                        <span className="quota-label">스튜디오</span>
                                        <span className="quota-value">{quota.studio}/{limits.STUDIO}</span>
                                    </div>
                                </div>
                            </div>
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
                                setStudioImage(null);
                            }} 
                        />
                        <UploadSection 
                            onDrop={handleFileDrop}
                            mode={activeTab}
                        />
                        {activeTab === 'removeBackground' && 
                            <ProcessOptions 
                                backgroundType={backgroundType}
                                setBackgroundType={setBackgroundType}
                                customBackground={customBackground}
                                setCustomBackground={setCustomBackground}
                            />
                        }
                    </aside>

                    <section className="workspace">
                        {activeTab === 'removeBackground' ? (
                            <>
                                <WorkspaceHeader 
                                    totalImages={previews.length}
                                    processedImages={selectedImages.length}
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
                                    remainingQuota={quota.background}
                                    totalQuota={limits.BACKGROUND}
                                    onBulkProcess={handleBulkProcess}
                                    onDownloadAll={handleDownloadSelected}
                                    isProcessing={isProcessing}
                                    totalImages={previews.length}
                                />
                            </>
                        ) : (
                            <StudioMode 
                                studioImage={studioImage} 
                                quota={quota}
                                limits={limits}
                                checkQuota={checkQuota}
                                incrementQuota={incrementQuota}
                            />
                        )}
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
}

export default App;

