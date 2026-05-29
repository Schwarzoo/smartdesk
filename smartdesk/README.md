**SmartDesk — Sistema di prenotazione tavoli**

**Corso:** Embedded Software for the Internet of Things - UniTn

**Autore:** <br>
Andrea Schwarz <andreaschwarz.a.d@gmail.com> <br>
Leonardo Serafin <leonaardo.serafin04@gmail.com>

**Anno :** 2026

Breve descrizione
------------------

SmartDesk è il lato web di un progetto per la gestione e la prenotazione di postazioni/tavoli in un ambiente condiviso (biblioteca, laboratorio, aula studio). Il progetto include un front-end React (`smartdesk/`) e un semplice servizio back-end (`server/`) per simulare le API di prenotazione.

Obiettivi del progetto
----------------------
- Realizzare un'interfaccia intuitiva per visualizzare una mappa dei tavoli e prenotare intervalli di tempo.
- Gestire le prenotazioni con controlli di sovrapposizione e cancellazione.
- Fornire UX responsive per desktop e dispositivi mobili.

Caratteristiche principali
-------------------------
- Mappa interattiva delle postazioni con popup informativi (`InfoPopup`).
- Calendario a celle (slot da 15 minuti) per prenotazioni (`PopupPrenotazione`).
- Visualizzazione e cancellazione delle prenotazioni esistenti.
- Styling moderno e accessibile; layout responsive.

Tecnologie e dipendenze
-----------------------
- Front-end: React (Create React App), CSS modulare.
- Back-end: Node.js (server di sviluppo in `server/`).
- Strumenti: npm, (opzionale) Docker per il deployment del servizio.

Requisiti
---------
- Node.js (>= 14)
- npm (>= 6)

Installazione e avvio in locale
-------------------------------
1. Clona il repository:

```bash
git clone <repo-url>
cd smartdesk
```

2. Avvia il back-end di sviluppo (opzionale, se vuoi usare l'API simulata):

```bash
cd server
npm install
node server.js
# oppure, se esiste uno script: npm start
```

3. Avvia il front-end:

```bash
cd ../smartdesk
npm install
npm start
# apre l'app su http://localhost:3000
```

Build per produzione
---------------------
Genera la build ottimizzata del front-end:

```bash
cd smartdesk
npm run build
```

Il contenuto ottimizzato sarà disponibile in `smartdesk/build/` e può essere servito da un server statico o integrato nel `server/` secondo le esigenze di deployment.

Struttura del progetto (sintesi)
-------------------------------
- `server/` — codice e configurazione del servizio back-end (API fittizie, Dockerfile, fly.toml).
- `smartdesk/` — applicazione React (sorgenti in `src/`, build in `build/`, file statici in `public/`).

File e componenti rilevanti
---------------------------
- `smartdesk/src/components/InfoPopup.js` — popup informativo sulla mappa.
- `smartdesk/src/components/PopupPrenotazione.js` — pannello di prenotazione e calendario.
- `smartdesk/src/utils/apiService.js` — wrapper per chiamate API simulate.

Uso
---
1. Apri l'app in un browser (sviluppo: `http://localhost:3000` online: https://smartdesk-alpha.vercel.app/).
2. Nella mappa clicca su un tavolo per visualizzare il popup informativo.
3. Apri il pannello di prenotazione per selezionare gli slot liberi (15 minuti) e confermare.

Testing
-------
Eseguire i test unitari (se presenti) dal folder `smartdesk`:

```bash
cd smartdesk
npm test
```

Contributi e linee guida
------------------------
Per suggerimenti o pull request:
- Apri un issue descrivendo il problema o la proposta.
- Invia una pull request con una descrizione chiara delle modifiche.

Contatti
--------
Per domande o chiarimenti: <br>
Andrea Schwarz — andreaschwarz.a.d@gmail.com <br>
Leonardo Serafin <leonaardo.serafin04@gmail.com>


