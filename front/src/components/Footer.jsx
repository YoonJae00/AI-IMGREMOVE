import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>contact : <a href="mailto:realyoon77@gmail.com">realyoon77@gmail.com</a></p>
        <p>&copy; 2024 ForSeller. All rights reserved.</p>
        <p>
          <a href="https://forms.gle/bhF7JZQr3oiaTvma9" target="_blank" rel="noopener noreferrer">
            설문조사 (추후 개선사항에 참고하겠습니다)
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;