app = require("express").Router();
conexao = require("../bin/database");

const get_empresa_data = () => new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM empresa limit 5", (err, result) => {
        if (err) throw ({ msg: "Falha na execução da consulta", error: err, state: reject(err) });
        resolve(result)
    });
})

app.get('/', (req, res) => get_empresa_data().then(result => {
    if (req.cookies.user){

        res.render("usuario/index", {
            empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } }
        })
    } else {
        res.redirect('/usuario/entrar', 301);
    }
}).catch(err => console.log(err)));

app.get('/carrinho', (req, res) => get_empresa_data().then(result => { res.render("usuario/carrinho/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } } }) }).catch(err => console.log(err)));

app.get('/minhas-compras', (req, res) => get_empresa_data().then(result => { res.render("usuario/orders", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } } }) }).catch(err => console.log(err)));

app.get('/entrar', (req, res) => {
    let sessao = 0;

    console.log(req.cookies)

    if (req.cookies['usuario']) {
        sessao = {
            uid: req.cookies.usuario.split('&')[0].split(':')[1],
            nome: Buffer.from(req.cookies.usuario.split('&')[1].split(':')[1]).toString("utf-8"),
            username: req.cookies.usuario.split('&')[2].split(':')[1],
        }
    } else {
        get_empresa_data().then(result => {
            res.render("usuario/login", {
                empresa: {
                    "id": result[0].id,
                    "nome": result[0].nome,
                    "titulo": result[0].nome,
                    "nif": result[0].nif,
                    "endereco": result[0].endereco, slogan: result[0].slogan,
                    "endereco_small": "Camama, Talatona, Luanda",
                    "logo": result[0].logo.split(';')[0],
                    "logo_alt": result[0].logo.split(';')[1],
                    "contactos": {
                        "tel01": result[0].telefone.split(';')[0],
                        "tel02": result[0].telefone.split(';')[1],
                        "email": result[0].email,
                        "whatsapp": result[0].whatsapp
                    }
                }
            })
        }).catch(err => console.log(err))
    }
});

app.get('/esqueci-senha', (req, res) => get_empresa_data().then(result => { res.render("usuario/esqueci", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } } }) }).catch(err => console.log(err)));

app.get('/repor-senha', (req, res) => get_empresa_data().then(result => { res.render("usuario/novaSenha", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } } }) }).catch(err => console.log(err)));

app.get('/criar-conta', (req, res) => get_empresa_data().then(result => { res.render("usuario/signup", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, slogan: result[0].slogan, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } } }) }).catch(err => console.log(err)));

app.get('/sair', (req, res) => {
    req.session.destroy();
    res.clearCookie("user");
    res.redirect("/")
});

module.exports = app;
