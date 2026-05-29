import React from 'react';
import './Mappa.css';

function InfoPopup({ onClose }) {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-inner">
          <button
            onClick={onClose}
            className="popup-close"
            aria-label="Chiudi informazioni"
          >
            ✕
          </button>

          <h2 className="popup-title">Informazioni</h2>
          <p className="popup-text">
            Questa mappa mostra la disposizione dei tavoli. Clicca su un tavolo per aprire il pannello di prenotazione.
          </p>

          <h3 className="popup-subtitle">Legenda</h3>
          <ul className="popup-list">
            <li>Tavolo con immagine colorata: libero</li>
            <li>Tavolo con immagine rossa: occupato nell'orario corrente</li>
          </ul>

          <p className="popup-note">
            Le prenotazioni vengono aggiornate automaticamente ogni minuto. Per forzare l'aggiornamento, chiudi e riapri la pagina.
          </p>
          <h3 className="popup-subtitle">Come funziona:</h3>
          <p className="popup-text">
            Per prenotare un tavolo, clicca su di esso nella mappa. Verrà aperto un pannello con le informazioni sulla disponibilità e la possibilità di effettuare una prenotazione.
            I tavoli in biblioteca sono disposti di un dispositivo che include un led, uno schermo e un sensore di presenza. Quando un tavolo è occupato, il led si accende di rosso e lo schermo mostra il nome della prenotazione. Se un tavolo è libero, il led è verde e lo schermo mostrerà la scritta "Tavolo libero".
          </p>
          <h3 className="popup-subtitle">Tavolo Prenotato:</h3>
          <p className="popup-text"> 
            Dopo aver eseguito una prenotazione, una volta raggiunto il vostro tavolo, basterà sedersi nella postazione. Il sensore individuerà la vostra 
            presenza e manterrà il tavolo occupato per tutta la durata della prenotazione. Durante il periodo di prenotazione i led cambieranno colore seguendo
            lo stile di un orologio, mostrandovi indicativamente in rosso il tempo rimanente e in verde il tempo trascorso dall'inizio della prenotazione.
            Se il sensore non rileva la vostra presenza nei primi 10 minuti dopo l'inizio della prenotazione, il tavolo tornerà libero e il led di colore verde.
          </p>
          <h3 className="popup-subtitle">Prenotazione diretta dalla postazione:</h3>
          <p className="popup-text">
            È possibile prenotare un tavolo direttamente dalla postazione utilizzando il dispositivo presente sul tavolo.
            Per farlo, bisogna essere dotati di una tessera UniTn (Opera), che bisogna avvicinare al lettore presente sul dispositivo (Dove c'è scritto NFC). Una volta avvicinata la tessera, sarà possibile selezionare l'orario di prenotazione e confermare la prenotazione direttamente dal dispositivo.
            Seguire sempre le informazioni mostrate sullo schermo del dispositivo per completare correttamentela prenotazione.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InfoPopup;
