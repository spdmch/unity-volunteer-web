import { Link } from 'react-router-dom';

function MyProjectsPage({ allInitiatives = [], joinedIds, volunteersCount, onLeave }) {
  const joined = allInitiatives.filter((i) => joinedIds.includes(i.id));

  const getDisplayCount = (item) => {
    return volunteersCount[item.id] !== undefined
      ? volunteersCount[item.id]
      : item.volunteers;
  };

  return (
    <main>
      <section className="my-initiatives-section">
        <div className="my-initiatives-header">
          <h2>Мої ініціативи</h2>
          <p>Тут відображаються заходи, до яких ви приєдналися. Ви можете переглянути деталі або скасувати участь.</p>
          <span className="thanks-text">Дякуємо за допомогу! ❤️</span>
        </div>

        <div className="initiatives-grid" id="myList">
          {joined.length === 0 ? (
            <div className="empty-state">
              <p>Ви ще не приєдналися до жодної ініціативи.</p>
            </div>
          ) : (
            joined.map((item) => (
              <article key={item.id} className="card">
                <div className="card-content">
                  <h3>{item.title}</h3>
                  <p>📅 Дата: {item.date}</p>
                  <p>👥 Залишилось місць: {getDisplayCount(item)}</p>
                  <span className="joined-badge">✅ Ви учасник</span>
                </div>
                <button className="cancel-btn" onClick={() => onLeave(item.id)}>
                  Скасувати участь
                </button>
              </article>
            ))
          )}
        </div>

        <div className="empty-state-hint">
          <p>
            Хочете допомогти ще? Перегляньте{' '}
            <Link to="/projects">доступні ініціативи</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}

export default MyProjectsPage;