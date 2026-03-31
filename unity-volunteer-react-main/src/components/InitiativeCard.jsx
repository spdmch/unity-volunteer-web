import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

const TYPE_ICONS = {
  'екологія':           '🌿',
  'допомога тваринам':  '🐾',
  'соціальна підтримка':'🤝',
};

function InitiativeCard({ item, isJoined, isFav, displayCount, onToggleFav, isCompleted }) {
  const navigate = useNavigate();

  let actionButton;
  if (isCompleted) {
    actionButton = (
      <button className="join-btn" disabled style={{ background: '#b0a898', cursor: 'default' }}>
        Завершено
      </button>
    );
  } else if (isJoined) {
    actionButton = (
      <button className="join-btn" disabled style={{ background: '#5a7a5c', cursor: 'default' }}>
        ✓ Ви учасник
      </button>
    );
  } else {
    actionButton = (
      <button
        className="join-btn"
        onClick={() => navigate(`/form-registr?id=${item.id}`)}
      >
        Приєднатися →
      </button>
    );
  }

  return (
    <article className="card" data-type={item.type}>
      <div className="card-content">
        <div className="card-title-row">
          <h3>{item.title}</h3>
          {!isCompleted && (
            <button
              className={'heart-btn' + (isFav ? ' favorited' : '')}
              title={isFav ? 'Видалити з улюблених' : 'Додати до улюблених'}
              onClick={() => onToggleFav(item.id)}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          )}
        </div>

        <div className="card-meta">
          {item.place && <span className="card-place">📍 {item.place}</span>}
          {item.type  && (
            <span className="card-type">
              {TYPE_ICONS[item.type] || ''} {item.type}
            </span>
          )}
        </div>

        <p>📅 {item.date}</p>
        <p>👥 Потрібно: <strong>{displayCount}</strong> волонтерів</p>
        <p className="card-description">{item.description}</p>

        {!isCompleted && <StarRating initiativeId={item.id} />}
      </div>

      <div className="card-footer">
        {actionButton}
      </div>
    </article>
  );
}

export default InitiativeCard;