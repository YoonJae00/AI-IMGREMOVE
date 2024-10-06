import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/BackgroundSelector.css';

function BackgroundSelector({ setBackgroundImage }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setBackgroundImage(acceptedFiles[0]);
        }
    }, [setBackgroundImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    return (
        <div className="BackgroundSelector">
            <h3>배경 이미지 선택</h3>
            <div {...getRootProps()} className="background-dropzone">
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>배경 이미지를 여기에 놓으세요...</p>
                ) : (
                    <p>배경 이미지를 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
                )}
            </div>
        </div>
    );
}

export default BackgroundSelector;