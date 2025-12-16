const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const JSON_FILE = path.join(__dirname, 'tavoli.json');

// Configurazione CORS per permettere richieste da Vercel e localhost
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    /\.vercel\.app$/,  // Permette tutti i domini Vercel
    /\.vercel\.dev$/
  ],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// GET - Ottieni tutti i tavoli con le prenotazioni
app.get('/api/tavoli', async (req, res) => {
  try {
    const data = await fs.readFile(JSON_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Errore lettura dati' });
  }
});

// POST - Aggiungi una prenotazione
app.post('/api/prenotazioni', async (req, res) => {
  try {
    const { nome, oraInizio, oraFine } = req.body;
    
    if (!nome || !oraInizio || !oraFine) {
      return res.status(400).json({ error: 'Dati mancanti' });
    }

    // Leggi il file corrente
    const data = await fs.readFile(JSON_FILE, 'utf8');
    const tavoli = JSON.parse(data);

    // Aggiungi la prenotazione
    const nuovaPrenotazione = {
      id: Date.now(),
      nome,
      oraInizio,
      oraFine
    };

    tavoli.reservations.push(nuovaPrenotazione);

    // Salva il file
    await fs.writeFile(JSON_FILE, JSON.stringify(tavoli, null, 2));

    res.status(201).json(nuovaPrenotazione);
  } catch (error) {
    res.status(500).json({ error: 'Errore salvataggio prenotazione' });
  }
});

// DELETE - Elimina una prenotazione
app.delete('/api/prenotazioni/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const data = await fs.readFile(JSON_FILE, 'utf8');
    const tavoli = JSON.parse(data);

    const index = tavoli.reservations.findIndex(r => r.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Prenotazione non trovata' });
    }

    tavoli.reservations.splice(index, 1);
    await fs.writeFile(JSON_FILE, JSON.stringify(tavoli, null, 2));

    res.json({ message: 'Prenotazione eliminata' });
  } catch (error) {
    res.status(500).json({ error: 'Errore eliminazione prenotazione' });
  }
});

// Endpoint di health check per fly.io
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
