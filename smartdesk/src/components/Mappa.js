import React, { useState, useEffect } from 'react';
import Tavolo from './Tavolo';
import PopupPrenotazione from './PopupPrenotazione';
import tavoliData from '../data/tavoli.json';
import './Mappa.css';
import { ottieniPrenotazioni } from '../utils/apiService';

const TABLE_WIDTH = 140;
const TABLE_HEIGHT = 72;

const getTableBounds = (tables) => {
  const xs = tables.map((table) => table.x);
  const ys = tables.map((table) => table.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
};

function Mappa({ onShowInfo }) {
  const [mostraPopup, setMostraPopup] = useState(false);
  const [tavoloSelezionato, setTavoloSelezionato] = useState(null);
  const [occupazioni, setOccupazioni] = useState(new Map());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const res = await ottieniPrenotazioni();
      if (cancelled) return;
      if (!res.success) return;

      const map = new Map();
      // res.data is array of tavoli with reservations
      res.data.forEach((t) => {
        map.set(t.id, t.reservations || []);
      });
      setOccupazioni(map);
    };

    load();
    const id = setInterval(load, 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);
  const bounds = getTableBounds(tavoliData);
  const stageWidth = bounds.maxX - bounds.minX + TABLE_WIDTH;
  const stageHeight = bounds.maxY - bounds.minY + TABLE_HEIGHT;

  return (
    <div className="mappa-wrapper">
      <div className="mappa-container">
        <div
          className="mappa-stage"
          style={{
            width: `${stageWidth}px`,
            height: `${stageHeight}px`,
          }}
        >
          {tavoliData.map((tavolo) => {
            const now = Math.floor(Date.now() / 1000);
            const tableReservations = occupazioni.get(tavolo.id) || [];
            const isOccupied = tableReservations.some((r) => {
              const start = Number(r.oraInizio);
              const end = Number(r.oraFine);
              return Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end;
            });

            return (
              <Tavolo 
                key={tavolo.id}
                id={tavolo.id}
                x={tavolo.x - bounds.minX + TABLE_WIDTH / 2} 
                y={tavolo.y - bounds.minY + TABLE_HEIGHT / 2} 
                occupied={isOccupied}
                onClick={() => {
                  setTavoloSelezionato(tavolo.id);
                  setMostraPopup(true);
                }} 
              />
            );
          })}
        </div>

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