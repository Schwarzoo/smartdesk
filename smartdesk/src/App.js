import React, { useState } from 'react';
import Mappa from './components/Mappa';
import InfoPopup from './components/InfoPopup';
import './App.css';

const App = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="App">
      <header className="home-header">
        <p className="home-eyebrow">SmartDesk</p>
        <h1>Prenota un tavolo con un click</h1>
        <div className="home-divider" aria-hidden />
        <p className="home-description">
          Seleziona un tavolo direttamente dalla mappa per vedere disponibilità e prenotazioni.
        </p>
      </header>
      <div className="info-area">
        <button
          type="button"
          className="info-button info-button--text"
          onClick={() => setShowInfo(true)}
          aria-label="Informazioni"
        >
          Prima volta? Scopri di più
        </button>
      </div>
      {showInfo && <InfoPopup onClose={() => setShowInfo(false)} />}
      <Mappa />
    </div>
  )

};

export default App;