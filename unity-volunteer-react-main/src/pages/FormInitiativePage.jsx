import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          setPosition([lat, lng]);
        },
      }}
    />
  ) : null;
}

function FormInitiativePage() {
  const [form, setForm] = useState({ title: '', date: '', location: '', description: '' });
  const [submitted, setSubmitted] = useState(null);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [markerPos, setMarkerPos] = useState([50.45, 30.52]); 

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleLocationBlur = async () => {
    if (!form.location.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.location)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        setMarkerPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch {}
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = [
      { value: form.title,       name: 'Назва ініціативи' },
      { value: form.date,        name: 'Дата проведення' },
      { value: form.location,    name: 'Місце проведення' },
      { value: form.description, name: 'Опис ініціативи' },
    ];
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].value.trim() === '') {
        setErrorMsg(`Будь ласка, заповніть поле: "${fields[i].name}"`);
        setResult('error');
        return;
      }
    }
    const today = new Date().toISOString().split('T')[0];
if (form.date <= today) {
  setErrorMsg('Подія не може бути зареєстрована на минулу дату');
  setResult('error');
  return;
}
    setSubmitted({ ...form, coords: markerPos });
    setResult('success');
    setForm({ title: '', date: '', location: '', description: '' });
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
    <main>
      <section className="create-initiative-section">
        <div className="form-header">
          <div className="form-header__icon">💡</div>
          <h2>Створити ініціативу</h2>
          <p>Заповніть форму нижче, щоб запропонувати нову волонтерську ініціативу. Ми розглянемо вашу пропозицію та зв'яжемося з вами для подальших кроків.</p>
        </div>

        {result !== 'success' && (
          <form className="initiative-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Назва ініціативи</label>
              <div style={wrapStyle}>
                <span style={iconStyle}>📌</span>
                <input style={inputStyle} type="text" id="title" name="title" placeholder="Назва вашої ініціативи" value={form.title} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="date">Дата проведення</label>
                <div style={wrapStyle}>
                  <span style={iconStyle}>📅</span>
                  <input style={inputStyle} type="date" id="date" name="date" value={form.date} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="location">Місце проведення</label>
                <div style={wrapStyle}>
                  <span style={iconStyle}>📍</span>
                  <input
                    style={inputStyle}
                    type="text" id="location" name="location"
                    placeholder="Введіть місто — карта оновиться"
                    value={form.location}
                    onChange={handleChange}
                    onBlur={handleLocationBlur}
                  />
                </div>
              </div>
            </div>

            {/* КАРТА */}
            <div className="form-group">
              <label>Розташування на карті</label>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 8px' }}>
                Введіть місто вище або клікніть на карту щоб поставити мітку. Мітку можна перетягувати.
              </p>
              <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #e8e4f0', height: '280px' }}>
                <MapContainer
                  center={markerPos}
                  zoom={12}
                  style={{ height: '100%', width: '100%' }}
                  key={markerPos.toString()}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap'
                  />
                  <DraggableMarker position={markerPos} setPosition={setMarkerPos} />
                </MapContainer>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Опис ініціативи</label>
              <textarea
                id="description" name="description" rows="5"
                placeholder="Детально опишіть ідею..."
                value={form.description} onChange={handleChange}
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px 16px', border: '1px solid #e8e4f0', borderRadius: '10px', fontSize: '0.95rem', fontFamily: 'DM Sans, sans-serif', backgroundColor: '#faf9fd', color: '#1a1a2e', resize: 'vertical' }}
              />
            </div>

            {result === 'error' && <div className="form-error">⚠️ {errorMsg}</div>}

            <button type="submit" className="submit-btn submit-btn--wide">
              Надіслати ініціативу <span className="btn-chevron">→</span>
            </button>
          </form>
        )}

        {result === 'success' && submitted && (
          <div className="form-success">
            <div className="form-success__icon">✅</div>
            <h3>Ініціативу надіслано!</h3>
            <div className="form-success__details">
              <div className="success-detail-row"><span>Назва</span><strong>{submitted.title}</strong></div>
              <div className="success-detail-row"><span>Дата</span><strong>{submitted.date}</strong></div>
              <div className="success-detail-row"><span>Місце</span><strong>{submitted.location}</strong></div>
              <div className="success-detail-row"><span>Опис</span><strong>{submitted.description}</strong></div>
            </div>
            {submitted.coords && (
              <div style={{ borderRadius: '10px', overflow: 'hidden', marginTop: '16px', height: '200px' }}>
                <MapContainer center={submitted.coords} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false} scrollWheelZoom={false}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={submitted.coords} />
                </MapContainer>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
const handleLocationBlur = async () => {
    if (!form.location.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.location)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        setMarkerPos([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
        setForm((prev) => ({ ...prev, location: data[0].display_name.split(',').slice(0, 3).join(', ') }));
      }
    } catch {}
  };

export default FormInitiativePage;