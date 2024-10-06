import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../styles/ImageUploader.css';

function ImageUploader() {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const onDropOriginal = useCallback((acceptedFiles) => {
    if (previews.length + acceptedFiles.length > 10) {
      alert('최대 10개의 이미지만 업로드할 수 있습니다.');
      acceptedFiles = acceptedFiles.slice(0, 10 - previews.length);
    }

    const newPreviews = [...previews, ...acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))];
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  }, [previews]);

  const onDropBackground = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setBackgroundImage(acceptedFiles[0]);
    }
  }, []);

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  };

  const clearAllImages = () => {
    setPreviews([]);
    setFiles([]);
    setBackgroundImage(null);
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

  const {
    getRootProps: getBackgroundRootProps,
    getInputProps: getBackgroundInputProps,
    isDragActive: isBackgroundDragActive
  } = useDropzone({
    onDrop: onDropBackground,
    accept: 'image/*',
    multiple: false
  });

  const uploadAndProcess = async () => {
    try {
      setIsLoading(true);
      const totalTime = files.length * 7;
      setEstimatedTime(totalTime);
      setRemainingTime(totalTime);

      const timer = setInterval(() => {
        setRemainingTime((prevTime) => {
          if (prevTime <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('photos', file);
      });

      if (backgroundImage) {
        formData.append('background', backgroundImage);
      }

      const response = await axios.post('http://localhost:3000/process-images', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 처리된 이미지 다운로드 로직
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_images.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('이미지 처리 및 다운로드 완료');
    } catch (error) {
      console.error('업로드 또는 처리 중 오류 발생:', error);
      alert('오류가 발생했습니다. 나중에 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
      setEstimatedTime(0);
      setRemainingTime(0);
    }
  };

  return (
      <div className="ImageUploader">
        <div className="dropzone-container">
          <div {...getOriginalRootProps()} className="dropzone original-dropzone">
            <input {...getOriginalInputProps()} />
            {isOriginalDragActive ? (
                <p>원본 이미지를 여기에 놓으세요...</p>
            ) : (
                <p>원본 이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요 (최대 10개)</p>
            )}
          </div>
          <div className="plus-sign">+</div>
          <div {...getBackgroundRootProps()} className="dropzone background-dropzone">
            <input {...getBackgroundInputProps()} />
            {isBackgroundDragActive ? (
                <p>배경 이미지를 여기에 놓으세요...</p>
            ) : (
                <p>배경 이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
            )}
          </div>
        </div>
        <div className="previews">
          {previews.map((preview, index) => (
              <div key={index} className="preview-container">
                <img src={preview.preview} alt={`미리보기 ${index + 1}`} className="preview-image" />
                <button className="remove-button" onClick={() => removeImage(index)}>×</button>
              </div>
          ))}
        </div>
        {previews.length > 0 && (
            <button className="clear-all-button" onClick={clearAllImages}>
              전체 삭제
            </button>
        )}
        {previews.length > 0 && backgroundImage && (
            <div className="combined-preview">
              <h3>미리보기</h3>
              <div className="preview-row">
                <img src={previews[0].preview} alt="원본 이미지" className="preview-image" />
                <span>+</span>
                <img src={URL.createObjectURL(backgroundImage)} alt="배경 이미지" className="preview-image" />
              </div>
            </div>
        )}
        <button
            className="upload-download-button"
            onClick={uploadAndProcess}
            disabled={files.length === 0 || isLoading || !backgroundImage}
        >
          {isLoading ? '처리 중...' : '이미지 처리 및 다운로드'}
        </button>
        {isLoading && (
            <div className="loading-overlay">
              <div className="loading-content">
                <div className="loading-bar-container">
                  <div
                      className="loading-bar"
                      style={{width: `${(estimatedTime - remainingTime) / estimatedTime * 100}%`}}
                  ></div>
                </div>
                <p>처리 중... 남은 시간: {remainingTime}초</p>
              </div>
            </div>
        )}
      </div>
  );
}

export default ImageUploader;