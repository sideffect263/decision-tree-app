// src/App.js
import React from 'react';
import UploadAndSelect from './components/UploadAndSelect';

const App = () => {
  return (
    <div>
      <h1>Decision Tree Model Trainer</h1>
      <p>Note: At the moment, only numerical data can be analyzed. If you want to use categorical data, please adjust and normalize accordingly. Updates are soon to come.</p>

      <UploadAndSelect />
    </div>
  );
};

export default App;
