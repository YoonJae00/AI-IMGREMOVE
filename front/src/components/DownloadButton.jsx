import React from 'react';
import '../styles/DownloadButton.css';

function DownloadButton({ processedImages }) {
  const handleDownload = () => {
    processedImages.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image;
      link.download = `processed_image_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  /*     // <button
    //   className="DownloadButton"
    //   onClick={handleDownload}
    //   disabled={processedImages.length === 0}
    // >
    //   다운로드
    // </button>
   */
  return (
      <>
        </>
  );
}

export default DownloadButton;