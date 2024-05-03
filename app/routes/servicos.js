const app = require('express').Router();
const conexao = require('../bin/database')

const get_empresa_data = () => new Promise((resolve, reject) => {
    conexao.query("SELECT * FROM empresa", (err, result) => {
        if (err) throw ({ msg: "Falha na execução da consulta", error: err, state: reject(err) });
        resolve(result)
    });
})

app.get('/', (req, res) => get_empresa_data().then(result => res.render('servicos/index', { empresa: { "id": result[0].id, "nome": result[0].nome, "titulo": result[0].nome, "nif": result[0].nif, "endereco": result[0].endereco, "endereco_small": "Camama, Talatona, Luanda", slogan: result[0].slogan, "logo": result[0].logo.split(';')[0],"logo_alt": result[0].logo.split(';')[1],"contactos": {"tel01": result[0].telefone.split(';')[0],"tel02": result[0].telefone.split(';')[1],"email": result[0].email,"whatsapp": result[0].whatsapp}}})));

app.get('/ler/:id',(req, res)=>get_empresa_data().then(result => {
    conexao.query(`select s.id, c.id as categ_id,
	s.codigo , s.nome, c.nome as categ_nome, 
	c.descricao as categ_descricao, s.descricao, s.imagem, s.preco, DATE_FORMAT(s.data_criacao, '%d-%m-%Y') as dateCreted, s.estado 
	from servicos s 
	inner join categoria c on c.id = s.cid 
	where c.tipo = 2 and s.estado = '1' and s.id = ${req.params.id}`, (err, data)=>{
        if (err) throw err;
        // console.log(data);
        res.render('servicos/ler', {
            empresa: {
                "id": result[0].id,
                "nome": result[0].nome,
                "titulo": result[0].nome,
                "nif": result[0].nif, slogan: result[0].slogan,
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
            },
            servicos: data[0]
        });
    })
}));

module.exports = app;