const app = require('express').Router();
const conexao = require('../bin/database')

const get_data = () => new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM empresa limit 5", (err, result) => {
        if (err) throw ({ msg: "Falha na execução da consulta", error: err, state: reject(err) });
        resolve(result)
    });
})

app.get('/', (req, res) => get_data().then(result => res.render("produtos/index", { empresa: { 
            "id": result[0].id, 
            "nome": result[0].nome, 
            "titulo": result[0].nome, 
            "nif": result[0].nif, 
            "endereco": result[0].endereco, 
            "endereco_small": "Camama, Talatona, Luanda", 
             slogan: result[0].slogan,
            "logo": result[0].logo.split(';')[0], 
            "logo_alt": result[0].logo.split(';')[1], 
            "contactos": { 
                "tel01": result[0].telefone.split(';')[0],
                "tel02": result[0].telefone.split(';')[1],
                "email": result[0].email,
                "whatsapp": result[0].whatsapp 
            } 
        } })
).catch(err => console.log(err)));


app.get('/ler/:id', (req, res) => get_data().then(result => {
    res.render("produtos/ler", {
        empresa: { "id": result[0].id, slogan: result[0].slogan, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp } }
    })
}).catch(err => console.log(err)));

module.exports = app;