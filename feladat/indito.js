require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();

const PORT = 4024;
const BASE_PATH = '/app024';

const pool = mysql.createPool({
    host:     'localhost',
    user:     'studb024',
    password: process.env.DB_PASSWORD,   
    database: 'db024',
    charset:  'utf8mb4',
    connectionLimit: 10
});

const sessionStore = new MySQLStore({}, pool);

app.use(session({
    key: 'session_cookie',
    secret: 'f1_titkos_kulcs_2025',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } 
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.listen(PORT);

app.use((req, res, next) => {
    res.locals.BASE_PATH = BASE_PATH;
    res.locals.currentPath = req.path;
    if (!res.locals.layout) res.locals.layout = 'layout';
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        return res.redirect(BASE_PATH + '/bejelentkezes');
    }
    next();
}

// -------Routeok-------

const router = express.Router();
app.use(BASE_PATH, router);

router.get('/', async (req, res) => {
    res.render('index', { title: 'Pilóták Világa' });
});

router.post('/regisztracio', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashed = await bcrypt.hash(password, 10);
        await pool.execute('INSERT INTO felhasznalok (username, password, role) VALUES (?, ?, ?)', 
            [username, hashed, 'user']);
        res.redirect(BASE_PATH + '/bejelentkezes');
    } catch (err) {
        res.render('regisztracio', { title: 'Regisztráció', error: 'A felhasználónév már foglalt!' });
    }
});

// Bejelentkezés
router.get('/bejelentkezes', (req, res) => {
    res.render('bejelentkezes', { title: 'Bejelentkezés', error: null });
});

router.post('/bejelentkezes', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM felhasznalok WHERE username = ?', [username]);
        if (rows.length === 0) throw new Error();

        const match = await bcrypt.compare(password, rows[0].password);
        if (!match) throw new Error();

        req.session.user = { 
            id: rows[0].id, 
            username: rows[0].username,
            role: rows[0].role || 'user'
        };

        res.redirect(BASE_PATH + '/');
    } catch (err) {
        res.render('bejelentkezes', { title: 'Bejelentkezés', error: 'Hibás felhasználónév vagy jelszó!' });
    }
});

// Kijelentkezés
router.get('/kijelentkezes', (req, res) => {
    req.session.destroy();
    res.redirect(BASE_PATH + '/');
});


app.listen(PORT, '0.0.0.0', () => {
    console.log('F1 adatbázis ÉLESBEN!');
    console.log(`Belső port: ${PORT}`);
    console.log(`Elérhető: http://143.47.98.96/~studb024${BASE_PATH}`);
    console.log(`Indítás: node indito.js &`);
});