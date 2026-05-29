import React from 'react';
import './Tavolo.css';
import scrivania from '../data/scrivania.png';
import scrivaniaOccupata from '../data/scrivania_occupata.png';

function Tavolo({ id, x = 100, y = 100, onClick, occupied = false }) {
  const src = occupied ? scrivaniaOccupata : scrivania;

  return (
    <div
      onClick={onClick}
      className="tavolo"
      style={{ left: `${x}px`, top: `${y}px` }}
      role="button"
      aria-label={`Tavolo ${id} ${occupied ? 'occupato' : 'libero'}`}
    >
      <img src={src} alt={`Tavolo ${id}`} className="tavolo-img" />
    </div>
  );
}

export default Tavolo;