const cookieParser = require('cookie-parser');
const express = require('express');
const session = require('express-session');
const appRoot = require('app-root-path')
const fileupload = require('express-fileupload');
const path = require('path');

const app = express();
var porta = process.env.PORT || 5501;

var api = require('./app/routes/api');
var produto = require('./app/routes/produtos');
var rotas = require('./app/routes/rotas');
var servico = require('./app/routes/servicos');
var usuario = require('./app/routes/usuario');
var admin = require('./app/routes/admin');
var conexao = require('./app/bin/database')

app.use((req, res, next) => {
    res.header({ 'access-control-allow-origin': '*' });
    next();
});

app.set("view engine", 'ejs');
app.set('views', path.join(__dirname + '/app/views'))

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser('secret'))
app.use(express.json());
app.use(express.static(__dirname+'/app/public'));
app.use(fileupload());

app.use(session({
    secret: "any",
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
    resave: false
}))

app.use('/produto', produto)
app.use('/servicos', servico)
app.use('/', rotas)
app.use('/api', api)
app.use('/usuario', usuario)
app.use('/admin', admin)

app.use(function (req, res, next) {
    conexao.query("SELECT * FROM empresa where 1", (err, result) => {
        if (err) throw r.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(404);

        logos = result[0].logo.split(';');
        phones = result[0].telefone.split(';');
        
        // respond with html page
        if (req.accepts('html')) {
            res.render('404', {
                empresa: {
                    "id": result[0].id,
                    "nome": result[0].nome,
                    "titulo": result[0].nome,
                    "nif": result[0].nif,
                    "endereco": result[0].endereco,
                    "endereco_small": "Camama, Talatona, Luanda",
                    "logo": logos[0],
                    "logo_alt": logos[1],
                    "contactos": {
                        "tel01": phones[0],
                        "tel02": phones[1],
                        "email": result[0].email,
                        "whatsapp": result[0].whatsapp
                    }
                } });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.json({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });
});

app.listen(porta, ()=>console.log("Servidor rodando com sucesso no http://127.0.0.1:"+porta));