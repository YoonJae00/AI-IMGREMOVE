import { useState, useEffect } from 'react';

const QUOTA_KEY = {
  BACKGROUND: 'bgrem_quota',
  STUDIO: 'studio_quota'
};

const QUOTA_LIMIT = {
  BACKGROUND: 1000,
  STUDIO: 30
};

// 마지막 초기화 날짜를 저장할 키
const LAST_RESET_DATE = 'last_reset_date';

export function useQuota() {
  const [quota, setQuota] = useState(() => {
    const lastResetDate = localStorage.getItem(LAST_RESET_DATE);
    const today = new Date().toDateString();
    const savedQuota = localStorage.getItem('quota');
    
    // 날짜가 바뀌었을 때만 초기화
    if (lastResetDate !== today) {
      const initialQuota = {
        background: QUOTA_LIMIT.BACKGROUND,
        studio: QUOTA_LIMIT.STUDIO
      };
      localStorage.setItem(LAST_RESET_DATE, today);
      localStorage.setItem('quota', JSON.stringify(initialQuota));
      return initialQuota;
    }
    
    // 같은 날이면 저장된 값 사용
    if (savedQuota) {
      return JSON.parse(savedQuota);
    }
    
    // 저장된 값이 없는 경우에만 초기값 사용
    const initialQuota = {
      background: QUOTA_LIMIT.BACKGROUND,
      studio: QUOTA_LIMIT.STUDIO
    };
    localStorage.setItem('quota', JSON.stringify(initialQuota));
    return initialQuota;
  });

  const incrementQuota = (type) => {
    setQuota(prev => {
      const newQuota = {
        ...prev,
        [type]: Math.max(0, prev[type] - 1)
      };
      localStorage.setItem('quota', JSON.stringify(newQuota));
      return newQuota;
    });
  };

  const checkQuota = (type) => {
    return quota[type] > 0;
  };

  const getRemainingQuota = (type) => {
    return quota[type];
  };

  return {
    quota,
    incrementQuota,
    checkQuota,
    getRemainingQuota,
    limits: QUOTA_LIMIT
  };
} 