import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import '../styles/ImageUploader.css';

function ImageUploader() {
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
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

  const removeImage = (index) => {
    const newPreviews = [...previews];
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
    setFiles(newPreviews.map(preview => preview.file));
  };

  const clearAllImages = () => {
    setPreviews([]);
    setFiles([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: 'image/*',
    multiple: true
  });

  const uploadAndDownload = async () => {
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
      formData.append('prompt', JSON.stringify({}));

      const response = await axios.post('http://localhost:3000/uploads', formData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'processed_images.zip');
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('ZIP 파일 다운로드 완료');
    } catch (error) {
      console.error('업로드 또는 다운로드 중 오류 발생:', error);
      if (error.response && error.response.status === 429) {
        alert('일일 요청 한도를 초과했습니다. 내일 다시 시도해주세요.');
      } else {
        alert('오류가 발생했습니다. 나중에 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
      setEstimatedTime(0);
      setRemainingTime(0);
    }
  };

  return (
    <div className="ImageUploader">
      <div {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>이미지를 여기에 놓으세요...</p>
        ) : (
          <p>이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요 (최대 10개)</p>
        )}
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
      <button 
        className="upload-download-button" 
        onClick={uploadAndDownload} 
        disabled={files.length === 0 || isLoading}
      >
        {isLoading ? '처리 중...' : '업로드 및 다운로드'}
      </button>
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-bar-container">
              <div 
                className="loading-bar" 
                style={{width: `${(remainingTime / estimatedTime) * 100}%`}}
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