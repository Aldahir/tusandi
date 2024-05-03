const mysql = require('mysql')

let conexao = mysql.createConnection({
    user: "root",
    database: "tusandi",
    password: "root",
    host: "localhost"
}
);

conexao.connect((err, suc) => {
    if (err) throw err;
    console.log("Base de dados conectada com sucesso!");
});

module.exports = conexao;