import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/StudioMode.css';

function StudioMode() {
    const [studioImage, setStudioImage] = useState(null);

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            const file = acceptedFiles[0];
            setStudioImage(URL.createObjectURL(file));
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    return (
        <div className="StudioMode">
            <h2>스튜디오 사진 모드</h2>
            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>이미지를 여기에 놓으세요...</p>
                ) : (
                    <p>이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
                )}
            </div>
            {studioImage && (
                <div className="studio-preview">
                    <img src={studioImage} alt="Studio preview" />
                </div>
            )}
            <button className="apply-effects-button" disabled={!studioImage}>
                효과 적용하기
            </button>
        </div>
    );
}

export default StudioMode;