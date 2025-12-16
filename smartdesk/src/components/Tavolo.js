import React, { useState } from "react";
import { inviaPrenotazione } from '../utils/apiService';

function Tavolo() {
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [oraInizio, setOraInizio] = useState('');
  const [oraFine, setOraFine] = useState('');
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    const datiPrenotazione = {
      nome,
      oraInizio: convertiInUnix(data, oraInizio),
      oraFine: convertiInUnix(data, oraFine)
    };

    const risultato = await inviaPrenotazione(datiPrenotazione);

    setLoading(false);

    if (risultato.success) {
      alert(`Prenotazione confermata!\nNome: ${nome}\nData: ${data}\nDalle: ${oraInizio}\nAlle: ${oraFine}`);
      // Resetta il form
      setNome('');
      setData('');
      setOraInizio('');
      setOraFine('');
    } else {
      alert(`Errore: ${risultato.error}\nAssicurati che il server sia avviato!`);
    }
  };

  // Funzione per generare gli orari con intervallo di 15 minuti
  const generaOrari = () => {
    const orari = [];
    for (let ora = 8; ora <= 21; ora++) {
      for (let minuti = 0; minuti < 60; minuti += 15) {
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
    <div style={{ padding: '20px', border: '1px solid #007bff', margin: '20px', maxWidth: '400px' }}>
      <h2>Prenotazione Tavolo</h2>
      
      {/* Input Nome */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Nome:</label>
        <input 
          type="text"
          placeholder="Inserisci il nome"
          value={nome} 
          onChange={e => setNome(e.target.value)} 
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Input Data */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Data:</label>
        <input 
          type="date"
          value={data} 
          onChange={e => setData(e.target.value)} 
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {/* Select Ora Inizio */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Orario Inizio:</label>
        <select 
          value={oraInizio} 
          onChange={e => setOraInizio(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        >
          <option value="">-- Seleziona Ora --</option>
          {generaOrari().map((ora) => (
            <option key={ora} value={ora}>{ora}</option>
          ))}
        </select>
      </div>

      {/* Select Ora Fine */}
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>Orario Fine:</label>
        <select 
          value={oraFine} 
          onChange={e => setOraFine(e.target.value)}
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
        >
          <option value="">-- Seleziona Ora --</option>
          {generaOrari().map((ora) => (
            <option key={ora} value={ora}>{ora}</option>
          ))}
        </select>
      </div>
      
      <hr style={{ margin: '15px 0' }} />

      {/* Riepilogo */}
      <p>
        Prenotazione per: <strong>{nome || '...'}</strong><br/>
        Data: <strong>{data || '...'}</strong><br/>
        Dalle: <strong>{oraInizio || '...'}</strong><br/>
        Alle: <strong>{oraFine || '...'}</strong>
      </p>

      {/* Bottone Conferma */}
      <button 
        onClick={handleConferma}
        disabled={loading}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: loading ? '#6c757d' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          fontSize: '16px'
        }}
      >
        {loading ? 'Invio in corso...' : 'Conferma Prenotazione'}
      </button>
    </div>
  );
}

export default Tavolo;