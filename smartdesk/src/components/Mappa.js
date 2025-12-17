import React, { useState } from 'react';
import Tavolo from './Tavolo';
import PopupPrenotazione from './PopupPrenotazione';
import tavoliData from '../data/tavoli.json';
import './Mappa.css';

function Mappa() {
  const [mostraPopup, setMostraPopup] = useState(false);
  const [tavoloSelezionato, setTavoloSelezionato] = useState(null);

  return (
    <div className="mappa-wrapper">
      <div className="mappa-container">
        {tavoliData.map((tavolo) => (
          <Tavolo 
            key={tavolo.id}
            id={tavolo.id}
            x={tavolo.x} 
            y={tavolo.y} 
            onClick={() => {
              setTavoloSelezionato(tavolo.id);
              setMostraPopup(true);
            }} 
          />
        ))}

        {mostraPopup && (
          <div className="popup-overlay" onClick={() => setMostraPopup(false)}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              {/* stoppropagation serve per evitare l onclick sulla mappa */}
              <PopupPrenotazione 
                tavoloId={tavoloSelezionato}
                onClose={() => setMostraPopup(false)} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mappa;