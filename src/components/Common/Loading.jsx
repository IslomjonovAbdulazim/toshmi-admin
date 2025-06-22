import React from 'react';

const Loading = ({ text = 'Yuklanmoqda...' }) => {
  return (
    <div className="loading">
      {text}
    </div>
  );
};

export default Loading;