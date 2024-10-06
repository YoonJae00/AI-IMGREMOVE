import React, { useState } from 'react';
import '../styles/StudioMode.css';

function StudioMode() {
  const [studioImage, setStudioImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setStudioImage(URL.createObjectURL(file));
  };

  return (
    <div className="StudioMode">
      <h2>스튜디오 사진 모드</h2>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
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