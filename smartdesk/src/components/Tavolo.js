import React from 'react';
import './Tavolo.css';
import scrivania from '../data/scrivania.png';

function Tavolo({ id, x = 100, y = 100, onClick }) {
  return (
    <div
      onClick={onClick}
      className="tavolo"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="button"
      aria-label={`Tavolo ${id}`}
    >
      <img src={scrivania} alt={`Tavolo ${id}`} className="tavolo-img" />
    </div>
  );
}

export default Tavolo;