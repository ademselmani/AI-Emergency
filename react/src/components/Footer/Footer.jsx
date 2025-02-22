import React from "react";

function Footer() {
  const currentYear = new Date().getFullYear(); // Get the current year

  return (
   
      <div className="container-xxl d-flex flex-wrap justify-content-between py-2 flex-md-row flex-column">
        <div className="mb-2 mb-md-0">
          © {currentYear}, made with ❤️ by
          <a href="https://themeselection.com" target="_blank" rel="noopener noreferrer" className="footer-link fw-bolder">
            ThemeSelection
          </a>
        </div>
        <div>
          <a href="https://themeselection.com/license/" className="footer-link me-4" target="_blank" rel="noopener noreferrer">License</a>
          <a href="https://themeselection.com/" target="_blank" rel="noopener noreferrer" className="footer-link me-4">More Themes</a>
          <a href="https://themeselection.com/demo/sneat-bootstrap-html-admin-template/documentation/" target="_blank" rel="noopener noreferrer" className="footer-link me-4">Documentation</a>
          <a href="https://github.com/themeselection/sneat-html-admin-template-free/issues" target="_blank" rel="noopener noreferrer" className="footer-link me-4">Support</a>
        </div>
      </div>
   );
}

export default Footer;
