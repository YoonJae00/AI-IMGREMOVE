import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';


function BackgroundSelector({ setBackgroundImage, currentBackground }) {
    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setBackgroundImage(acceptedFiles[0]);
        }
    }, [setBackgroundImage]);

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: 'image/*',
        multiple: false
    });

    return (
        <div className="instagram-background-card">
            <div className="card-header">
                <h3>배경 이미지 선택</h3>
            </div>
            <div {...getRootProps()} className="instagram-upload-area">
                <input {...getInputProps()} />
                <div className="upload-icon">
                    <svg aria-label="배경 이미지 업로드" color="#262626" fill="#262626" height="77" role="img" viewBox="0 0 97.6 77.3" width="96">
                        <path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path>
                        <path d="M84.7 18.4L58 16.9l-.2-3c-.3-5.7-5.2-10.1-11-9.8L12.9 6c-5.7.3-10.1 5.3-9.8 11L5 51v.8c.7 5.2 5.1 9.1 10.3 9.1h.6l21.7-1.2v.6c-.3 5.7 4 10.7 9.8 11l34 2h.6c5.5 0 10.1-4.3 10.4-9.8l2-34c.4-5.8-4-10.7-9.7-11.1z" fill="currentColor"></path>
                    </svg>
                    {currentBackground ? (
                        <span>새로운 배경 이미지로 변경하기</span>
                    ) : (
                        <span>배경 이미지를 여기에 끌어다 놓으세요</span>
                    )}
                    <button className="instagram-select-button">컴퓨터에서 선택</button>
                </div>
            </div>
            {currentBackground && (
                <div className="current-background">
                    <img 
                        src={URL.createObjectURL(currentBackground)} 
                        alt="선택된 배경" 
                    />
                </div>
            )}
        </div>
    );
}

export default BackgroundSelector;
