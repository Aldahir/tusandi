const api = require('express').Router();
const conexao = require('../bin/database')
const crypto = require('crypto');
const nodemailer = require('nodemailer')
const appRoot = require('app-root-path')

const fs = require('fs');

//#region SERVICO

api.get('/controller/servicos/getAll', (req, res) => {
    var order = null;
    switch (req.query.orderby) {
        case "novelty": order = "`dataCriacao` asc"; break;
        case "name-asc": order = "`nome` asc"; break;
        case "name-desc": order = "`nome` desc"; break;
        case "price-asc": order = "`p`.`preco` asc"; break;
        case "price-desc": order = "`p`.`preco` desc"; break;
        default: order = '`p`.`id` asc'; break;
    }

    let page = (req.query.page == 1)? 0 : req.query.page;

    if (req.query.category == undefined){
        conexao.query(`call getAllServices(${req.query.page}, ${req.query.limit})`, (erro, data) => {
            if (erro) throw erro;
            res.status(201).json(data[0]);
        });
    } else {
        conexao.query(`call getServicesByParam(${page}, ${req.query.limit}, ${parseInt(req.query.category)})`, (erro, data) => {
            if (erro) throw erro;
            console.log(data)
            res.status(201).json(data[0]);
        });
    }
})

api.get('/controller/servicos/get/filter', (req, res) => {
    var order = null;
    switch (req.query.orderby) {
        case "novelty": order = "ORDER BY s.data_criacao asc"; break;
        case "name-asc": order = "ORDER BY s.nome asc"; break;
        case "name-desc": order = "ORDER BY s.nome desc"; break;
        case "price-asc": order = "ORDER BY s.preco asc"; break;
        case "price-desc": order = "ORDER BY s.preco desc"; break;
        default: order = 'ORDER BY s.id asc'; break;
    }

    let page = (req.query.page == 1)? 0 : req.query.page;
    let delivery = req.query.entrega == 'null' || req.query.entrega == undefined ? `` : req.query.entrega == 0 ? `AND s.entrega = 0` : `AND s.entrega = ${req.query.entrega}`;
    let categoria = req.query.category == 'null' || req.query.category == undefined ? `` : ` AND s.cid = ${req.query.category}`;
        
    conexao.query(`SELECT s.id, c.id as categ_id, s.codigo, s.nome, c.nome as categ_nome, c.descricao as categ_descricao, s.descricao, s.imagem, s.preco, s.entrega, DATE_FORMAT(s.data_criacao, '%d-%m-%Y') AS dateCreted, s.estado FROM servicos s INNER JOIN categoria c ON s.cid = c.id WHERE c.tipo = 2 ${categoria} ${delivery} AND s.estado = '1' ${order} LIMIT ${page}, ${req.query.limit};`, (erro, data) => {
        if (erro) throw erro;
        console.log(page, delivery, categoria, order, req.query.limit)
        res.status(201).json(data);
    });
})

api.post('/controller/servicos/reserva/nova', (req, res)=>{
    conexao.query(`CALL reservarServico(?, ?, ?)`, [req.body.serviceID, req.body.userID, req.body.codigo], (err, result)=>{
        if (err) {
            res.send({message:'Não foi possível reservar o serviço. Tente novamente!', success: false, error: err});
            return;
        }
        res.send({ message: 'Serviço reservado com sucesso.', success: true, data: result })
    })
})

api.post('/controller/servicos/reserva/ler/:sid', (req, res)=>{
    conexao.query(`CALL verificarReserva(?, ?, ?)`, [req.params.sid, req.body.userID, req.body.codigo], (err, result)=>{
        if (err) {
            res.send({message:'Não foi possível verificar a reservar. Tente novamente mais tarde.', success: false, error: err});
            return;
        }
        res.send({ message: 'Você já reservou este serviço.', success: true, data: result })
    })
})

//#endregion SERVICO

//#region PRODUTO

api.get('/controller/produto/lertodos', (q, r) => {
    page = q.query.page - 1;
    conexao.query("call getAllProducts(?, ?)", [page, Number(q.query.limit)], (err, res) => {
        if (err) throw  err;
        // if (err) throw r.status(400).json({ msg: "Falha na execução da consulta", error: err });
        r.status(200).json(res[0])
    });
})

api.get('/controller/produto', (req, res) => conexao.query(`SELECT p.id as id, p.cid, p.codigo, CONCAT(UPPER(SUBSTRING(p.nome, 1, 1)), LOWER(SUBSTRING(p.nome, 2, CHAR_LENGTH(p.nome)))) as prod_nome, p.preco, c.nome as categoria, p.descricao, p.imgPath, DATE_FORMAT(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.unidade, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado FROM produto p inner JOIN stock s on s.pid = p.cid INNER JOIN categoria c on c.id = p.cid where p.estado = '1';`, (err, result)=>{
    if (err) {
        res.send({message:'Nao foi possivel completar o seu pedido.', success: false})
        return ;
    }
    res.status(200).json(result)
}))

api.get('/controller/produto/contar', (q, r) => {
    conexao.query("select count(id) as todos from getprodutos", (err, res) => {
        if (err) throw r.status(400).json({ msg: "Falha na execução da consulta", error: err });
        r.status(200).json(res)
    });
})

api.get('/controller/produto/stock', (q, r) => {
    conexao.query("select * from getstock", (err, res) => {
        if (err) throw r.status(400).json({ msg: "Falha na execução da consulta", error: err });
        r.status(200).json(res)
    });
})

api.post('/controller/produto/setacesso', (q, r) => {
    conexao.query('update produto set cliques = cliques + 1 where codigo = ?', [q.body.codigo], (err, result) => {
        if (err) throw r.status(400).json({ msg: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
        r.status(200).json(result);
    });
});

api.post('/controller/save', async (q, r) => {
    //     conexao.query("insert into produto set ?", [q.body], (err, res)=>{
    //     if (err) throw r.status(401).json({error:err, msg: "Não foi possível adicionar o produto. Por favor tente novamente mais tarde."});

    //     r.status(200).json({result:res, msg: "Produto adicionado com sucesso."})
    // })
    r.json(q.body);

});
api.get('/controller/produto/procurar', (req, res) => {
    var order;
    switch (req.query.orderby) {
        case "novelty": order = "dataCriacao asc"; break;
        case "name-asc": order = "nome asc"; break;
        case "name-desc": order = "nome desc"; break;
        case "price-asc": order = "p.preco asc"; break;
        case "price-desc": order = "p.preco desc"; break;
        default: order = 'p.id asc'; break;
    }

    categoria = req.query.category == "" || req.query.category == 'null' ? '%%' : req.query.category;
    page = req.query.page - 1;

    console.log(categoria, order, page, req.query.limit);

    conexao.query(`call getProdutos(?, ?, ?, ?)`, [categoria, order, page, req.query.limit], (err, data) => {
        if (err) throw err
        res.status(200).json(data[0])
    });
});

api.get('/controller/produto/ler/:id', (req, res)=>{
    conexao.query(`SELECT p.id as id, p.cid, p.codigo, concat(upper(substring(p.nome, 1, 1)), lower(substring(p.nome, 2, CHAR_LENGTH(p.nome)))) as prod_nome, p.preco, c.nome as categoria, p.descricao, p.imgPath, date_format(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.unidade, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado FROM tusandi.produto p inner JOIN tusandi.stock s on s.pid = p.cid INNER JOIN tusandi.categoria c on c.id = p.cid where p.id = ${req.params.id} AND p.estado = '1';`, (err, data) => {
        if (err) throw err;
        res.status(200).json({produto: data[0]})
    })
})

api.get('/controller/procurar/categoria/', (q, r) => {
    var order = null;
    switch (q.query.orderby) {
        case "novelty": order = "`dataCriacao` asc"; break;
        case "name-asc": order = "`nome` asc"; break;
        case "name-desc": order = "`nome` desc"; break;
        case "price-asc": order = "`p`.`preco` asc"; break;
        case "price-desc": order = "`p`.`preco` desc"; break;
        default: order = '`p`.`id` asc'; break;
    }

    conexao.query(`select p.id as id, p.cid, p.codigo, concat(upper(substring(p.nome, 1, 1)), lower(substring(p.nome, 2, CHAR_LENGTH(p.nome)))) as nome, p.preco, c.nome as categoria_nome, p.descricao, p.imgPath, date_format(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado from coonet.produto p inner join stock s on s.pid = p.cid inner join categoria c on c.id = p.cid where p.nome like '%${q.query.q}%' and p.estado = '1' and p.cid = ${q.query.cid} order by ${order} limit ${q.query.page}, ${q.query.limit};`, (err, result) => {
        if (err) throw r.status(400).json({ msg: "Falha na execução da consulta", error: err });
        r.status(200).json(result)
    });
});

//#endregion PRODUTO

//#region USUARIO
api.get('/controller/usuario/p', (req, res) => {
    let sessao = 0;
    if (req.cookies['user']) {
        sessao = {
            uid: req.cookies.user.split('&')[0].split(':')[1],
            nome: Buffer.from(req.cookies.user.split('&')[1].split(':')[1]).toString("utf-8"),
            username: req.cookies.user.split('&')[2].split(':')[1],
        }
    }
    
    if (sessao.uid) {
        conexao.query(`call getUsuarioByParam('${sessao.uid}')`, (err, result) => {
            if (err) throw err;
            res.status(201).json({ sessao: result[0][0] })
        });
    } else {
        res.status(200).json({ message: "Nenhum usuario encontrado", estado: 0, data: null })
    }
})

api.get('/controller/usuario/tipo/', (req, res) => conexao.query('SELECT id, tipo, descricao FROM tipo WHERE 1 ', (err, result)=>{
    if (err) throw err;
    res.status(200).json(result)
}))

api.post('/controller/usuario/entrar', (q, r) => {

    conexao.query("call getUsuarioLogin(?, ?)", [q.body.u, crypto.createHash('md5').update(q.body.p).digest("hex"),], (err, result) => {
        if (err) throw r.status(400).json({ msg: "Usuário/senha incorrecta. Por favor tente novamente!", error: err });
        if (result[0].length == 0 || result[0] == null) {
            r.status(200).json({ data: result[0], message: "Usuário/senha incorrecta. Por favor tente novamente!", });
        } else {
            sessao = q.session;

            sessao.uid = result[0][0].id;
            sessao.nome = result[0][0].nome;
            sessao.username = result[0][0].username;
            sessao.telefone = result[0][0].telefone;
            sessao.img = result[0][0].imgPath;
            sessao.email = result[0][0].email;

            r.status(200).json({ data: result[0][0], message: "success", });
        }
    });
});

api.post("/controller/usuario/registo", (q, res) => {
    var file;
    var imgUrl;

    let d = {
        nome: q.body.nome,
        sobrenome: q.body.sobrenome,
        username: q.body.username,
        tipo:q.body.tipo,
        senha: crypto.createHash('md5').update(q.body.senha).digest("hex"),
        telefone: q.body.telefone,
        email: q.body.email,
        genero: q.body.genero,
        paisID: q.body.paisID,
        provinciaID: q.body.provinciaID,
        municipioID: q.body.municipioID,
        endereco: q.body.address,
        aniversario: q.body.aniversario
    }

    if (q.files) {
        let unique_id = crypto.randomBytes(10).toString('hex');
        let folderName = `./app/public/img/u/${unique_id}/`;
        file = q.files.imgPath;

        if (!fs.existsSync(folderName)) {
            fs.mkdir(folderName, 0o777, (err, next)=>{
                if(err) throw err;
                console.log(next);
            });

            const fileName = file.name;
            imgUrl = `/img/u/${unique_id}/${fileName}`;

            file.mv(folderName + fileName, (err) => {
                if (err) {
                    return res.status(500).send('Error uploading file!');
                }
            })
        }
    } else {
        imgUrl = '/img/u/342214655/profile.png';
    }

    conexao.on("error", (err)=>{
        res.json({ message: 'Este telefone já foi registado. Escolha outro número de telefone e tente novamente' });
        return;
    })

    conexao.query("INSERT INTO usuarios (nome, sobrenome, username, senha, telefone, email, genero, img, paisID, provinciaID, municipioID, endereco, aniversario, tipo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [d.nome, d.sobrenome, d.username, d.senha, d.telefone, d.email, d.genero, imgUrl, d.paisID, d.provinciaID, d.municipioID, d.endereco, d.aniversario, d.tipo], (err, result) => {
        if (err) {
            res.send({ success: false, message: 'Este número de telefone já foi registado. Escolha outro número e tente novamente', error: err });
            return;
        }
        res.status(200).json({ message: "success", estado: 1, data: result })
    })
})

api.post('/controller/usuario/recuperar/', (req, res) => {
    let password = crypto.createHash('md5').update(req.body.senha).digest("hex");
    conexao.query('UPDATE usuarios SET senha = ? WHERE id = ?', [password, req.body.id], (err, result)=>{
        if (err) throw err;

        res.json({ data: result })
    })
})

api.post('/controller/usuario/recuperar/confirmar/', async (req, res) => {
    await conexao.query(`SELECT * FROM usuarios WHERE email = '${req.body.e}'`, async (err, result)=>{
        if (err) throw err;
        console.log(result);

        var transporter = nodemailer.createTransport({
            host: 'org-abf.com',
            port: 465,
            auth: {
                user: 'aldaircajicua@org-abf.com',
                pass: 'rBP6hvaGFVML'
            }
        });
        
        var options = {
            from: '"Aldair Cajicua" <aldaircajicua@org-abf.com>',
            to: req.body.e,
            subject: 'Tusandi - Reposição de conta',
            text: "Recuperação de conta",
            html: `<div style="background-color:#f5f5f5;display:flex;flex-direction: column; font: 12pt sans-serif;text-align: center; justify-content: center; align-items: center; padding: 4em 0"><table style="padding:0;margin:0;" width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td><span></span></td><td style="width:600px;padding: 1em;background-color: white;border-radius: 0.5rem;" align="center"><table cellspacing="0" cellpadding="0"><tbody align="center"><tr><td><img src="https://tusandi.com/img/logo_tusandi.png" style="width:250px; margin-bottom: 1em;" alt="Logotipo Tusandi"></td></tr><tr><td style="border-top: thin solid #eeeeee;"><div style="width:100%"><h2>Recuperação de conta</h2></div></td></tr><tr><td><p>Foi solicitado uma reposicao de senha para o e-mail ${req.body.e}.</p></td></tr><tr><td><p>Para recuperar sua conta, clique no botao abaixo</p></td></tr><tr><td><a href="http://127.0.0.1:5501/usuario/repor-senha/?code=${result[0].id}&t=${crypto.createHash('md5').update(req.body.e).digest('hex')}" target="_blank" style="margin: 10px auto 15px auto;display: inline-block;padding:0.5rem 1rem;text-transform: none;box-sizing: border-box;background-color:#ff5722;color:white;border-radius:0.375rem;font-weight: 600;text-align: center;text-decoration: none;vertical-align: middle;cursor: pointer;" class="btn bg-orange text-white py-2 px-4">Repor senha</a></td></tr><tr><td><p style="margin-bottom: 2em;">Se nao solicitou basta ignorar este email que o link expirara dentro de 2h</p></td></tr></tbody></table></td><td><span></span></td></tr><tr><td><span></span></td><td align="center"><table><tr><td style="border-top: thin solid #eeeeee; padding-top: 1em;" align="center"><table style="margin: 0 auto;"><tr><td><a href="https://facebook.com/noname" style="text-decoration: none;"><img src="https://tusandi.com/img/facebook.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td><td><a href="https://instagram.com/noname" style="text-decoration: none; margin:0 .5em"><img src="https://tusandi.com/img/instagram.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td><td><a href="https://linkedin.com/u/noname" style="text-decoration: none;"><img src="https://tusandi.com/img/linkedin.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td></tr></table></td></tr></table></td><td><span></span></td></tr><tr><td><span></span></td><td align="center"><table><tr><td align="center"><p style="margin: 10px 0; color:lightgray; font-size: smaller;">Distrito Urbano de Camama<br>Bairro Dangereux, Rua Sector F, casa n.º Zona 20<br>Talatona, Luanda</p></td></tr><tr><td align="center"><a href="http://127.0.0.1:5501/usuario/newsletter/remover/" style="display:block;padding-bottom:1.5em;font-size:smaller;color:#ff5722; text-decoration: none;">Anular subscrição</a></td></tr></table></td><td><span></span></td></tr></tbody></table></div>`
        }
            
        let mail = await transporter.sendMail(options, (error, info) => {
            if (error) {
                console.log(error)
                res.json({ message: 'Não foi possível enviar o e-mail de confirmação. Por favor Tente novamente', estado: 0 })
            } else {
                console.log('E-mail enviado com sucesso ' + info.response);
                res.json({ message: 'E-mail enviado com sucesso ', estado: 1 })
            }
        });
        res.json({ message: 'E-mail enviado com sucesso ', estado: 1 })
    })
})

api.get('/controller/usuario/confirmar/:uid', (req, res) => {
    conexao.query(`call getUsuarioByParam('${req.params.uid}')`, (err, result) => {
        if (err) throw err;
        // if (err) throw res.status(400).json({ message: "Usuário/senha incorrecta. Por favor tente novamente!", error: err });

        if (result.length == 0 || result == null) {
            res.status(200).json({ data: result, message: "Usuário/senha incorrecta. Por favor tente novamente!", });
        } else {
            res.status(200).json({ data: result[0][0], message: "success", });
        }
    })
})

api.post('/controller/usuario/editar', (q, res)=>{
    conexao.query('UPDATE usuarios SET nome = ?, sobrenome = ?, telefone = ?, email = ?, genero = ?, img = ?, provinciaID = ?, municipioID = ?, endereco = ? WHERE id = ?', [q.body.nome, q.body.sobrenome, q.body.telefone, q.body.email, q.body.genero, '/img/u/342214655/profile.png', parseInt(q.body.provinciaID), parseInt(q.body.municipioID), q.body.endereco, parseInt(q.body.id)], (err, result)=>{
        if (err) throw err;
        // if (err) throw res.status(400).json({ erro: err, message: "Falha na execução da consulta", estado: 0 });
        res.status(201).json({ data: result[0], estado: 1 })
    })
});

//#endregion USUARIO

//#region CATEGORIA

api.get('/controller/categorias', (req, res) => {
    conexao.query(`CALL getCategorias(${req.query.t})`, (err, result) => {
        if (err) throw res.status(400).json({ erro: err, message: "Falha na execução da consulta", estado: 0 })
        res.status(201).json({ data: result[0] })
    })
})

api.post('/controller/categoria/novo', (req, res) => {
    // console.log(req.body)
    res.status(200).json({ data: req.body });
})

//#endregion CATEGORIA

api.get('/controller/pais/provincia/:id/municipio', (req, res) => conexao.query(`select * from municipios where prov_id = ${req.params.id}`, (err, result) => {
    if (err) throw res.status(400).json({ msg: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
    res.status(200).json(result);
}))

api.get('/controller/pais', (req, res) => conexao.query('select * from pais', (err, result) => {
    if (err) throw res.status(400).json({ msg: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
    res.status(200).json(result);
}))

api.get('/controller/pais/provincia', (req, res) => conexao.query('select * from provincia order by prov_nome asc', (err, result) => {
    if (err) throw res.status(400).json({ message: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
    res.status(200).json(result);
}))

api.get('/controller/pais/provincia/:id/municipio', (req, res) => conexao.query(`select * from municipios where prov_id = ${req.params.id}`, (err, result) => {
    if (err) throw res.status(400).json({ message: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
    res.status(200).json(result);
}))

api.get('/controller/metodopagamento', (req, res) => {
    conexao.query('select * from getpaymentmethod', (err, r, f) => {
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r);
    });
});

api.get('/controller/metodopagamento/activo', (req, res) => {
    conexao.query('select * from getpaymentmethodbyparam', (err, r, f) => {
        if (err) throw err;
        // if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r);
    });
});

api.post('/controller/metodopagamento/update', (req, res) => {
    conexao.query(`call updatePaymentMethod(?, ?)`, [req.body.value, req.body.id], (err, r, f) => {
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r);
    });
});

//#region NEWSLETTER

api.get('/controller/newsletter/ler', (req, res) => {
    conexao.query("select * from newsletter", (err, result) => {
        if (err) throw err;
        // if (err) throw res.status(400).json({ msg: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
        res.status(200).json(result);
    })
})

api.get('/controller/newsletter/verificar/existencia/:email', (req, res) => {
    conexao.query(`select if(exists(select email from newsletter where email like '%${req.params.email}%'), 1, 0) as existencia`, (err, result) => {
        if (err) throw err;
        // if (err) throw res.status(400).json({ msg: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
        res.status(200).json(result[0]);
    })
})

//#endregion NEWSLETTER

//#region CARRINHO

api.post('/controller/newsletter/cadastrar', (req, res) => {
    conexao.query("insert into `newsletter` (`id`,`nome`,`email`,`estado`) values (null, ?, ?, '1')", [req.body.n, req.body.e], (err, result) => {
        if (err) {
            res.send({ success: false, message: "Falha ao processar a consulta. Por favor tente novamente!", error: err });
            return;
        }
        res.status(200).json(result);
    })
})

api.get('/controller/carrinho/getAll/', (req, res) => {
    conexao.query('call getCarrinho(?)', [req.query.uid], (err, result)=>{
        if (err) {
            res.send({ success: false, message: "Falha na execução da consulta", error: err });
            return;
        }
        res.status(200).json({ message:"", data:result[0], estado: 1 })
    });
})

api.get('/controller/carrinho/verificar/existencia/:p', (req, res)=>{
    conexao.query(`call verificarCarrinho(${req.params.p})`, (err, r) => {
        if (err) {
            res.send({ success: false, message: "Falha na execução da consulta", error: err });
            return;
        }
        res.status(200).json(r[0]);
    });
})

api.post('/controller/carrinho/add', (req, res)=>{
    conexao.query('CALL addCarrinho(?,?,?,?,?,?)', [req.body.tipo, req.body.uid, req.body.sid, req.body.qtd, req.body.pid, req.body.desconto], (err, result)=>{
        if (err) throw err;
        res.status(200).json({data: result});
    })
})

api.get('/controller/carrinho/contar/', (req, res)=>{
    conexao.query(`select count(id) as qtd_produto_carrinho from carrinho where uid = ?`, [req.query.uid], (err, r) => {
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r[0]);
    });
})

api.get('/controller/carrinho/ler/', (req, res)=>{
    conexao.query('call getCarrinhoByID(?, ?);', [req.query.id, req.query.uid], (err, r) => {
        // if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        if (err) throw err;
        res.status(200).json(r[0]);
    });
})

api.get('/controller/carrinho/remover/:id', (req, res)=>{
    conexao.query(`call removerCarrinho(${req.params.id})`, (err, result)=>{
        if (err) throw err;
        // if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(result);
    })
})

api.post('/controller/carrinho/update', (req, res)=>{
    conexao.query(`call updateCarrinho(?, ?, ?);`, [req.body.userid, req.body.qtd, req.body.pid], (err, result)=>{
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(result);
    });
})

api.get('/controller/carrinho/entrega/valor', (req, res) => {
    conexao.query(`select format(vEntrega, 2, 'de_DE') as entrega from settings`, (err, r) => {
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r[0]);
    });
});

api.get('/controller/carrinho/entrega/iva', (req, res) => {
    conexao.query(`select iva from settings`, (err, r) => {
        if (err) throw res.status(400).json({ msg: "Falha na execução da consulta", error: err });
        res.status(200).json(r[0]);
    });
});
//#endregion CARRINHO

api.post('/controller/contacto', async (req, res) => {

    var transporter = nodemailer.createTransport({
        host: 'tusandi.com',
        port: 465,
        auth: {
            user: 'admin@tusandi.com',
            pass: 'Analisticas.1'
        }
    });

    var options = {
        from: req.body.email,
        to: '"Tusandi" <geral@tusandi.com>',
        subject: 'Tusandi - Solicitação de contacto',
        text: `${req.body.assunto}`,
        html: `<div style="background-color:#f5f5f5;display:flex;flex-direction: column; font: 12pt sans-serif;text-align: center; justify-content: center; align-items: center; padding: 4em 0"><table style="padding:0;margin:0;" width="100%" cellspacing="0" cellpadding="0"><tbody><tr><td><span></span></td><td style="width:600px;padding: 1em;background-color: white;border-radius: 0.5rem;" align="center"><table cellspacing="0" cellpadding="0"><tbody><tr><td><img src="https://tusandi.com/img/logo_tusandi.png" style="width:250px; margin-bottom: 1em;" alt="Logotipo Tusandi"></td></tr><tr><td style="border-top: thin solid #eeeeee;"><div style="width:100%"><h2>${req.body.assunto}</h2></div></td></tr><tr><td><p>Recebeu uma solicitação de contacto de <a href="mailto:${req.body.email}" target="_blank">${req.body.nome}</a>. Responda o mais breve possível.</p></td></tr><tr><td><p>Nome: ${req.body.nome}</p><p>Telefone: <a href="tel:${req.body.telefone}">${req.body.telefone}</a></p><p>E-mail: <a href="mailto:${req.body.email}" target="_blank">${req.body.email}</a></p></td></tr><tr><td><div class=""><div style="font-weight: 600;margin-bottom: 10px;">Assunto:</div>${req.body.assunto}</div><div style="margin-top: 10px;font-weight: 600;">Mensagem:</div><p style="margin-top: 10px;">${req.body.mensagem}</p></td></tr></tbody></table></td><td><span></span></td></tr><tr><td><span></span></td><td align="center"><table><tr><td style="border-top: thin solid #eeeeee; padding-top: 1em;" align="center"><table style="margin: 0 auto;"><tr><td><a href="https://facebook.com/noname" style="text-decoration: none;"><img src="https://tusandi.com/img/facebook.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td><td><a href="https://instagram.com/noname" style="text-decoration: none; margin:0 .5em"><img src="https://tusandi.com/img/instagram.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td><td><a href="https://linkedin.com/u/noname" style="text-decoration: none;"><img src="https://tusandi.com/img/linkedin.png" style="width: 20px;aspect-ratio: 1/ 1;"></a></td></tr></table></td></tr></table></td><td><span></span></td></tr><tr><td><span></span></td><td align="center"><table><tr><td align="center"><p style="margin: 10px 0; color:lightgray; font-size: smaller;">Distrito Urbano de Camama<br>Bairro Dangereux, Rua Sector F, casa n.º Zona 20<br>Talatona, Luanda</p></td></tr><tr><td align="center"><a href="http://127.0.0.1:5501/usuario/newsletter/remover/" style="display:block;padding-bottom:1.5em;font-size:smaller;color:#ff5722; text-decoration: none;">Anular subscrição</a></td></tr></table></td><td><span></span></td></tr></tbody></table></div>`
    };

    let mail = await transporter.sendMail(options, (error, info) => {
        if (error) {
            console.log(error)
            res.json({ message: 'Não foi possível enviar o e-mail de confirmação. Por favor Tente novamente', estado: 0 })
        } else {
            console.log('E-mail enviado com sucesso ' + info.response);
            conexao.query('INSERT INTO contactos (nome, email, telefone, assunto, mensagem) VALUES (?, ?, ?, ?, ?)', [
                req.body.nome, req.body.email, req.body.telefone, req.body.assunto, req.body.mensagem
            ], (err, result) => {
                if (err) throw err;
                console.log(result)
                res.status(200).json({
                    email: {
                        message: 'E-mail enviado com sucesso ',
                        estado: 1
                    },
                    message: 'Mensagem enviada com sucesso',
                    estado:1 
                })
            })
        }
    });

    
});
module.exports = api;