// URL base del server
const BASE_URL = process.env.REACT_APP_API_URL || 'https://server-restless-star-9200.fly.dev';

// Funzione per inviare una prenotazione al server
export const inviaPrenotazione = async (datiPrenotazione) => {
  try {
    const response = await fetch(`${BASE_URL}/api/prenotazioni`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(datiPrenotazione),
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Errore durante l\'invio della prenotazione:', error);
    return { success: false, error: error.message };
  }
};

// Funzione per recuperare tutte le prenotazioni dal server
export const ottieniPrenotazioni = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/tavoli`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Errore durante il recupero delle prenotazioni:', error);
    return { success: false, error: error.message };
  }
};

// Funzione per eliminare una prenotazione
export const eliminaPrenotazione = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/api/prenotazioni/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Errore durante l\'eliminazione della prenotazione:', error);
    return { success: false, error: error.message };
  }
};
