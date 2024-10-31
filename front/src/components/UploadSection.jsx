import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function UploadSection({ onDrop, mode }) {
  const handleDrop = useCallback((acceptedFiles) => {
    if (mode === 'studio' && acceptedFiles.length > 1) {
      alert('스튜디오 모드에서는 1장만 업로드할 수 있습니다.');
      acceptedFiles = [acceptedFiles[0]];
    }
    onDrop(acceptedFiles);
  }, [mode, onDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: mode !== 'studio',
    maxFiles: mode === 'studio' ? 1 : 50
  });

  return (
    <div className="upload-section">
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="upload-content">
          <span className="upload-icon">📁</span>
          <p>
            {mode === 'studio' 
              ? '고품질 처리를 위한 이미지 1장을 업로드하세요' 
              : '이미지를 드래그하거나 클릭하여 업로드하세요 (최대 50장)'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default UploadSection; 