const app = require("express").Router();
const crypto = require('crypto');
const conexao = require('../bin/database');
const fs = require('fs');
const appRoot = require('app-root-path')

function isAuthenticated(req, res, next) {
    if (req.cookies.uadmin) {
        return next();
    }
    return res.redirect('/admin/usuario/login');
}

/* GET HOMEPAGE. */
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('admin/index', { user: req.cookies.uadmin });
});

app.get('/', isAuthenticated, (req, res) => {
    if (req.cookies.uadmin) { res.render('admin/usuario/login') } else {
        res.render('admin/dashboard')
    }
})


//#region USUARIO

app.get('/usuario', (req, res) => res.render('admin/usuario/index', { user: req.cookies.uadmin }));

app.get('/usuario/login', (req, res) => res.render('admin/usuario/login'));

app.get('/usuario/logout', isAuthenticated, (req, res) => {
    req.session.destroy();
    res.clearCookie("uadmin");
    res.redirect('admin/login')
});
app.get('/usuario/novo', isAuthenticated, (req, res) => res.render('admin/usuario/novo'))

app.get('/usuario/editar/:id', isAuthenticated, (req, res) => conexao.query(`SELECT u.id, pr.id AS provincia_id, t.id AS tipo_id, p.id AS pais_id, m.id as municipio_id, DATE_FORMAT(u.aniversario, '%Y-%m-%d') AS aniversario, DATE_FORMAT(u.create_time, ' %d-%m-%Y') AS dataCreated, t.descricao, u.email, u.endereco, u.estado, u.genero, u.img, m.mun_nome as municipio, u.nome, pr.prov_nome AS provincia_nome, p.pais, u.sobrenome, u.telefone, u.tipo, u.token, DATE_FORMAT(u.update_time, '%d-%m-%Y') AS dataUpdated, username FROM usuarios u LEFT JOIN provincia pr ON pr.id = u.provinciaID LEFT JOIN pais p ON p.id = u.paisID LEFT JOIN municipios m ON m.id = u.municipioID INNER JOIN tipo t ON u.tipo = t.id WHERE u.tipo = 1 OR u.tipo = 2 AND u.estado = 1 AND u.id = ${req.params.id}`, (err, result) => {
    // console.log(result[0])
    res.render('admin/usuario/editar', { user: req.cookies.uadmin, usr: result[0] })
}))

app.post('/api/v1.0.1/usuario/login', (req, res) => {
    let password = crypto.createHash('md5').update(req.body.password).digest('hex');

    conexao.query("SELECT u.id, u.tipo, u.username, u.nome, u.sobrenome, u.genero, u.img, u.telefone, u.email, u.paisID, u.provinciaID, u.municipioID, u.aniversario, u.endereco, u.token, DATE_FORMAT(u.create_time, '%d-%m-%Y') as dataCreated, u.estado FROM usuarios u WHERE u.username = ? AND u.senha = ? AND u.tipo = 1 AND estado = 1", [req.body.username, password], (err, result) => {
        if (err) throw err;
        if (result.length <= 0) {
            res.json({ message: 'Nenhum resultado encontrado', estado: 0 });
        } else {
            session = req.session.user = {
                "id": result[0].id,
                "tipo": result[0].tipo,
                "username": result[0].username,
                "nome": result[0].nome,
                "sobrenome": result[0].sobrenome,
                "genero": result[0].genero,
                "img": result[0].img,
                "telefone": result[0].telefone,
                "email": result[0].email,
                "dataCreated": result[0].dataCreated,
                "estado": result[0].estado,
            }
            res.cookie('uadmin', session, { maxAge: 30 * 24 * 60 * 60 * 1000, secure: false, httpOnly: true, })
            res.redirect('/admin/dashboard')
        }
    })
})

app.get('/api/v1.0.1/usuarios', (req, res) => {
    conexao.query(`SELECT u.id, pr.id AS provincia_id, t.id AS tipo_id, p.id AS pais_id, m.id as municipio_id, DATE_FORMAT(u.aniversario, '%d-%m-%Y') AS aniversario, DATE_FORMAT(u.create_time, '%d-%m-%Y') AS dataCreated, t.descricao, u.email, u.endereco, u.estado, u.genero, u.img, m.mun_nome as municipio, u.nome, pr.prov_nome AS provincia_nome, p.pais, u.sobrenome, u.telefone, u.tipo, u.token, DATE_FORMAT(u.update_time, '%d-%m-%Y') AS dataUpdated, username FROM usuarios u LEFT JOIN provincia pr ON pr.id = u.provinciaID LEFT JOIN pais p ON p.id = u.paisID LEFT JOIN municipios m ON m.id = u.municipioID INNER JOIN tipo t ON u.tipo = t.id WHERE u.tipo = 1 OR u.tipo = 2 AND u.estado = 1`, (err, result) => {
        var data = [];
        result.forEach(i => {
            data.push({
                id: i.id,
                nome: i.nome,
                sobrenome: i.sobrenome,
                idade: i.aniversario,
                email: i.email,
                telefone: i.telefone,
                genero: i.genero,
                photo: i.img,
                token: i.token,
                dataCreated: i.dataCreated,
                dataUpdated: i.dataUpdated,
                tipo_id: i.tipo_id,
                tipo: i.descricao,
                endereco: i.endereco,
                pais: i.pais,
                pais_id: i.pais_id,
                provincia: i.provincia_nome,
                provincia_id: i.provincia_id,
                municipio_id: i.municipio_id,
                municipio: i.municipio,
                estado: i.estado
            })
        })

        res.status(200).json(data);
    })
});

app.post('/api/v1.0.1/usuario/editar/:id', (req, res) => {
    var file;
    var imgUrl;

    let d = {
        nome: req.body.nome,
        sobrenome: req.body.sobrenome,
        username: req.body.username,
        tipo: req.body.tipo,
        senha: crypto.createHash('md5').update(req.body.senha).digest("hex"),
        telefone: req.body.telefone,
        email: req.body.email,
        genero: req.body.genero,
        paisID: req.body.paisID,
        provinciaID: req.body.provinciaID,
        municipioID: req.body.municipioID,
        endereco: req.body.address,
        aniversario: req.body.aniversario
    }
    if (req.files) {
        file = req.files.imgPath
        let unique_id = crypto.randomBytes(10).toString('hex');
        let folderName = `./app/public/img/u/${unique_id}/`;

        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName, 0o777, (err, next) => {
                if (err) throw err;
                console.log(next)
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
        imgUrl = req.body.fileName;
    }

    conexao.query("UPDATE usuarios SET nome = ?, sobrenome = ?, username = ?, senha = ?, telefone = ?, email = ?, genero = ?, img = ?, paisID = ?, provinciaID = ?, municipioID = ?, endereco = ?, aniversario ?, tipo = ?)", [d.nome, d.sobrenome, d.username, d.senha, d.telefone, d.email, d.genero, imgUrl, d.paisID, d.provinciaID, d.municipioID, d.endereco, d.aniversario, d.tipo], (err, result) => {
        if (err) throw err;
        res.status(200).json({ message: "success", estado: 1, data: result })
    })
});

app.post('/api/v1.0.1/usuario/novo', (req, res) => {
    var file = req.files.imgPath;

    let d = {
        nome: req.body.nome,
        sobrenome: req.body.sobrenome,
        username: req.body.username,
        tipo: req.body.tipo,
        senha: crypto.createHash('md5').update(req.body.senha).digest("hex"),
        telefone: req.body.telefone,
        email: req.body.email,
        genero: req.body.genero,
        paisID: req.body.endereco.paisID,
        provinciaID: req.body.endereco.provinciaID,
        municipioID: req.body.endereco.municipioID,
        endereco: req.body.endereco.address,
        aniversario: req.body.aniversario
    }

    conexao.query("INSERT INTO usuarios (nome, sobrenome, username, senha, telefone, email, genero, img, paisID, provinciaID, municipioID, endereco, aniversario, tipo) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)", [d.nome, d.sobrenome, d.username, d.senha, d.telefone, d.email, d.genero, imgPath, d.paisID, d.provinciaID, d.municipioID, d.endereco, d.aniversario, d.tipo], (err, result) => {
        if (err) throw err;
        // if (err) throw res.status(400).json({ message: "Falha ao processar os dados", erro: err, estado: 0 });
        res.status(200).json({ message: "success", estado: 1, data: result })
    })
});

//#endregion USUARIO

//#region CATEGORIA

app.get('/categoria', isAuthenticated, (req, res) => res.render('admin/categoria/index', { user: req.cookies.uadmin }));
app.get('/categoria/novo', isAuthenticated, (req, res) => res.render('admin/categoria/novo', { user: req.cookies.uadmin }));
app.get('/categoria/editar/:i', isAuthenticated, (req, res) => conexao.query("SELECT * FROM categoria WHERE estado = '1' and id = " + req.params.i, (err, result) => {
    if (err) throw err;
    res.render('admin/categoria/editar', { user: req.cookies.uadmin, categoria: result[0] })
})
);
app.get('/categoria/ler/:i', isAuthenticated, (req, res) => conexao.query("SELECT * FROM categoria WHERE estado = '1' and id = " + req.params.i, (err, result) => {
    if (err) throw err;
    res.render('admin/categoria/ler', { user: req.cookies.uadmin, categoria: result[0] })
})
);

app.get('/api/v1.0.1/categoria', (req, res) => conexao.query(`SELECT * FROM categoria WHERE tipo = 2 AND estado = '1' ORDER BY nome ASC`, (err, result) => {
    if (err) {
        res.send({ message: '', success: false, data: null })
        return;
    }
    res.status(200).send({ message: 'Success', success: true, data: result })
}))

app.get('/api/v1.0.1/categoria/lertodas/:tipo', (req, res) => conexao.query("SELECT * FROM categoria WHERE estado = '1' and tipo = " + req.params.tipo, (err, result) => {
    if (err) throw res.status(400).json({ message: "Não foi possível completar seu pedido. Por favor tente novamente.", estado: 0, data: null });
    res.status(200).json(result)
}))

app.post('/api/v1.0.1/categoria/delete', (req, res) => conexao.query("DELETE FROM categoria WHERE estado = '1' and id = ?", [req.body.id], (err, result) => {
    if (err) throw err;
    res.status(200).json({ message: 'Categoria removida com sucesso.' })
}))

app.post('/api/v1.0.1/categoria/novo', (req, res) => {
    let unique_id = crypto.randomBytes(10).toString('hex');
    let folderName = appRoot.path + `/app/public/img/u/${unique_id}`;
    let uploadedFile = req.files.imgPath;



    if (!uploadedFile) {
        return res.status(400).json('No file uploaded!');
    }

    if (!fs.existsSync(folderName)) {
        fs.mkdir(folderName, 0o777, (err, next) => {
            if (err) throw err;

            console.log(next)
        });
    }
    // Process the uploaded file (e.g., save to disk, database)
    const fileName = uploadedFile.name;
    const filePath = `${folderName}/${fileName}`;

    uploadedFile.mv(filePath, (err) => {
        if (err) {
            return res.status(500).send('Error uploading file!');
        }
        conexao.query("INSERT INTO categoria (nome, tipo, descricao, imgPath, estado) VALUES (?, ?, ?, ?,?)", [req.body.nome, Number(req.body.tipo), req.body.descricao, filePath, req.body.estado], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: 'Categoria removida com sucesso.' })
        });
    });

})

app.put('/api/v1.0.1/categoria/editar/:id', (req, res) => {
    let unique_id = crypto.randomBytes(10).toString('hex');
    let folderName = appRoot.path + `/app/public/img/u/${unique_id}`;
    let uploadedFile = req.files.imgPath;

    if (!uploadedFile) {
        return res.status(400).json('No file uploaded!');
    }

    if (!fs.existsSync(folderName)) {
        fs.mkdir(folderName, 0o777, (err, next) => {
            if (err) throw err;

            console.log(next)
        });
    }
    // Process the uploaded file (e.g., save to disk, database)
    const fileName = uploadedFile.name;
    const filePath = `${folderName}/${fileName}`;

    uploadedFile.mv(filePath, (err) => {
        if (err) {
            return res.status(500).send('Error uploading file!');
        }
        conexao.query("UPDATE categoria SET nome = ?, tipo = ?, descricao = ?, imgPath = ?, estado = ? WHERE id = " + req.params.id, [req.body.nome, Number(req.body.tipo), req.body.descricao, filePath, req.body.estado], (err, result) => {
            if (err) throw err;
            res.status(200).json({ message: 'Categoria removida com sucesso.' })
        });
    });

})

//#endregion CATEGORIA

//#region EMPRESA

app.get('/empresa', isAuthenticated, (req, res) => {
    res.render('admin/empresa/index', { user: req.cookies.uadmin });
});

app.get('/empresa', isAuthenticated, (req, res) => {
    res.render('admin/empresa/index', { user: req.cookies.uadmin });
});

app.get('/empresa/dados/ler/:id', isAuthenticated, (req, res) => {
    conexao.query(`SELECT e.id, e.title, e.valor, e.estado, DATE_FORMAT(e.dataCreated, '%d-%m-%Y') as dataCreated, DATE_FORMAT(e.dataUpdated, '%d-%m-%Y') as dataUpdated FROM empresa_valores e WHERE e.id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        res.render('admin/empresa/ler', { user: req.cookies.uadmin, data: result[0] });
    });
});

app.get('/empresa/dados/editar/:id', isAuthenticated, (req, res) => {
    conexao.query(`SELECT e.id, e.title, e.valor, e.estado, DATE_FORMAT(e.dataCreated, '%d-%m-%Y') as dataCreated, DATE_FORMAT(e.dataUpdated, '%d-%m-%Y') as dataUpdated FROM empresa_valores e WHERE e.id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        res.render('admin/empresa/editar', { user: req.cookies.uadmin, data: result[0] });
    })
});

app.get('/empresa/dados/estado/:id', isAuthenticated, (req, res) => {
    conexao.query(`UPDATE empresa_valores e SET e.estado = ${req.query.estado} WHERE e.id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        res.render('admin/empresa/index', { user: req.cookies.uadmin, data: result[0] });
    })
});

app.post('/empresa/dados/editar/:id', isAuthenticated, (req, res) => {
    conexao.query('UPDATE empresa_valores SET title = ?, valor = ?, estado = ? WHERE id = ' + req.params.id, [req.body.title, req.body.valor, req.body.estado], (err, result) => {
        if (err) throw err;
        res.render('admin/empresa/index', { user: req.cookies.uadmin });
    })
});

app.get('/api/v1.0.1/empresa/getAll', (req, res) => {
    conexao.query('SELECT * FROM empresa_valores e', (err, data) => {
        if (err) throw err;
        res.json(data)
    })
})

app.get('/api/v1.0.1/empresa/getinfo/', (req, res) => {
    conexao.query(`SELECT * FROM empresa_valores WHERE id = ${req.query.ti};`, (err, data) => {
        if (err) throw err;
        res.json(data)
    })
});

app.get('/api/v1.0.1/empresa/data', (req, res) => {
    conexao.query('SELECT e.email, e.endereco, e.id, e.logo, e.nif, e.nome, e.telefone, e.whatsapp, e.slogan FROM empresa e', (err, data) => {
        if (err) throw err;

        res.json(data)
    })
});

//#endregion EMPRESA

//#region PARCEIROS
app.get('/parceiros', isAuthenticated, (req, res) => {
    res.render('admin/parceiros/index', { user: req.cookies.uadmin })
});

app.get('/parceiros/editar/:id', isAuthenticated, (req, res) => {
    conexao.query(`SELECT id, eid, nome, telefone, url, img, estado FROM parceiros WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;

        res.render('admin/parceiros/editar', { user: req.cookies.uadmin, data: result[0] })
    })
})

app.get('/parceiros/novo', isAuthenticated, (req, res) => {
    res.render('admin/parceiros/novo', { user: req.cookies.uadmin })
});

app.get('/api/v1.0.1/parceiros/getAll', (req, res) => {
    conexao.query('SELECT id, eid, nome, telefone, url, img, estado FROM parceiros', (err, result) => {
        if (err) throw err;
        res.json(result)
    })
})
app.get('/api/v1.0.1/parceiros/getAll/active', (req, res) => {
    conexao.query('SELECT id, eid, nome, telefone, url, img, estado FROM parceiros WHERE estado = 1', (err, result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.post('/api/v1.0.1/parceiros/novo', (req, res) => {
    var file = req.files.imgPath;
    folderName = new Date().getTime();
    var imgFolder = `./app/public/img/parceiros/${folderName}`;
    // var imgFolder = appRoot.path+`/app/app/public/img/parceiros/${folderName}`;

    if (!fs.existsSync(imgFolder)) {
        fs.mkdirSync(imgFolder, 0o777, (err, next) => {
            if (err) throw err;

            console.log(next)
        });
    }

    var fileName = `/img/parceiros/${folderName}/${folderName}-${file.name}`;
    var fileUpload = imgFolder + `/${folderName}-` + file.name;

    file.mv(fileUpload, (err) => {
        if (err) res.status(401).send("Não foi possível carregar o ficheiro.")

        conexao.query('INSERT INTO parceiros (nome, telefone, url, img, estado) VALUES (?, ?, ?, ?, ?)', [
            req.body.nome, req.body.telefone, req.body.url, fileName, req.body.estado
        ], (err, result) => {
            if (err) throw err;
            res.redirect('/admin/parceiros')
        })
    })
})

app.post('/api/v1.0.1/parceiros/editar/:id', (req, res) => {
    var file;
    var fileName;

    if (req.files) {
        file = req.files.imgPath;

        folderName = new Date().getTime();
        var imgFolder = `./app/public/img/parceiros/${folderName}`;

        if (!fs.existsSync(imgFolder)) {
            fs.mkdirSync(imgFolder, 0o777, (err, next) => {
                if (err) throw err; console.log(err);

                console.log(next)
            });

            fileName = `/img/parceiros/${folderName}/${folderName}-${file.name}`;
            var fileUpload = imgFolder + `/${folderName}-` + file.name;

            file.mv(fileUpload, (err) => {
                if (err) res.status(401).send("Não foi possível carregar o ficheiro.")
            })
        }
    } else {
        file = null;
        fileName = req.body.fileName;
    }

    conexao.query('UPDATE parceiros SET nome = ?, telefone = ?, url = ?, img = ?, estado = ? WHERE id = ' + req.params.id, [
        req.body.nome, req.body.telefone, req.body.url, fileName, req.body.estado
    ], (err, result) => {
        if (err) throw err;
        res.redirect('/admin/parceiros')
    })
})

//#endregion PARCEIROS

//#region PRODUTOS

app.get('/produto', isAuthenticated, (req, res) => res.render('admin/produtos/index', { user: req.cookies.uadmin }))
app.get('/produto/mais-vendido', isAuthenticated, (req, res) => res.render('admin/produtos/index', { user: req.cookies.uadmin }))
app.get('/produto/novo', isAuthenticated, (req, res) => res.send({ title: 'criar produto' }))
app.get('/produto/editar/:id', isAuthenticated, (req, res) => res.send({ id: req.params.id, title: 'editar dados do produto' }))
app.get('/produto/ver/:id', isAuthenticated, (req, res) => res.send({ id: req.params.id, title: 'ver dados produto' }))
app.get('/produto/apagar/:id', isAuthenticated, (req, res) => res.send({ id: req.params.id, title: 'Apagar produto' }))

app.get('/produto/stock', isAuthenticated, (req, res) => conexao.query(`SELECT p.id as id, p.cid, p.codigo, CONCAT(UPPER(SUBSTRING(p.nome, 1, 1)), LOWER(SUBSTRING(p.nome, 2, CHAR_LENGTH(p.nome)))) as prod_nome, p.preco, c.nome as categoria, p.descricao, p.imgPath, DATE_FORMAT(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.unidade, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado FROM produto p inner JOIN stock s on s.pid = p.cid INNER JOIN categoria c on c.id = p.cid where 1;`, (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum resultado encontrado', success: false, data: null })
        return;
    }
    res.render('admin/produtos/stock', { user: req.cookies.uadmin, title: 'ver dados serviço', stock: result })
}))

app.get('/produto/stock/ver/:id', isAuthenticated, (req, res) => conexao.query(`SELECT p.id as id, p.cid, p.codigo, CONCAT(UPPER(SUBSTRING(p.nome, 1, 1)), LOWER(SUBSTRING(p.nome, 2, CHAR_LENGTH(p.nome)))) as prod_nome, p.preco, c.nome as categoria, p.descricao, p.imgPath, DATE_FORMAT(p.dataCreated, '%d-%m-%Y') as dataCriacao, p.cliques, s.unidade, s.qtd, c.estado as ctgStatus, c.descricao as ctgDescricao, p.estado FROM produto p inner JOIN stock s on s.pid = p.cid INNER JOIN categoria c on c.id = p.cid WHERE p.id = ${req.params.id};`, (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum resultado encontrado', success: false, data: null })
        return;
    }
    res.send({ user: req.cookies.uadmin, title: 'ver dados serviço', stock: result })
}))

app.get('/api/v1.0.1/produto', (req, res) => {
    conexao.query(`SELECT * FROM produto WHERE 1`, (err, result) => {
        if (err) throw err;
        res.status(200).json(result)
    })
})

//#endregion PRODUTOS

//#region SERVIÇOS
app.get('/servico', isAuthenticated, (req, res) => res.render('admin/servico/index', { user: req.cookies.uadmin, title: 'serviço' }))
app.get('/servico/novo', isAuthenticated, (req, res) => res.render('admin/servico/novo', { user: req.cookies.uadmin, title: 'criar serviço' }))
app.get('/servico/editar/:id', isAuthenticated, (req, res) => conexao.query(`SELECT * FROM servicos WHERE id = ${req.params.id}`, (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum resultado encontrado', success: false, data: null })
        return;
    }
    res.render('admin/servico/editar', { user: req.cookies.uadmin, title: 'editar dados do serviço', servico: result[0] })
}))
app.get('/servico/ver/:id', isAuthenticated, (req, res) => conexao.query(`select s.id, c.id as categ_id,	s.codigo, s.nome, c.nome as categ_nome, c.descricao as categ_descricao, s.descricao, s.imagem, s.preco, DATE_FORMAT(s.data_criacao, '%d-%m-%Y') as dateCreted, s.estado from servicos s inner join categoria c on s.cid = c.id where c.tipo = 2  and s.id = ${req.params.id}`, (err, result) => { res.render('admin/servico/ver', { user: req.cookies.uadmin, title: 'ver dados serviço', servico: result[0] }) }))
app.get('/servico/estado/:id', isAuthenticated, (req, res) => conexao.query(`UPDATE servicos SET estado = ${req.query.value} WHERE id = ${req.params.id}`, (err, result) => res.redirect('/admin/servico')))
app.get('/servico/apagar/:id', isAuthenticated, (req, res) => conexao.query(`DELETE FROM servicos WHERE id = ${req.params.id}`, (err, result) => { res.redirect('/admin/servico') }))

app.get('/api/v1.0.1/servico', (req, res) => conexao.query('SELECT * FROM servicos', (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum resultado encontrado', success: false, data: null })
        return;
    }
    res.status(200).send({ message: 'Success', success: true, data: result })
}))

app.post('/api/v1.0.1/servico/novo', (req, res) => {
    var file, filePath, filename;
    var unique = Math.floor(1000 + Math.random() * 9000);

    if (req.files) {
        file = req.files.imagem;
        filename = `/img/servicos/${unique}/${file.name}`;
        conexao.query(`select codigo from servicos where codigo = ${unique}`, (err, next) => {
            if (err) throw err;
            console.log(next)
            if (next.length > 0) {
                unique = Math.floor(1000 + Math.random() * 9000);
            } else {
                filePath = `./app/public/img/servicos/${unique}/`;
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath, 0o777, (err, next) => {
                        if (err) throw err;
                        console.log(next);
                    })
                }
                relativePath = filePath + file.name;

                file.mv(relativePath, (err) => {
                    if (err) {
                        res.status(500).json({ message: 'Erro ao carregar a imagem. Tente novamente!', success: false, data: err });
                        return;
                    }
                })
            }
        })
    } else {
        filename = '/img/servicos/services_placeholder.jpg';
    }
    var data = {
        nome: req.body.nome,
        cid: req.body.cid,
        descricao: req.body.descricao,
        imagem: filename,
        entrega: req.body.entrega,
        estado: req.body.estado,
        preco: req.body.preco
    }

    conexao.query('INSERT INTO servicos (cid, codigo, nome, descricao, imagem, preco, entrega, estado) VALUES(?, ?, ?, ?, ?, ?, ?,?)', [data.cid, unique, data.nome, data.descricao, data.imagem, data.preco, data.entrega, data.estado], (err, result) => {
        if (err) {
            res.send({ message: 'Não conseguimos cadastrar o serviço. Tente novamente!', success: false, data: err })
            return;
        }
        // res.status(201).send({message:'Serviço cadastrado com sucesso!', success:true, data:result})
        res.redirect('/admin/servico')
    })
})

app.post('/api/v1.0.1/servico/editar/:id', (req, res) => {
    var file, filePath, filename;
    var unique = req.body.codigo;

    if (req.files) {
        file = req.files.imagem;
        filename = `/img/servicos/${unique}/${file.name}`;

        filePath = `./app/public/img/servicos/${unique}/`;

        relativePath = filePath + file.name;

        file.mv(relativePath, (err) => {
            if (err) {
                res.status(500).json({ message: 'Erro ao carregar a imagem. Tente novamente!', success: false, data: err });
                return;
            }
        })
    }

    var data = {
        nome: req.body.nome,
        cid: req.body.cid,
        descricao: req.body.descricao,
        imagem: filename,
        entrega: req.body.entrega,
        estado: req.body.estado,
        preco: req.body.preco
    }
    conexao.query(`UPDATE servicos SET nome = ${data.nome}, cid = ${data.cid}, descricao = ${data.descricao}, ${req.body.imagem !== null ? 'image = ' + filename : ''}, entrega = ${data.entrega}, estado = ${data.estado}, preco = ${data.preco} WHERE id = ${req.params.id}`, (err, result) => {
        if (err) {
            res.send({ message: 'Não conseguimos cadastrar o serviço. Tente novamente!', success: false, data: err })
            return;
        }
        res.redirect('/admin/servico');
    })
})

//#endregion SERVIÇOS

//#region PAGINAS
app.get('/paginas', isAuthenticated, (req, res) => res.render('admin/paginas/index', { user: req.cookies.uadmin }))
app.get('/paginas/novo', isAuthenticated, (req, res) => res.render('admin/paginas/novo', { user: req.cookies.uadmin }))
app.get('/paginas/editar/:id', isAuthenticated, (req, res) => res.render('admin/paginas/ver', { user: req.cookies.uadmin }))
app.get('/paginas/estado/:id', isAuthenticated, (req, res) => {
    conexao.query(`UPDATE paginas SET estado = ${req.query.estado} WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;
        res.redirect('/admin/paginas');
    })
})

app.get('/api/v1.0.1/paginas/vertodas', (req, res) => {
    conexao.query('SELECT * FROM paginas', (err, result) => {
        if (err) throw err;
        res.json(result)
    })
})

app.get('/api/v1.0.1/paginas/ver/:id', (req, res) => {
    conexao.query(`SELECT * FROM paginas WHERE id = ${req.params.id}`, (err, result) => {
        if (err) throw err;

        res.json(result[0])
    })
})
//#endregion PAGINAS

app.get('/estatisticas/vendas', isAuthenticated, (req, res) => {
    res.render('admin/pages/tables', { user: req.cookies.uadmin });
});


//#region ESTATISTICAS

app.get('/api/v1.0.1/numbers/servicos', (req, res) => conexao.query('SELECT count(id) AS total_servicos FROM servicos', (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum dado retornado. Tente novamente', success: false });
        return;
    }
    res.status(200).json({ message: 'Sucesso', success: true, data: result[0] })
}))
app.get('/api/v1.0.1/numbers/usuarios', (req, res) => conexao.query('SELECT count(id) AS total_usuarios FROM usuarios WHERE tipo = 3', (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum dado retornado. Tente novamente', success: false });
        return;
    }
    res.status(200).json({ message: 'Sucesso', success: true, data: result[0] })
}))
app.get('/api/v1.0.1/numbers/produtos', (req, res) => conexao.query('SELECT count(id) AS total_produtos FROM produto', (err, result) => {
    if (err) {
        res.send({ message: 'Nenhum dado retornado. Tente novamente', success: false });
        return;
    }
    res.status(200).json({ message: 'Sucesso', success: true, data: result[0] })
}))

//#endregion ESTATISTICAS

module.exports = app;