import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { Link } from 'react-router-dom';

function StarRating({ initiativeId }) {
  const { currentUser, token } = useAuth();

  const [avgRating,    setAvgRating]    = useState('0.00');
  const [totalRatings, setTotalRatings] = useState(0);
  const [userRating,   setUserRating]   = useState(0); 
  const [hovered,      setHovered]      = useState(0);
  const [loading,      setLoading]      = useState(false);

  const fetchRatings = async () => {
    try {
      let url = `/api/initiatives/${initiativeId}/ratings`;
      if (currentUser?.uid) {
          url += `?userId=${currentUser.uid}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setAvgRating(data.averageRating);
        setTotalRatings(data.totalVotes);
        if (data.userRating !== undefined) {
            setUserRating(Number(data.userRating));
        }
      }
    } catch (error) {
      console.error('Помилка завантаження рейтингу:', error);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [initiativeId, currentUser]);

  async function handleRate(star) {
    if (!currentUser || !token || loading) return;
    
    setLoading(true);
    const previousUserRating = userRating;
    setUserRating(star); 

    try {
      // ЗМІНЕНО: відносний шлях
      const response = await fetch(`/api/initiatives/${initiativeId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: star }),
      });

      if (response.ok) {
        await fetchRatings(); 
      } else {
        setUserRating(previousUserRating);
      }
    } catch (err) {
      setUserRating(previousUserRating);
    } finally {
      setLoading(false);
    }
  }

  const displayStars = hovered || userRating;

  return (
    <div className="star-rating">
      {totalRatings > 0 ? (
        <p className="star-avg">★ {avgRating} <span>({totalRatings} оцінок)</span></p>
      ) : (
        <p className="star-avg">Ще немає оцінок</p>
      )}

      {currentUser ? (
        <div className="star-input">
          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star${star <= displayStars ? ' star--on' : ''}`}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                disabled={loading}
              >
                ★
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="star-hint"><Link to="/login">Увійдіть</Link>, щоб оцінити</p>
      )}
    </div>
  );
}

export default StarRating;