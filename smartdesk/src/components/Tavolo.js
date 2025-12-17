import React from 'react';
import './Tavolo.css';

function Tavolo({ id, x = 100, y = 100, onClick }) {
  return (
    <div 
      onClick={onClick}
      className="tavolo"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}>
    </div>
  );
}

export default Tavolo;