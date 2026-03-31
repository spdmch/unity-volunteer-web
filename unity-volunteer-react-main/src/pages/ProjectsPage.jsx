import { useState } from 'react';
import InitiativeCard from '../components/InitiativeCard';

const TYPE_OPTIONS = [
  { value: 'всі',                 label: '🏷 Усі типи' },
  { value: 'екологія',            label: '🌿 Екологія' },
  { value: 'допомога тваринам',   label: '🐾 Тварини' },
  { value: 'соціальна підтримка', label: '🤝 Соціальна' },
];

const PLACE_OPTIONS = [
  { value: 'всі',    label: '📍 Усі міста' },
  { value: 'Київ',   label: 'Київ' },
  { value: 'Львів',  label: 'Львів' },
  { value: 'Харків', label: 'Харків' },
  { value: 'Одеса',  label: 'Одеса' },
];

const DATE_OPTIONS = [
  { value: 'всі',      label: '📅 Усі дати' },
  { value: 'березень', label: 'Березень 2026' },
  { value: 'квітень',  label: 'Квітень 2026' },
  { value: 'травень',  label: 'Травень 2026' },
];

function FilterPills({ options, value, onChange }) {
  return (
    <div className="filter-pills">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`filter-pill${opt.value === value ? ' filter-pill--active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function ProjectsPage({ allInitiatives = [], joinedIds, volunteersCount, favoriteIds, onToggleFav }) {
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter,   setTypeFilter]   = useState('всі');
  const [placeFilter,  setPlaceFilter]  = useState('всі');
  const [dateFilter,   setDateFilter]   = useState('всі');

  const getDisplayCount = (item) =>
    volunteersCount[item.id] !== undefined ? volunteersCount[item.id] : item.volunteers;

  const filtered = allInitiatives.filter((item) => {
    const statusOk = item.status === statusFilter;
    const typeOk   = typeFilter  === 'всі' || item.type      === typeFilter;
    const placeOk  = placeFilter === 'всі' || item.place     === placeFilter;
    const dateOk   = dateFilter  === 'всі' || item.dateGroup === dateFilter;
    return statusOk && typeOk && placeOk && dateOk;
  });

  const hasActiveFilter = typeFilter !== 'всі' || placeFilter !== 'всі' || dateFilter !== 'всі';

  const resetFilters = () => {
    setTypeFilter('всі');
    setPlaceFilter('всі');
    setDateFilter('всі');
  };

  const countLabel = (n) => n === 1 ? 'ініціатива' : n < 5 ? 'ініціативи' : 'ініціатив';

  // Лоадер поки дані ще не прийшли з Firestore
  if (allInitiatives.length === 0) {
    return (
      <main>
        <section className="initiatives-header">
          <h2>Доступні ініціативи</h2>
        </section>
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p>Завантаження ініціатив...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <section className="initiatives-header">
        <h2>Доступні ініціативи</h2>

        <div className="status-toggle">
          <button
            type="button"
            className={`status-btn${statusFilter === 'active' ? ' status-btn--active' : ' status-btn--idle'}`}
            onClick={() => setStatusFilter('active')}
          >
            <span className="status-dot status-dot--green" />
            Актуальні
          </button>
          <button
            type="button"
            className={`status-btn${statusFilter === 'completed' ? ' status-btn--active status-btn--done' : ' status-btn--idle'}`}
            onClick={() => setStatusFilter('completed')}
          >
            <span className="status-dot status-dot--grey" />
            Завершені
          </button>
        </div>

        <div className="advanced-filters">
          <FilterPills options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
          <FilterPills options={PLACE_OPTIONS} value={placeFilter} onChange={setPlaceFilter} />
          <FilterPills options={DATE_OPTIONS} value={dateFilter} onChange={setDateFilter} />
          {hasActiveFilter && (
            <button type="button" className="reset-filter-btn" onClick={resetFilters}>
              ✕ Скинути
            </button>
          )}
        </div>

        <p className="results-count">
          Знайдено: <strong>{filtered.length}</strong> {countLabel(filtered.length)}
        </p>
      </section>

      <div id="projects-container" className="initiatives-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>🔍 Ініціатив за вибраними фільтрами не знайдено.</p>
            <button type="button" className="toggle-btn" onClick={resetFilters}>
              Скинути фільтри
            </button>
          </div>
        ) : (
          filtered.map((item) => (
            <InitiativeCard
              key={item.id}
              item={item}
              isJoined={joinedIds.includes(item.id)}
              isFav={favoriteIds.includes(item.id)}
              displayCount={getDisplayCount(item)}
              onToggleFav={onToggleFav}
              isCompleted={statusFilter === 'completed'}
            />
          ))
        )}
      </div>
    </main>
  );
}

export default ProjectsPage;