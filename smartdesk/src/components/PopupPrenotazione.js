import React, { useEffect, useMemo, useState } from 'react';
import { inviaPrenotazione, ottieniPrenotazioni, eliminaPrenotazione } from '../utils/apiService';
import './PopupPrenotazione.css';

const START_HOUR = 8;
const END_HOUR = 22;
const SLOT_MINUTES = 15;
const DAYS_VISIBLE = 2;
const SLOT_COUNT = ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

const pad = (value) => value.toString().padStart(2, '0');

const toDateKey = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const fromDateKey = (dateKey) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const formatDayLabel = (date) =>
  new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);

const formatHourLabel = (date) =>
  new Intl.DateTimeFormat('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

const getDayStart = (day) => {
  const result = new Date(day);
  result.setHours(START_HOUR, 0, 0, 0);
  return result;
};

const getSlotStart = (day, slotIndex) => {
  const result = getDayStart(day);
  result.setMinutes(result.getMinutes() + slotIndex * SLOT_MINUTES);
  return result;
};

const getSlotEnd = (day, slotIndex) => {
  const result = getSlotStart(day, slotIndex);
  result.setMinutes(result.getMinutes() + SLOT_MINUTES);
  return result;
};

const isSameDay = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const isBeforeDay = (first, second) => toDateKey(first) < toDateKey(second);

const overlaps = (firstStart, firstEnd, secondStart, secondEnd) =>
  firstStart < secondEnd && secondStart < firstEnd;

function PopupPrenotazione({ tavoloId, onClose }) {
  const [nome, setNome] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingEliminaTutte, setLoadingEliminaTutte] = useState(false);

  const today = useMemo(() => {
    const result = new Date();
    result.setHours(0, 0, 0, 0);
    return result;
  }, []);

  const weekStart = useMemo(() => {
    const result = new Date(today);
    result.setHours(0, 0, 0, 0);
    return result;
  }, [today]);

  const weekDays = useMemo(
    () => Array.from({ length: DAYS_VISIBLE }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const slots = useMemo(() => Array.from({ length: SLOT_COUNT }, (_, index) => index), []);

  useEffect(() => {
    let cancelled = false;

    const loadReservations = async () => {
      setLoadingReservations(true);
      const result = await ottieniPrenotazioni();

      if (cancelled) {
        return;
      }

      if (result.success) {
        const table = result.data.find((item) => item.id === tavoloId);
        setReservations(table?.reservations || []);
      } else {
        setReservations([]);
      }

      setLoadingReservations(false);
    };

    loadReservations();
    setSelection(null);

    return () => {
      cancelled = true;
    };
  }, [tavoloId]);

  const reservationsByDay = useMemo(() => {
    const grouped = new Map();

    reservations.forEach((reservation) => {
      const start = new Date(Number(reservation.oraInizio) * 1000);
      const end = new Date(Number(reservation.oraFine) * 1000);
      const key = toDateKey(start);

      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      grouped.get(key).push({
        ...reservation,
        start,
        end,
      });
    });

    grouped.forEach((dayReservations) => {
      dayReservations.sort((first, second) => first.start - second.start);
    });

    return grouped;
  }, [reservations]);

  const selectionStartIndex = selection ? Math.min(selection.startIndex, selection.endIndex) : null;
  const selectionEndIndex = selection ? Math.max(selection.startIndex, selection.endIndex) : null;

  const selectionRange = useMemo(() => {
    if (!selection || selectionStartIndex === null || selectionEndIndex === null) {
      return null;
    }

    const day = fromDateKey(selection.dateKey);
    const start = getSlotStart(day, selectionStartIndex);
    const end = getSlotEnd(day, selectionEndIndex);

    return { start, end };
  }, [selection, selectionStartIndex, selectionEndIndex]);

  const weekTitle = `${formatDayLabel(weekDays[0])} - ${formatDayLabel(weekDays[weekDays.length - 1])}`;

  const formatRangeLabel = (start, end) =>
    `${formatDayLabel(start)} · ${formatHourLabel(start)} - ${formatHourLabel(end)}`;

  const getCellStatus = (day, slotIndex) => {
    const cellStart = getSlotStart(day, slotIndex);
    const cellEnd = getSlotEnd(day, slotIndex);
    const dayKey = toDateKey(day);
    const dayReservations = reservationsByDay.get(dayKey) || [];

    const reservation = dayReservations.find((item) =>
      overlaps(cellStart, cellEnd, item.start, item.end)
    );

    if (reservation) {
      const dayStart = getDayStart(day);
      const reservationStartIndex = Math.max(
        0,
        Math.floor((reservation.start - dayStart) / (SLOT_MINUTES * 60 * 1000))
      );
      const reservationEndIndex = Math.min(
        SLOT_COUNT - 1,
        Math.ceil((reservation.end - dayStart) / (SLOT_MINUTES * 60 * 1000)) - 1
      );

      return {
        type: 'reserved',
        reservation,
        isStart: slotIndex === reservationStartIndex,
        isEnd: slotIndex === reservationEndIndex,
        startIndex: reservationStartIndex,
        endIndex: reservationEndIndex,
        span: reservationEndIndex - reservationStartIndex + 1,
      };
    }

    if (selection && selection.dateKey === dayKey) {
      const startIndex = selectionStartIndex;
      const endIndex = selectionEndIndex;

      if (slotIndex >= startIndex && slotIndex <= endIndex) {
        return {
          type: 'selected',
          isStart: slotIndex === startIndex,
          isEnd: slotIndex === endIndex,
          startIndex,
          endIndex,
          span: endIndex - startIndex + 1,
        };
      }
    }

    if (isBeforeDay(day, today)) {
      return { type: 'past' };
    }

    if (isSameDay(day, today) && cellEnd <= new Date()) {
      return { type: 'past' };
    }

    return { type: 'free' };
  };

  const handleSlotClick = (day, slotIndex) => {
    const status = getCellStatus(day, slotIndex);

    if (status.type !== 'free') {
      return;
    }

    const dayKey = toDateKey(day);

    if (!selection || selection.dateKey !== dayKey) {
      setSelection({ dateKey: dayKey, startIndex: slotIndex, endIndex: slotIndex });
      return;
    }

    const currentStart = selectionStartIndex;
    const currentEnd = selectionEndIndex;

    if (slotIndex >= currentStart && slotIndex <= currentEnd) {
      return;
    }

    if (slotIndex === currentStart - 1) {
      setSelection({ dateKey: dayKey, startIndex: slotIndex, endIndex: currentEnd });
      return;
    }

    if (slotIndex === currentEnd + 1) {
      setSelection({ dateKey: dayKey, startIndex: currentStart, endIndex: slotIndex });
      return;
    }

    setSelection(null);
  };

  const convertSelectionToUnix = () => {
    if (!selectionRange) {
      return null;
    }

    return {
      oraInizio: Math.floor(selectionRange.start.getTime() / 1000),
      oraFine: Math.floor(selectionRange.end.getTime() / 1000),
    };
  };

  const handleConferma = async () => {
    if (!nome.trim()) {
      alert('Compila il nome.');
      return;
    }

    if (!selectionRange) {
      alert('Seleziona uno slot libero nel calendario.');
      return;
    }

    const rangeUnix = convertSelectionToUnix();
    if (!rangeUnix) {
      alert('Seleziona un intervallo valido.');
      return;
    }

    const adesso = Math.floor(Date.now() / 1000);
    if (rangeUnix.oraInizio < adesso) {
      alert('Non puoi effettuare una prenotazione in un periodo precedente a quello attuale.');
      return;
    }

    if (rangeUnix.oraInizio >= rangeUnix.oraFine) {
      alert('L\'intervallo selezionato non è valido.');
      return;
    }

    setLoading(true);

    const result = await inviaPrenotazione({
      id: tavoloId,
      nome: nome.trim(),
      oraInizio: rangeUnix.oraInizio,
      oraFine: rangeUnix.oraFine,
    });

    setLoading(false);

    if (result.success) {
      alert(`Prenotazione confermata!\nNome: ${nome.trim()}\n${formatRangeLabel(selectionRange.start, selectionRange.end)}`);
      onClose();
      return;
    }

    if (result.error === 'Orario non disponibile') {
      alert('Orario non disponibile');
      return;
    }

    alert(`Errore: ${result.error}`);
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

    setReservations([]);
    alert('Tutte le prenotazioni sono state eliminate.');
  };

  const clearSelection = () => {
    setSelection(null);
  };

  const selectionSummary = selectionRange
    ? formatRangeLabel(selectionRange.start, selectionRange.end)
    : 'Seleziona uno slot e poi quelli adiacenti per allungare la prenotazione.';

  return (
    <div className="popup-prenotazione">
      <div className="popup-header">
        <div>
          <p className="popup-eyebrow">Tavolo {tavoloId}</p>
          <h2>Prenotazione per oggi e domani</h2>
          <p className="popup-description">
            Clicca uno slot libero da 15 minuti e poi il punto finale per costruire l'intervallo.
          </p>
        </div>

        <div className="popup-actions">
          <button type="button" className="btn-secondary" disabled>
            Oggi - Domani
          </button>
        </div>
      </div>

      <div className="popup-layout">
        <section className="calendar-panel">
          <div className="calendar-toolbar">
            <div>
              <h3>{weekTitle}</h3>
              <p>{loadingReservations ? 'Caricamento prenotazioni...' : 'La vista include solo oggi e domani. Le celle rosse sono occupate, quelle azzurre sono la prenotazione in selezione.'}</p>
            </div>

            <button type="button" className="btn-ghost" onClick={clearSelection}>
              Svuota selezione
            </button>
          </div>

          <div className="calendar-grid" role="grid" aria-label="Calendario prenotazioni tavolo">
            <div className="calendar-corner">Ora</div>
            {weekDays.map((day, dayIndex) => (
              <div
                key={toDateKey(day)}
                className="day-header"
                style={{ gridRow: 1, gridColumn: dayIndex + 2 }}
              >
                <span>{formatDayLabel(day)}</span>
              </div>
            ))}

            {slots.map((slotIndex) => {
              const slotLabelDate = getSlotStart(weekDays[0], slotIndex);
              const timeLabel = slotIndex % 4 === 0 ? formatHourLabel(slotLabelDate) : '';
              const rowNumber = slotIndex + 2;

              return (
                <React.Fragment key={slotIndex}>
                  <div className="time-label" style={{ gridRow: rowNumber, gridColumn: 1 }}>
                    {timeLabel}
                  </div>

                  {weekDays.map((day, dayIndex) => {
                    const status = getCellStatus(day, slotIndex);
                    const dayKey = toDateKey(day);
                    const columnNumber = dayIndex + 2;
                    const cellStyle = status.type === 'reserved'
                      ? {
                          gridRow: `${status.startIndex + 2} / span ${status.span}`,
                          gridColumn: columnNumber,
                        }
                      : status.type === 'selected'
                        ? {
                            gridRow: `${status.startIndex + 2} / span ${status.span}`,
                            gridColumn: columnNumber,
                          }
                      : {
                          gridRow: rowNumber,
                          gridColumn: columnNumber,
                        };

                    if ((status.type === 'reserved' || status.type === 'selected') && !status.isStart) {
                      return null;
                    }

                    const className = [
                      'calendar-slot',
                      status.type,
                      status.type === 'reserved' ? 'reservation-block' : '',
                      status.type === 'selected' ? 'selection-block' : '',
                      status.type === 'reserved' && status.span === 1 ? 'single-slot' : '',
                      status.type === 'selected' && status.span === 1 ? 'single-slot' : '',
                      status.isStart ? 'is-start' : '',
                      status.isEnd ? 'is-end' : '',
                    ].filter(Boolean).join(' ');

                    const reservationLabel = status.type === 'reserved' && status.isStart
                      ? `${formatHourLabel(status.reservation.start)}-${formatHourLabel(status.reservation.end)}`
                      : '';

                    const cellContent = status.type === 'reserved' && status.isStart
                      ? `Occupato · ${reservationLabel}`
                      : status.type === 'selected' && status.isStart
                        ? 'Prenotazione'
                          : '';

                    if (status.type === 'free') {
                      return (
                        <button
                          type="button"
                          key={dayKey}
                          className={className}
                          style={cellStyle}
                          onClick={() => handleSlotClick(day, slotIndex)}
                          title={`${formatDayLabel(day)} ${formatHourLabel(getSlotStart(day, slotIndex))}`}
                        >
                          {cellContent}
                        </button>
                      );
                    }

                    return (
                      <div
                        key={dayKey}
                        className={className}
                        style={cellStyle}
                        title={reservationLabel}
                      >
                        {cellContent}
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>

          <p className="legend">
            <span><i className="legend-dot reserved" />Occupato</span>
            <span><i className="legend-dot free" />Libero</span>
            <span><i className="legend-dot selected" />Selezionato</span>
          </p>

          <p className="calendar-help">
            La vista mostra solo oggi e domani, con celle da 15 minuti. La prenotazione viene salvata solo se l'intervallo resta completamente libero.
          </p>
        </section>

        <aside className="booking-panel">
          <div className="form-group">
            <label className="form-label">Nome prenotazione</label>
            <input
              type="text"
              placeholder="Inserisci il nome"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              className="form-input"
            />
          </div>

          <div className="summary-card">
            <p className="summary-label">Intervallo selezionato</p>
            <strong>{selectionSummary}</strong>
          </div>

          <button
            onClick={handleConferma}
            disabled={loading || !selectionRange}
            className="btn-conferma"
          >
            {loading ? 'Invio in corso...' : 'Conferma prenotazione'}
          </button>

          <button
            onClick={handleEliminaTuttePrenotazioni}
            disabled={loadingEliminaTutte}
            className="btn-elimina-tutte"
          >
            {loadingEliminaTutte ? 'Eliminazione in corso...' : 'Elimina prenotazioni'}
          </button>

          <button type="button" onClick={onClose} className="btn-secondary btn-close">
            Chiudi popup
          </button>
        </aside>
      </div>
    </div>
  );
}

export default PopupPrenotazione;
