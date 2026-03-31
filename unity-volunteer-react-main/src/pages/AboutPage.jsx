import { useState } from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
  const [showAbout, setShowAbout] = useState(true);

  return (
    <main>
      <section className="articles-section">
        <h2>Останні новини</h2>
        <article className="news-article">
          <span className="date">17.02.2026</span>
          <h3>Як волонтерство змінює життя: історія Олександра</h3>
          <p>
            Наш волонтер поділився досвідом того, як допомога іншим допомогла йому знайти нове покликання в житті...
          </p>
          <Link to="/news" className="read-more">Читати далі</Link>
        </article>
      </section>

      <hr />

      <button
        id="toggle-about-btn"
        className="toggle-btn"
        onClick={() => setShowAbout((v) => !v)}
      >
        {showAbout ? 'Приховати інформацію ▲' : 'Показати інформацію ▼'}
      </button>

      {showAbout && (
        <section id="about">
          <h2>Про нас</h2>
          <p>
            Ми — команда волонтерів, яка прагне допомагати тим, хто цього потребує.
            Наша місія — об'єднати людей для спільної роботи над важливими соціальними проектами.
          </p>
          <h3>Наші цінності</h3>
          <ul className="values-list">
            <li>Співпраця</li>
            <li>Відкритість</li>
            <li>Повага</li>
            <li>Відповідальність</li>
          </ul>
        </section>
      )}
    </main>
  );
}

export default AboutPage;