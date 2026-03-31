import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

function RegistrationForm({ onJoin, allInitiatives = [] }) {
  const [searchParams] = useSearchParams();
  const initiativeId = searchParams.get('id');
  const initiative = allInitiatives.find((i) => i.id === initiativeId);

  const [form, setForm] = useState({ name: '', surname: '', email: '', phone: '' });
  const [submitted, setSubmitted] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (name === 'phone') {
      const cleaned = value.replace(/\s/g, '');
      if (cleaned && !/^\+?3?8?0\d{9}$/.test(cleaned)) {
        setPhoneError('Введіть номер у форматі +380XXXXXXXXX');
      } else {
        setPhoneError('');
      }
    }
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\s/g, '');
    return /^(\+?380\d{9}|0\d{9})$/.test(cleaned);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = [
      { value: form.name,    name: "Ім'я" },
      { value: form.surname, name: 'Прізвище' },
      { value: form.email,   name: 'Електронна пошта' },
      { value: form.phone,   name: 'Номер телефону' },
    ];

    for (let i = 0; i < fields.length; i++) {
      if (fields[i].value.trim() === '') {
        setErrorMsg(`Будь ласка, заповніть поле: "${fields[i].name}"`);
        setResult('error');
        return;
      }
    }

    if (!validatePhone(form.phone)) {
      setPhoneError('Введіть номер у форматі +380XXXXXXXXX');
      setErrorMsg('Будь ласка, введіть коректний номер телефону');
      setResult('error');
      return;
    }

    if (initiativeId && initiative) onJoin(initiativeId, initiative.title);
    setSubmitted({ ...form });
    setResult('success');
    setForm({ name: '', surname: '', email: '', phone: '' });
    setPhoneError('');
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 40px',
    border: '1px solid #e8e4f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: 'DM Sans, sans-serif',
    backgroundColor: '#faf9fd',
    color: '#1a1a2e',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.25s, box-shadow 0.25s',
  };

  const phoneInputStyle = {
    ...inputStyle,
    borderColor: phoneError ? '#e53e3e' : (form.phone && !phoneError ? '#38a169' : '#e8e4f0'),
    boxShadow: phoneError
      ? '0 0 0 3px rgba(229,62,62,0.1)'
      : (form.phone && !phoneError ? '0 0 0 3px rgba(56,161,105,0.1)' : 'none'),
  };

  const wrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  };

  const iconStyle = {
    position: 'absolute',
    left: '13px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.9rem',
    pointerEvents: 'none',
    zIndex: 1,
    lineHeight: 1,
  };

  return (
    <section className="create-initiative-section">
      <div className="form-header">
        <div className="form-header__icon">🙋</div>
        <h2>Реєстрація волонтера</h2>
        <p>Заповніть форму нижче, щоб стати волонтером події. Ми зв'яжемося з вами для подальших кроків.</p>
      </div>

      {initiative && (
        <div className="initiative-target-badge">
          <span>📋</span>
          <span>Ви реєструєтесь на: <strong>{initiative.title}</strong></span>
        </div>
      )}

      {result !== 'success' && (
        <form className="initiative-form" onSubmit={handleSubmit}>
          <div className="form-row-two">
            <div className="form-group">
              <label htmlFor="name">Ім'я</label>
              <div style={wrapStyle}>
                <span style={iconStyle}>👤</span>
                <input style={inputStyle} type="text" id="name" name="name" placeholder="Ваше ім'я" value={form.name} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="surname">Прізвище</label>
              <div style={wrapStyle}>
                <span style={iconStyle}>👤</span>
                <input style={inputStyle} type="text" id="surname" name="surname" placeholder="Ваше прізвище" value={form.surname} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Електронна пошта</label>
            <div style={wrapStyle}>
              <span style={iconStyle}>✉️</span>
              <input style={inputStyle} type="email" id="email" name="email" placeholder="your@email.com" value={form.email} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">
              Номер телефону
              {form.phone && !phoneError && (
                <span style={{ color: '#38a169', marginLeft: '8px', fontSize: '0.8rem' }}>✓ Коректний</span>
              )}
            </label>
            <div style={wrapStyle}>
              <span style={iconStyle}>📱</span>
              <input
                style={phoneInputStyle}
                type="tel"
                id="phone"
                name="phone"
                placeholder="+380 XX XXX XX XX"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
            {phoneError && (
              <p style={{ color: '#e53e3e', fontSize: '0.8rem', margin: '4px 0 0 2px' }}>
                ⚠️ {phoneError}
              </p>
            )}
            <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '4px 0 0 2px' }}>
              Формат: +380XXXXXXXXX або 0XXXXXXXXX
            </p>
          </div>

          {result === 'error' && <div className="form-error">⚠️ {errorMsg}</div>}

          <button type="submit" className="submit-btn submit-btn--wide">
            Зареєструватися <span className="btn-chevron">→</span>
          </button>
        </form>
      )}

      {result === 'success' && submitted && (
        <div className="form-success">
          <div className="form-success__icon">✅</div>
          <h3>Реєстрацію підтверджено!</h3>
          <div className="form-success__details">
            <div className="success-detail-row"><span>Ім'я</span><strong>{submitted.name} {submitted.surname}</strong></div>
            <div className="success-detail-row"><span>Email</span><strong>{submitted.email}</strong></div>
            <div className="success-detail-row"><span>Телефон</span><strong>{submitted.phone}</strong></div>
            {initiative && <div className="success-detail-row"><span>Ініціатива</span><strong>{initiative.title}</strong></div>}
          </div>
          <p className="form-success__footer">
            Картка з'явилась у розділі <Link to="/my-projects">Мої ініціативи</Link> 🎉
          </p>
        </div>
      )}
    </section>
  );
}

export default RegistrationForm;