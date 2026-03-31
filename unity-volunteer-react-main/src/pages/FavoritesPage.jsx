import { Link } from 'react-router-dom';

// ↓ Видалено: import allInitiatives from '../data/initiatives'
// allInitiatives тепер приходить як проп з App.jsx (дані з Firestore)

function FavoritesPage({ allInitiatives = [], favoriteIds, joinedIds, volunteersCount, onToggleFav }) {
  const favs = allInitiatives.filter((i) => favoriteIds.includes(i.id));

  const getDisplayCount = (item) => {
    return volunteersCount[item.id] !== undefined
      ? volunteersCount[item.id]
      : item.volunteers;
  };

  return (
    <main>
      <section className="my-initiatives-section">
        <div className="my-initiatives-header">
          <h2>Улюблені ініціативи</h2>
          <p>Тут відображаються заходи, які ви додали до улюблених. Ви можете переглянути деталі або скасувати улюбленість.</p>
          <span className="thanks-text">Дякуємо за допомогу! ❤️</span>
        </div>

        <div className="initiatives-grid" id="myList">
          {favs.length === 0 ? (
            <div className="empty-state">
              <p>
                Ви ще не додали жодної ініціативи до улюблених.<br />
                Натисніть 🤍 на картці, щоб додати.
              </p>
            </div>
          ) : (
            favs.map((item) => (
              <article key={item.id} className="card">
                <div className="card-content">
                  <div className="card-title-row">
                    <h3>{item.title}</h3>
                    <button
                      className="heart-btn favorited"
                      title="Видалити з улюблених"
                      onClick={() => onToggleFav(item.id)}
                    >
                      ❤️
                    </button>
                  </div>
                  <p>📅 Дата: {item.date}</p>
                  <p>👥 Залишилось місць: {getDisplayCount(item)}</p>
                  <p className="card-description">{item.description}</p>
                  {joinedIds.includes(item.id) && (
                    <span className="joined-badge">✅ Ви учасник</span>
                  )}
                </div>
                <button className="cancel-btn" onClick={() => onToggleFav(item.id)}>
                  Видалити з улюблених
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

export default FavoritesPage;