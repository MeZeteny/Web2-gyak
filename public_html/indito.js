require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
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

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.locals.BASE_PATH = BASE_PATH;
    res.locals.currentPath = req.path;
    if (!res.locals.layout) res.locals.layout = 'layout';
    next();
});

const router = express.Router();
app.use(BASE_PATH, router);

router.get('/partials/header', (req, res) => {
    res.render('partials/header');
});

router.get('/', async (req, res) => {
    res.render('index', { title: 'Pilóták Világ', stats });
});


app.listen(PORT, '0.0.0.0', () => {
    console.log('F1 adatbázis ÉLESBEN!');
    console.log(`Belső port: ${PORT}`);
    console.log(`Elérhető: http://143.47.98.96/~studb024${BASE_PATH}`);
    console.log(`Indítás: node indito.js &`);
});