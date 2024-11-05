import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import BackgroundSelector from './BackgroundSelector';

function ImageUploader({ onProcess, quota, limits, checkQuota }) {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backgroundType, setBackgroundType] = useState('transparent');
  const [customBackground, setCustomBackground] = useState(null);

  const onDropOriginal = useCallback((acceptedFiles) => {
    if (previews.length + acceptedFiles.length > 50) {
      alert('최대 50개의 이미지만 업로드할 수 있습니다.');
      acceptedFiles = acceptedFiles.slice(0, 50 - previews.length);
    }

    const newPreviews = [...previews, ...acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))];
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  }, [previews]);

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  };

  const clearAllImages = () => {
    setPreviews([]);
    setFiles([]);
    setCustomBackground(null);
  };

  const {
    getRootProps: getOriginalRootProps,
    getInputProps: getOriginalInputProps,
    isDragActive: isOriginalDragActive
  } = useDropzone({
    onDrop: onDropOriginal,
    accept: 'image/*',
    multiple: true
  });

  const uploadAndProcess = async () => {
    if (!checkQuota('background')) {
      alert('일일 처리 한도를 초과했습니다.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const formData = new FormData();
      files.forEach(file => {
        formData.append('photos', file);
      });

      formData.append('backgroundType', backgroundType);

      if (backgroundType === 'custom' && customBackground) {
        formData.append('background', customBackground);
      }

      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('이미지 처리 실패');
      }

      const result = await response.json();
      
      if (result.success) {
        onProcess(result.data);
        clearAllImages();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('업로드 또는 처리 중 오류 발생:', error);
      setError(error.message || '오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="left-panel">
        <div {...getOriginalRootProps()} className="instagram-upload-area">
          <input {...getOriginalInputProps()} />
          <div className="upload-icon">
            <svg aria-label="이미지 업로드" color="#262626" fill="#262626" height="77" role="img" viewBox="0 0 97.6 77.3" width="96">
              <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path>
              <path d="M84.7 18.4 58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1zM7.2 10.8C8.7 9.1 10.8 8.1 13 8l34-1.9c4.6-.3 8.6 3.3 8.9 7.9l.2 2.8-5.3-.3c-5.7-.3-10.7 4-11 9.8l-.6 9.5-9.5 10.7c-.2.3-.6.4-1 .5-.4 0-.7-.1-1-.4l-7.8-7c-1.4-1.3-3.5-1.1-4.8.3L7 49 5.2 17c-.2-2.3.6-4.5 2-6.2zm8.7 48c-4.3.2-8.1-2.8-8.8-7.1l9.4-10.5c.2-.3.6-.4 1-.5.4 0 .7.1 1 .4l7.8 7c.7.6 1.6.9 2.5.9.9 0 1.7-.5 2.3-1.1l7.8-8.8-1.1 18.6-21.9 1.1zm76.5-29.5-2 34c-.3 4.6-4.3 8.2-8.9 7.9l-34-2c-4.6-.3-8.2-4.3-7.9-8.9l2-34c.3-4.4 3.9-7.9 8.4-7.9h.5l34 2c4.7.3 8.2 4.3 7.9 8.9z" fill="currentColor"></path>
            </svg>
            <span>이미지를 여기에 끌어다 놓으세요</span>
            <span className="upload-limit">(최대 50장)</span>
          </div>
        </div>

        <div className="background-options">
          <div className="option-buttons">
            <button
              className={`option-button ${backgroundType === 'transparent' ? 'active' : ''}`}
              onClick={() => setBackgroundType('transparent')}
            >
              투명 배경
            </button>
            <button
              className={`option-button ${backgroundType === 'custom' ? 'active' : ''}`}
              onClick={() => setBackgroundType('custom')}
            >
              새 배경 추가
            </button>
          </div>

          {backgroundType === 'custom' && (
            <BackgroundSelector 
              setBackgroundImage={setCustomBackground}
              currentBackground={customBackground}
            />
          )}
        </div>
      </div>

      <div className="right-panel">
        <div className="instagram-preview-grid">
          {previews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img src={preview.preview} alt={`미리보기 ${index + 1}`} />
              <button className="remove-button" onClick={() => removeImage(index)}>×</button>
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="control-panel">
          <div className="upload-status">
            <span className="image-count">{previews.length}/50 이미지</span>
            <div className="action-buttons">
              <button 
                className="clear-button" 
                onClick={clearAllImages}
                disabled={previews.length === 0}
              >
                전체 삭제
              </button>
              <button 
                className="process-button" 
                onClick={uploadAndProcess}
                disabled={previews.length === 0 || isLoading}
              >
                {isLoading ? '처리 중...' : '배경 제거하기'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
