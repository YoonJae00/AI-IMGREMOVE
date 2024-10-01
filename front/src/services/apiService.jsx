export async function removeBackground(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
  
    try {
      const response = await fetch('YOUR_API_ENDPOINT', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('API 요청 실패');
      }
  
      const result = await response.blob();
      return URL.createObjectURL(result);
    } catch (error) {
      console.error('API 오류:', error);
      throw error;
    }
  }