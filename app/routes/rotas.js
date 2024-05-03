const p = require('express').Router();
const conexao  = require('../bin/database')

const get_empresa_data = () => new Promise((resolve, reject)=>{
    conexao.query("SELECT * FROM empresa limit 5", (err, result)=> {
        if (err) throw ({ msg: "Falha na execução da consulta", error: err, state: reject(err)});
        resolve(result)
    }); 
})

p.get('/', (req, res) => get_empresa_data().then(result => { res.render("index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp}}})}).catch(err => console.log(err)));

p.get('/contactos', (req, res) => get_empresa_data().then(result => { res.render("contactos/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/carrinho', (req, res) => get_empresa_data().then(result => { res.render("usuario/carrinho/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/servicos', (req, res) => get_empresa_data().then(result => { res.render("servicos/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/nossa-empresa/parceiros', (req, res) => get_empresa_data().then(result => { res.render("nossa-empresa/parceiros/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/nossa-empresa/o-nosso-negocio', (req, res) => get_empresa_data().then(result => { res.render("nossa-empresa/o-nosso-negocio/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/nossa-empresa/sobre-nos', (req, res) => get_empresa_data().then(result => { res.render("nossa-empresa/sobre-nos/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", "logo": result[0].logo.split(';')[0], slogan: result[0].slogan, "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/nossa-empresa/responsabilidade-social', (req, res) => get_empresa_data().then(result => { res.render("nossa-empresa/responsabilidade-social/index", { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0], "logo_alt": result[0].logo.split(';')[1], "contactos": { "tel01": result[0].telefone.split(';')[0], "tel02": result[0].telefone.split(';')[1], "email": result[0].email, "whatsapp": result[0].whatsapp }}})}).catch(err => console.log(err)));

p.get('/procurar/', (req, res) => get_empresa_data().then(result => {
    var order;
    switch (req.query.orderby) {
        case "novelty": order = "`dataCriacao` asc"; break;
        case "name-asc": order = "`nome` asc"; break;
        case "name-desc": order = "`nome` desc"; break;
        case "price-asc": order = "`p`.`preco` asc"; break;
        case "price-desc": order = "`p`.`preco` desc"; break;
        default: order = '`p`.`id` asc'; break;
    }

    categoria = req.query.category == "" || req.query.category == 'null' ? '' : " and " + req.query.category;
    page = Number(req.query.page) - 1;
    
    if(req.query.tipo == 1){
        conexao.query(`SELECT p.id as id, p.cid, p.codigo, concat(upper(substring(p.nome, 1, 1)), lower(substring(p.nome, 2, CHAR_LENGTH(p.nome)))) as prod_nome, p.preco, c.nome as categoria, p.descricao, p.imgPath, date_format(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.unidade, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado FROM tusandi.produto p inner JOIN tusandi.stock s on s.pid = p.cid INNER JOIN tusandi.categoria c on c.id = p.cid where p.estado = '1' ${categoria} order by ${order} limit ${page}, ${Number(req.query.limit)};`, (err, data)=>{
            // console.log(data);
            if(err) throw err;
            res.render('produtos/index', {
                empresa: {
                    "id": result[0].id,
                    "nome": result[0].nome,
                    "titulo": result[0].nome,
                    "nif": result[0].nif,
                    "endereco": result[0].endereco,
                    "endereco_small": "Camama, Talatona, Luanda",
                    "logo": result[0].logo.split(';')[0],
                    "logo_alt": result[0].logo.split(';')[1],
                    "contactos": {
                        "tel01": result[0].telefone.split(';')[0],
                        "tel02": result[0].telefone.split(';')[1],
                        "email": result[0].email,
                        "whatsapp": result[0].whatsapp
                    }
                }, cid: data
            })
        })
    } else { 
        conexao.query('CALL getAllServices(?, ?);', [page, req.query.limit], (err, data)=>{
            if(err) throw err;
            res.render('servicos/index', {
                empresa: {
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
                },
                servicos: data[0]
            }); 
        })
    }
}).catch(err => console.log(err)));

p.get('/finalizar-pedido', (req, res)=>{
    empresa = get_empresa_data().then(r=>r[0]).catch(err=>console.log(err));
    res.render('usuario/checkout', {
        empresa: {
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
        }, data:0})
})

module.exports = p;