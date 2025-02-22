import React from 'react';
import { Helmet } from 'react-helmet';

const Head = () => {
  return (
    <Helmet>
      <link rel="icon" type="image/x-icon" href="/assets/assets/img/favicon/favicon.ico" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/assets/vendor/fonts/boxicons.css" />
      <link rel="stylesheet" href="/assets/vendor/css/core.css" className="template-customizer-core-css" />
      <link rel="stylesheet" href="/assets/vendor/css/theme-default.css" className="template-customizer-theme-css" />
      <link rel="stylesheet" href="/assets/css/demo.css" />
      <link rel="stylesheet" href="/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css" />
      <link rel="stylesheet" href="/assets/vendor/libs/apex-charts/apex-charts.css" />
    
    </Helmet>
  );
};

export default Head;