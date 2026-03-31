const express = require('express');
const cors = require('cors');
const path = require('path');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_123';

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.error(error);
    }
} else {
    try {
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (error) {
        console.log(error);
    }
}

const db = admin.firestore ? admin.firestore() : null;
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Доступ заборонено' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Недійсний токен' });
        req.user = user;
        next();
    });
};

app.post('/api/register', async (req, res) => {
    try {
        const { email, password, displayName } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Заповніть усі поля' });

        const userExists = await db.collection('users').where('email', '==', email).get();
        if (!userExists.empty) return res.status(400).json({ error: 'Користувач вже існує' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const name = displayName || email.split('@')[0];

        const newUser = await db.collection('users').add({
            email,
            displayName: name,
            password: hashedPassword,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        const token = jwt.sign({ id: newUser.id, email, displayName: name }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, userId: newUser.id, displayName: name });
    } catch (error) {
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const userSnapshot = await db.collection('users').where('email', '==', email).get();

        if (userSnapshot.empty) return res.status(404).json({ error: 'Користувача не знайдено' });

        const userDoc = userSnapshot.docs[0];
        const user = userDoc.data();

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(403).json({ error: 'Неправильний пароль' });

        const token = jwt.sign({ id: userDoc.id, email: user.email, displayName: user.displayName }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, userId: userDoc.id, displayName: user.displayName });
    } catch (error) {
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.get('/api/profile', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

app.post('/api/initiatives/:id/ratings', authenticateToken, async (req, res) => {
    try {
        const initiativeId = req.params.id;
        const { rating } = req.body;
        const userId = req.user.id;

        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Оцінка має бути від 1 до 5' });
        }

        await db.collection('initiatives').doc(initiativeId).collection('ratings').doc(userId).set({
            value: rating,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(200).json({ message: 'Оцінку збережено' });
    } catch (error) {
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

app.get('/api/initiatives/:id/ratings', async (req, res) => {
    try {
        const initiativeId = req.params.id;
        const userId = req.query.userId;
        const ratingsSnapshot = await db.collection('initiatives').doc(initiativeId).collection('ratings').get();

        if (ratingsSnapshot.empty) return res.json({ averageRating: "0.00", totalVotes: 0, userRating: 0 });

        let sum = 0, count = 0, userRating = 0;
        ratingsSnapshot.forEach(doc => {
            const data = doc.data();
            const val = data.value || 0;
            sum += val;
            count++;
            if (userId && doc.id === userId) userRating = val;
        });

        res.json({ averageRating: (sum / count).toFixed(2), totalVotes: count, userRating });
    } catch (error) {
        res.status(500).json({ error: 'Помилка сервера' });
    }
});

const buildPath = path.resolve(__dirname, '..', 'unity-volunteer-react-main', 'build');

app.use(express.static(buildPath));
app.use(express.static(path.join(buildPath, 'static', 'js')));
app.use(express.static(path.join(buildPath, 'static', 'css')));
app.use(express.static(path.join(buildPath, 'assets')));

app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        return next();
    }
    
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(500).send("Error: index.html not found");
    }
});

app.listen(PORT, () => {
    console.log(`Port: ${PORT}`);
});