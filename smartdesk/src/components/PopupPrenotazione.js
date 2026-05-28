import React, { useState } from "react";
import { inviaPrenotazione, ottieniPrenotazioni, eliminaPrenotazione } from '../utils/apiService';
import './PopupPrenotazione.css';

function PopupPrenotazione({ tavoloId, onClose }) {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [oraInizio, setOraInizio] = useState('');
  const [oraFine, setOraFine] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEliminaTutte, setLoadingEliminaTutte] = useState(false);

  // Calcola oggi e domani in formato YYYY-MM-DD
  const getDataOggi = () => {
    const oggi = new Date();
    return oggi.toISOString().split('T')[0];
  };

  const getDataDomani = () => {
    const domani = new Date();
    domani.setDate(domani.getDate() + 1);
    return domani.toISOString().split('T')[0];
  };

  // Funzione per convertire data + ora in timestamp Unix
  const convertiInUnix = (data, ora) => {
    const [anno, mese, giorno] = data.split('-');
    const [ore, minuti] = ora.split(':');
    const date = new Date(anno, mese - 1, giorno, ore, minuti);
    return Math.floor(date.getTime() / 1000);
  };

  // Funzione per confermare la prenotazione
  const handleConferma = async () => {
    if (!nome || !data || !oraInizio || !oraFine) {
      alert('Compila tutti i campi!');
      return;
    }

    const timestampInizio = convertiInUnix(data, oraInizio);
    const timestampFine = convertiInUnix(data, oraFine);
    const adesso = Math.floor(Date.now() / 1000);

    if (timestampInizio < adesso) {
      alert('Non puoi effettuare una prenotazione in un periodo precedente a quello attuale.');
      return;
    }

    if (timestampInizio >= timestampFine) {
      alert('L\'orario di fine deve essere successivo all\'orario di inizio.');
      return;
    }

    setLoading(true);

    const datiPrenotazione = {
      id: tavoloId, 
      nome,
      oraInizio: timestampInizio,
      oraFine: timestampFine
    };

    const risultato = await inviaPrenotazione(datiPrenotazione);

    setLoading(false);

    if (risultato.success) {
      alert(`Prenotazione confermata!\nNome: ${nome}\nData: ${data}\nDalle: ${oraInizio}\nAlle: ${oraFine}`);
      onClose();
    } else {
      if (risultato.error === 'Orario non disponibile') {
        alert('Orario non disponibile');
      } else {
        alert(`Errore: ${risultato.error}`);
      }
    }
  };

  const handleEliminaTuttePrenotazioni = async () => {
    const conferma = window.confirm('Vuoi davvero eliminare tutte le prenotazioni?');
    if (!conferma) {
      return;
    }

    setLoadingEliminaTutte(true);

    const risultatoTavoli = await ottieniPrenotazioni();

    if (!risultatoTavoli.success) {
      setLoadingEliminaTutte(false);
      alert(`Errore: ${risultatoTavoli.error}`);
      return;
    }

    const idsPrenotazioni = risultatoTavoli.data
      .flatMap((tavolo) => tavolo.reservations || [])
      .map((prenotazione) => prenotazione.id);

    if (idsPrenotazioni.length === 0) {
      setLoadingEliminaTutte(false);
      alert('Non ci sono prenotazioni da eliminare.');
      return;
    }

    let errori = 0;
    for (const idPrenotazione of idsPrenotazioni) {
      const risultatoEliminazione = await eliminaPrenotazione(idPrenotazione);
      if (!risultatoEliminazione.success) {
        errori += 1;
      }
    }

    setLoadingEliminaTutte(false);

    if (errori > 0) {
      alert(`Eliminazione completata con ${errori} errore/i.`);
      return;
    }

    alert('Tutte le prenotazioni sono state eliminate.');
  };

  // Funzione per generare gli orari con intervallo di 15 minuti
  const generaOrari = () => {
    const orari = [];
    for (let ora = 8; ora <= 21; ora++) {
      for (let minuti = 0; minuti < 60; minuti += 1) {
        // Se siamo all'ora 21, ci fermiamo a 21:45
        if (ora === 21 && minuti > 45) break;
        
        const oraStr = ora.toString().padStart(2, '0');
        const minutiStr = minuti.toString().padStart(2, '0');
        orari.push(`${oraStr}:${minutiStr}`);
      }
    }
    return orari;
  };

  return (
    <div className="popup-prenotazione">
      <h2>Prenotazione Tavolo</h2>
      
      {/* Input Nome */}
      <div className="form-group">
        <label className="form-label">Nome:</label>
        <input 
          type="text"
          placeholder="Inserisci il nome"
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          className="form-input"
        />
      </div>

      {/* Input Data */}
      <div className="form-group">
        <label className="form-label">Data:</label>
        <input 
          type="date"
          value={data} 
          onChange={e => setData(e.target.value)} 
          min={getDataOggi()}
          max={getDataDomani()}
          className="form-input"
        />
      </div>

      {/* Select Ora Inizio */}
      <div className="form-group">
        <label className="form-label">Orario Inizio:</label>
        <select 
          value={oraInizio} 
          onChange={e => setOraInizio(e.target.value)}
          className="form-input"
        >
          <option value="">-- Seleziona Ora --</option>
          {generaOrari().map((ora) => (
            <option key={ora} value={ora}>{ora}</option>
          ))}
        </select>
      </div>

      {/* Select Ora Fine */}
      <div className="form-group">
        <label className="form-label">Orario Fine:</label>
        <select 
          value={oraFine} 
          onChange={e => setOraFine(e.target.value)}
          className="form-input"
        >
          <option value="">-- Seleziona Ora --</option>
          {generaOrari().map((ora) => (
            <option key={ora} value={ora}>{ora}</option>
          ))}
        </select>
      </div>
      
      <hr className="divider" />

      {/* Riepilogo */}
      <p className="riepilogo">
        Prenotazione per: <strong>{nome || '...'}</strong><br/>
        Data: <strong>{data || '...'}</strong><br/>
        Dalle: <strong>{oraInizio || '...'}</strong><br/>
        Alle: <strong>{oraFine || '...'}</strong>
      </p>

      {/* Bottone Conferma */}
      <button 
        onClick={handleConferma}
        disabled={loading}
        className="btn-conferma"
      >
        {loading ? 'Invio in corso...' : 'Conferma Prenotazione'}
      </button>

      <button
        onClick={handleEliminaTuttePrenotazioni}
        disabled={loadingEliminaTutte}
        className="btn-elimina-tutte"
      >
        {loadingEliminaTutte ? 'Eliminazione in corso...' : 'Elimina prenotazioni'}
      </button>
    </div>
  );
}

export default PopupPrenotazione;
