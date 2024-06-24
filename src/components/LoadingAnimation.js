import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = () => {
  return (
    <div class="loading-container">
  <div class="water-fill"></div>
  <div class="water-surface"></div>
  <div class="loading-bar">
    <div class="loading-fill"></div>
  </div>
  <div class="loading-text">Analyzing your data...</div>
</div>
  );
};

export default LoadingAnimation;
