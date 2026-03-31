import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './Context/AuthContext';
import { db } from './firebase';
import { useInitiatives } from './hooks/useInitiatives';

import Header             from './components/Header';
import Footer             from './components/Footer';
import RegistrationForm   from './components/RegistrationForm';

import AboutPage          from './pages/AboutPage';
import ProjectsPage       from './pages/ProjectsPage';
import MyProjectsPage     from './pages/MyProjectsPage';
import FavoritesPage      from './pages/FavoritesPage';
import FormInitiativePage from './pages/FormInitiativePage';
import NewsPage           from './pages/NewsPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import { doc, setDoc, getDoc } from 'firebase/firestore';

function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem', color: '#6b7280' }}>
        Перевірка доступу...
      </div>
    );
  }
  return currentUser ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { currentUser, loading: authLoading } = useAuth();
  const { initiatives: allInitiatives, loading: initiativesLoading } = useInitiatives();

  const [joinedIds,       setJoinedIds]       = useState([]);
  const [volunteersCount, setVolunteersCount] = useState({});
  const [favoriteIds,     setFavoriteIds]     = useState([]);
  const [dataLoaded,      setDataLoaded]      = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setJoinedIds([]);
      setFavoriteIds([]);
      setVolunteersCount({});
      setDataLoaded(false);
      return;
    }

    async function loadUserData() {
      try {
        const ref  = doc(db, 'users', currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setJoinedIds(data.joinedIds             || []);
          setFavoriteIds(data.favoriteIds         || []);
          setVolunteersCount(data.volunteersCount || {});
        }
        setDataLoaded(true);
      } catch (err) {
        console.warn('loadUserData error:', err.message);
        setDataLoaded(true);
      }
    }
    loadUserData();
  }, [currentUser, authLoading]); 

  useEffect(() => {
    if (!currentUser || !dataLoaded || authLoading) return;
    const ref = doc(db, 'users', currentUser.uid);
    setDoc(ref, { joinedIds, favoriteIds, volunteersCount }, { merge: true })
      .catch((err) => console.warn('setDoc error:', err.message));
  }, [joinedIds, favoriteIds, volunteersCount, currentUser, dataLoaded, authLoading]);

  const handleJoin = (initiativeId) => {
    if (joinedIds.includes(initiativeId)) return;
    setJoinedIds((prev) => [...prev, initiativeId]);
    const initiative = allInitiatives.find((i) => i.id === initiativeId);
    setVolunteersCount((prev) => ({
      ...prev,
      [initiativeId]: Math.max(
        0,
        (prev[initiativeId] !== undefined ? prev[initiativeId] : initiative.volunteers) - 1
      ),
    }));
  };

  const handleLeave = (initiativeId) => {
    setJoinedIds((prev) => prev.filter((id) => id !== initiativeId));
    const initiative = allInitiatives.find((i) => i.id === initiativeId);
    setVolunteersCount((prev) => ({
      ...prev,
      [initiativeId]:
        (prev[initiativeId] !== undefined ? prev[initiativeId] : initiative.volunteers) + 1,
    }));
  };

  const handleToggleFav = (initiativeId) => {
    setFavoriteIds((prev) =>
      prev.includes(initiativeId)
        ? prev.filter((id) => id !== initiativeId)
        : [...prev, initiativeId]
    );
  };

  if (initiativesLoading || authLoading) {
    return (
      <>
        <Header />
        <main style={{ textAlign: 'center', padding: '80px 24px', color: '#6b7280' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⏳</div>
          <p>Завантаження даних...</p>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<AboutPage />} />
        <Route
          path="/projects"
          element={
            <ProjectsPage
              allInitiatives={allInitiatives}
              joinedIds={joinedIds}
              volunteersCount={volunteersCount}
              favoriteIds={favoriteIds}
              onToggleFav={handleToggleFav}
            />
          }
        />
        <Route
          path="/my-projects"
          element={
            <PrivateRoute>
              <MyProjectsPage
                allInitiatives={allInitiatives}
                joinedIds={joinedIds}
                volunteersCount={volunteersCount}
                onLeave={handleLeave}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <FavoritesPage
                allInitiatives={allInitiatives}
                favoriteIds={favoriteIds}
                joinedIds={joinedIds}
                volunteersCount={volunteersCount}
                onToggleFav={handleToggleFav}
              />
            </PrivateRoute>
          }
        />
        <Route
          path="/form-registr"
          element={
            <PrivateRoute>
              <RegistrationForm onJoin={handleJoin} allInitiatives={allInitiatives} />
            </PrivateRoute>
          }
        />
        <Route path="/form-initiative" element={<FormInitiativePage />} />
        <Route path="/news"            element={<NewsPage />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/unity-volunteer-react">
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;