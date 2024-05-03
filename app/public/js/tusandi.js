const html = document.querySelector('html');

const c = document.getElementsByClassName("contador");
const m = document.getElementById("section-contador");

const loader = `<div id="loader" class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div>`;

document.addEventListener("readystatechange", (e) => {
    if (e.target.readyState === "complete") {
        document.querySelector('.navbar-toggler').addEventListener("click", () => {
            document.querySelector(".attr").classList.add("d-flex");
            document.querySelector(".attr").classList.remove("d-none");
            document.body.style.overflowY = "hidden"
        })

        document.querySelector('.close-container .btn-close').addEventListener("click", () => {
            document.body.removeAttribute("style");
            document.querySelector(".attr").classList.toggle("d-flex");
            document.getElementById("menuPrincipal").classList.remove("show");
        })
        getCategoriasMenu();
        initilize_components();
        getCategorias();
        contarCarrinho();
    }
    // var lazyloadImages = document.querySelectorAll(".img-fluid");
    // var lazyloadThrottleTimeout;

    // function lazyload() {
    //     if (lazyloadThrottleTimeout) {
    //         clearTimeout(lazyloadThrottleTimeout);
    //     }

    //     lazyloadThrottleTimeout = setTimeout(function () {
    //         var scrollTop = window.scrollY;
    //         lazyloadImages.forEach(function (img) {
    //             if (img.offsetTop < (window.innerHeight + scrollTop)) {
    //                 img.src = img.dataset.src;
    //                 img.classList.remove('lazy');
    //             }
    //         });
    //         if (lazyloadImages.length == 0) {
    //             document.removeEventListener("scroll", lazyload);
    //             window.removeEventListener("resize", lazyload);
    //             window.removeEventListener("orientationChange", lazyload);
    //         }
    //     }, 20);
    // }

    // document.addEventListener("scroll", lazyload);
    // window.addEventListener("resize", lazyload);
    // window.addEventListener("orientationChange", lazyload);
})

async function request(endpoint, data) {
    return await fetch(endpoint, data != null ? { headers: { accept: 'application/json', 'Content-Type': 'application/json;charset=utf-8' }, method: "POST", body: JSON.stringify(data) } : null).then(r => r.json()).then(r => r).catch(err => console.log(err))
};
function get_cursos_by_limit(limit, orderby = null) {
    let c = document.getElementsByClassName("cursos")[0];
    fetch(`/api/controller/curso-controller?limit=${limit}&orderby=${orderby}`).then(r => r.json()).then(r => {
        r.result.forEach(e => {
            c.innerHTML += `<div class="col-lg-4 col-sm-12 col-md-4 px-lg-4 p-3">
                    <div class="rounded-4 shadow">
                        <div class="w-100 position-relative">
                            <a href="cursos/saber-mais/?id=${e.id}" class="text-decoration-none">
                                <img src="/img/cursos/${e.id}/${e.imagem}" class="img-fluid w-100 redondo-alto">
                            </a>
                            <div class="price rounded-circle bg-orange text-white d-flex align-items-center justify-content-center">
                                Kz ${e.valor.toLocaleString('de-DE')},00
                            </div>
                        </div>
                        <div class="align-items-center align-items-lg-start mt-2 justify-content-center p-4 d-flex flex-column gap-lg-4 gap-3">
                            <div class="card-title">
                                <a href="cursos/saber-mais/?id=${e.id}" class="text-decoration-none">
                                    <h4 class="text-center text-lg-start fs-5 fw-bold">${e.titulo}</h4>
                                </a>
                            </div>
                            <div class="card-detail text-center">
                                <p class="card-detail-text small" style="text-align:justify">${e.descricao.substring(0, 100)}</p>
                            </div>
                            <div class="card-rodape small d-flex justify-content-center">
                                <div class="border-orange text-dark-blue border-end d-flex gap-2 pe-lg-4 pe-3">
                                    <span class="align-items-center d-flex fa fa-scroll text-orange"></span>
                                    0 Aulas
                                </div>
                                <div class="d-flex text-dark-blue gap-2 ps-lg-4 ps-3">
                                    <span class="align-items-center d-flex fa-user-group far text-orange"></span>
                                    0 Alunos inscritos
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;
        });
    })
}
function listener(element, callback, type) { element.addEventListener(type, callback) };
function setCookie(nome, valor, expire) {
    const d = new Date();
    d.setTime(d.getTime() + (expire * 24 * 60 * 60 * 1000));
    const e = "expires=" + d.toUTCString();
    document.cookie = nome + " = " + valor + ";" + e + ";path=/";
}
function getCookie(nome) {
    const value = "; " + document.cookie;
    if (value.split('; ').find(e => e.split('=').find(i => i == nome)) === undefined) {
        return 0
    } else {
        const parts = value.split("; " + nome + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }
}
roundNumber = (number, decimals) => {
    var newString;// The new rounded number
    decimals = Number(decimals);
    if (decimals < 1) {
        newString = (Math.round(number)).toString();
    } else {
        var numString = number.toString();
        if (numString.lastIndexOf(",") == -1) {// If there is no decimal point
            numString += ",";// give it one at the end
        }
        var cutoff = numString.lastIndexOf(",") + decimals;// The point at which to truncate the number
        var d1 = Number(numString.substring(cutoff, cutoff + 1));// The value of the last decimal place that we'll end up with
        var d2 = Number(numString.substring(cutoff + 1, cutoff + 2));// The next decimal, after the last one we want
        if (d2 >= 5) {// Do we need to round up at all? If not, the string will just be truncated
            if (d1 == 9 && cutoff > 0) {// If the last digit is 9, find a new cutoff point
                while (cutoff > 0 && (d1 == 9 || isNaN(d1))) {
                    if (d1 != ",") {
                        cutoff -= 1;
                        d1 = Number(numString.substring(cutoff, cutoff + 1));
                    } else {
                        cutoff -= 1;
                    }
                }
            }
            d1 += 1;
        }
        if (d1 == 10) {
            numString = numString.substring(0, numString.lastIndexOf(","));
            var roundedNum = Number(numString) + 1;
            newString = roundedNum.toString() + ',';
        } else {
            newString = numString.substring(0, cutoff) + d1.toString();
        }
    }
    if (newString.lastIndexOf(",") == -1) {// Do this again, to the new string
        newString += ",";
    }
    var decs = (newString.substring(newString.lastIndexOf(",") + 1)).length;
    for (var i = 0; i < decimals - decs; i++) newString += "0";
    //var newNumber = Number(newString);// make it a number if you like
    return newString; // Output the result to the form field (change for your purposes)
}
// var include = []; 
// ()=>{
//     for(let i = 0; i < c.length; i++){include.push(1);
//     if (include[i] != c[i].getAttribute("max-data")){
//         include[i]++;
//     }
//     c[i].innerHTML = include[i];}
// }

// window.onscroll = ()=>{
//     var t = m.offsetTop;
//     var b = m.offsetTop + m.clientHeight;

//     var ts = window.scrollY;
//     var bs = window.scrollY + window.innerHeight;
// }

//#region ADMINDATA

getEmpresaData = (param) => request(`/admin/api/v1.0.1/empresa/getinfo/?ti=${param}`).then(r=>r).catch(err=>toast('Falha ao processar os dados. Erro: '+ err, 1))
renderParts = (term, classe) => {
    getEmpresaData(document.querySelector(term).getAttribute('data-id')).then(r => {
        document.querySelector(`${classe}-title`).innerHTML = r[0].title;
        document.querySelector(`${classe}-text`).innerHTML = r[0].valor
    });
}

//#endregion ADMINDATA

function getactivepaymentmethod() {
    let p = document.querySelector('.payment-method');
    p.innerHTML = loader;
    request('/api/controller/metodopagamento/activo').then((r) => {
        // console.log(r)
        p.innerHTML = `<div class="active image m-auto"><img src="${r[0].img}" alt="${r[0].metodo}"></div>`;
    })
}

async function showPaymentMethod() {
    let ad = document.querySelector('.attr');
    ad.classList.add('d-flex');
    ad.classList.remove('d-none');

    ad.innerHTML += `<div class="wrapper-container text-center">
        <div class="bg-white m-auto p-4">
        <div class="d-flex justify-content-between align-content-center">
            <h2 class="mb-3">Metódos de pagamento</h2>
            <button onclick="closeModal()" class="btn-close" aria-label="Close" id="close-modal"></button>
        </div>    
            <p class="small">Escolha o método de pagamento que lhe facilita completar o seu pedido</p>
            <div class="d-flex payM" style="column-gap: 1em;align-items: flex-end;"></div><div class="col-8 col-lg-7 col-md-5 mx-auto mt-4 p-0"><button id="botao" onclick="savePaymentMethod()" class="botao btn btn-danger">Guardar</button></div></div></div>`;

    let pm = document.querySelector('.payM')

    pm.innerHTML = loader;

    await request('/api/controller/metodopagamento').then((r) => {
        document.querySelector('#loader').remove();
        r.forEach(i => {
            const ch = i.activado == 1 ? 'image imagens img-fluid active' : 'image imagens img-fluid';

            pm.innerHTML += `<img src="${i.img}" style="width: 90px;" class="${ch}" onclick="ox(this)" id="img-${i.id}" data-value="0" title="${i.metodo}" alt="${i.metodo}">`;
        });
    });

    document.body.setAttribute('style', 'overflow:hidden');
}

function ox(el) {
    let d = el.parentNode;

    let ch = d.children;

    for (let i = 0; i < ch.length; i++) {//console.log(ch[i]);
        if (ch[i].id == el.id) {
            el.setAttribute('data-value', "1");
            el.classList.add('active');
        } else {
            ch[i].classList.remove("active");
            ch[i].setAttribute("data-value", "0");
        }
    }
}

function savePaymentMethod() {
    let id = document.querySelector('img.active').id.replace('img-', "");
    let value = document.querySelector('img.active').getAttribute("data-value");

    request('/api/controller/metodopagamento/update', { id: id, value: Number(value) })
        .then((r) => {
            toast('Método de pagamento actualizado com sucesso!');
        })
        .catch(err => { toast('Não foi possível actualizar o método de pagamento.\n Tente novamente.', 1); console.log(err); });
    closeModal();
    getactivepaymentmethod();
}

openModal = (ele, destino) => {
    let x = document.querySelector('.attr');
    x.classList.add('d-flex')
    x.classList.remove('d-none')
    document.body.style.overflowY = "hidden"
    if (destino === 'editar') {
        request(`/api/controller/usuario/confirmar/${getCookie("user").split("&")[0].split(":")[1]}`).then(d => {
            x.innerHTML = `<div class="container">
                            <div class="row">
                                <div class="bg-white col-lg-7 col-md-7 col-sm-12 m-auto rounded-3 shadow">
                                    <div class="row p-3">
                                        <div class="d-flex justify-content-between align-items-center">
                                            <h2 class="fw-light">Editar dados perfil</h2>
                                            <button onclick="closeModal()" class="btn-close" aria-label="Close" id="close-modal"></button>
                                        </div>
                                        
                                        <div class="col-lg-3 col-sm-12 mb-3 userid" data-uid="${d.data.id}">
                                            <label for="id">ID conta</label>
                                            <input type="text" id="id" name="id" value="${d.data.id}" disabled="" class="form-control rounded mt-1">
                                        </div>

                                        <div class="col-lg-5 col-sm-12 mb-3">
                                            <label for="nome">Nome:</label> 
                                            <input type="text" auto-complete="off" class="form-control rounded mt-1" value="${d.data.nome}" name="nome" id="nome">
                                        </div>

                                        <div class="col-lg-4 col-sm-12 mb-3">
                                            <label for="sobrenome">Sobrenome:</label> 
                                            <input type="text" auto-complete="off" class="form-control rounded mt-1" value="${d.data.sobrenome}" name="sobrenome" id="sobrenome">
                                        </div>
                                        <div class="col-lg-3 col-sm-12 mb-3">
                                            <label for="username">Nome de utilizador:</label>
                                            <input type="text" class="form-control rounded mt-1" disabled value="${d.data.username}" name="username" id="username">
                                        </div>
                                        <div class="col-lg-4 col-sm-12 mb-3">
                                            <label for="telefone">Telefone:</label>
                                            <input type="phone" auto-complete="off" class="form-control rounded mt-1" value="${d.data.telefone}" name="telefone" id="telefone">
                                        </div>
                                        <div class="col-lg-5 col-sm-12 mb-3">
                                            <label for="email">E-mail:</label>
                                            <input type="email" auto-complete="off" class="form-control rounded mt-1" value="${d.data.email}" name="email" id="email">
                                        </div>
                                        <div class="col-lg-4 col-sm-12 mb-3">
                                            <label for="provincia">Província:</label>
                                            <select name="provincia" id="provincia" class="form-select mt-1 rounded"></select>
                                        </div>
                                        <div class="col-lg-4 col-sm-12 mb-3">
                                            <label for="municipio">Município:</label>
                                            <select name="municipio" id="municipio" class="form-select mt-1 rounded"></select>
                                        </div>
                                        <div class="col-lg-4 col-sm-12 d-flex flex-column justify-content-around mb-3">
                                            <label for="sexo">Género:</label>
                                            <div class="d-flex gap-2 align-items-center">
                                                <input name="sexo" id="sexo" class="form-check-input" value="masculino" type="radio" ${d.data.genero == 'masculino' ? "checked" : ''}> Masculino
                                                <input name="sexo" id="sexo-femin" class="form-check-input" value="feminino" type="radio" ${d.data.genero == 'feminino' ? "checked" : ''}> Feminino
                                            </div>
                                        </div>
                                        <div class="col-lg-12 col-sm-12 mb-3">
                                            <label for="endereco">Endereço:</label>
                                            <textarea name="endereco" id="endereco" rows="5" style="resize:none" class="form-control rounded mt-1">${d.data.endereco}</textarea>
                                        </div>

                                        <div class="col-lg-12 mb-3 d-flex justify-content-center gap-4">
                                            <button type="button" onclick="closeModal()" class="btn bg-dark-blue rounded text-white">Cancelar</button>
                                            <button type="sumbit" onclick="editUserData()" class="btn bg-orange text-white rounded">Guardar</button>
                                        </div
                                    </div>
                                </div>
                            </div>
                        </div>`;
            getProvincia().then(() => {
                let sel = document.getElementById('provincia');
                var opt = [...sel.options].map(i => {
                    if (i.text == d.data.provincia) {
                        i.selected = "selected"; getMunicipio(i.value).then(() => {
                            mun = document.getElementById('municipio');
                            mun_opt = [...mun.options].map(c => c.selected = c.text == d.data.municipio ? "selected" : false)
                        });
                    }
                })
            });
        })
    } else if (destino === 'delivery') {
        x.innerHTML = `<div class="container">
                        <div class="row">
                            <div class="bg-white col-lg-7 col-md-7 col-sm-12 m-auto rounded-3 shadow">
                                <form method="post" action="" class="row p-3">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <h2 class="fw-light">Adicionar endereço de entrega</h2>
                                        <button onclick="app.a.closeModal(document.querySelector('.attr'))" class="btn-close" aria-label="Close" id="close-modal"></button>
                                    </div>
                                    
                                    <div class="col-lg-12 col-sm-12 mb-3">
                                        <p class="form-text">Este será o endereço que usaremos para entregá-lo os produtos na sua lista de pedidos quando estes estarem prontos.<br>Poderá adicionar até (2) dois endereços no seu plano.</p>
                                    </div>

                                    <div class="col-lg-6 col-sm-12 mb-3">
                                        <label for="username">Nome de utilizador:</label>
                                        <input type="text" auto-complete="off" class="form-control rounded-0 mt-1" disabled="" value="${getCookie("user").split("&")[2].split(":")[1]}" name="username" id="username">
                                        <input type="hidden" value="${parseInt(getCookie("user").split("&")[0].split(":")[1])}" name="uid">
                                    </div>
                                    <div class="col-lg-6 col-sm-12 mb-3">
                                        <label for="telefone">Telefone:</label>
                                        <input type="phone" auto-complete="off" class="form-control rounded-0 mt-1" value="${document.querySelector('.sessao-phone').innerText}" name="telefone" id="telefone">
                                    </div>

                                    <div class="col-lg-12 col-sm-12 mb-3">
                                        <label for="endereco">Endereço:</label>
                                        <input type="address" auto-complete="on" class="form-control rounded-0 mt-1" name="endereco" id="endereco">
                                    </div>

                                    <div class="col-lg-12 mb-3 d-flex justify-content-center gap-4">
                                        <button type="button" onclick="app.a.closeModal(document.querySelector('.attr'))" class="btn btn-primary rounded-0">Cancelar</button>
                                        <button type="sumbit" class="btn btn-danger rounded-0">Guardar</button>
                                    </div
                                </form>
                            </div>
                        </div>
                    </div>`
    } else if (destino === 'details') {
        request(`/api/controller/carrinho/ler/?uid=${user_id()}&id=${ele}`).then(e => {
            // console.log(e)
            x.innerHTML = `<div class="container">
                <div class="row">
                    <div class="bg-white col-lg-7 col-md-7 col-sm-12 m-auto rounded-2 shadow">
                        <form method="post" action="" class="row p-3">
                            <div class="d-flex justify-content-between">
                                <h2 class="fw-light mt-3 mb-4">Detalhes do pedido</h2>
                                <button onclick="closeModal()" class="btn-close" aria-label="Close" id="close-modal"></button>
                            </div>
                            <div class="col-lg-5 mb-3">
                                <img src="${e[0].imgPath.split(';')[0]}" alt="${e[0].nome}" class="img-fluid rounded-2">
                            </div>
                            <div class="col-lg-7">
                                <div class="row">
                                    <div class="col-lg-12 mb-3">
                                        <h3 class="fw-semibold">${e[0].nome}</h3>
                                    </div>

                                    <div class="d-flex flex-column col-lg-4 bg-dark bg-opacity-10 rounded border border-1">
                                        <span class="fw-semibold">Código: </span>
                                        <span>${e[0].codigo}</span>
                                    </div>
                                    
                                    <div class="col-lg-2"></div>

                                    <div class="d-flex flex-column col-lg-6 align-items-lg-start">
                                        <span class="fw-semibold">Tipo: </span>
                                        <span class="badge text-start text-capitalize bg-primary small">${e[0].tipo}</span>
                                    </div>

                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Preço:</span> 
                                        <span>${e[0].preco}</span>
                                    </div>

                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Quantidade: </span>
                                        <span>${e[0].qtd}/${e[0].unidade}</span>
                                    </div>
                                    
                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Data do pedido: </span>
                                        <span>${e[0].dataCriacao}</span>
                                    </div>
                                    
                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Valor do pedido: </span>
                                        <span>${e[0].total}</span>
                                    </div>
                                </div>
                            </div>
                                
                            <div class="col-lg-12 mt-3 d-flex flex-column">
                                <span class="fw-semibold mb-2">Descrição: </span>
                                <span>${e[0].descricao}</span>
                            </div>
                            <hr class="hr my-4">
                            <div class="col-lg-12 mb-3 d-flex justify-content-center gap-4">
                                <button type="button" onclick="closeModal()" class="btn bg-dark-blue text-white">Fechar</button>
                            </div
                        </form>
                    </div>
                </div>
            </div>`;
        })
    } else if (destino === 'editCart') {
        request(`/api/controller/carrinho/ler/?id=${ele}&uid=${user_id()}`).then(d => {
            console.log(d)
            d.map(o => x.innerHTML += `<div class="container" id="modal_${o.id}">
                <div class="row">
                    <div class="m-auto col-lg-7 col-sm-12 col-md-7 bg-white rounded-3 shadow-lg">
                        <div class="p-5">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="fs-3 fw-bold h5 modal-title" target="_blank" id="EditarTrabalhoCarrinho"><a class="nav-link" href="/produto/ler/${o.id}">Trabalho ${o.nome}</a></h5>
                                    <button type="button" class="btn-close" aria-label="Close" onclick="closeModal()"></button>
                                </div>
                                <div class="modal-body">
                                    <form action="" class="align-items-baseline d-flex justify-content-between py-5" method="post">
                                        <div class="d-flex flex-column">
                                            <span class="fw-semibold">Código: &nbsp;</span>
                                            <span class="mt-2">${o.tipo === 1 ? o.codigo : o.codigo}</span>
                                        </div>
                                        <div class="quant-prod position-relative">
                                            <span class="fw-semibold lh-lg">Quantidade: &nbsp;</span>
                                            <div class="d-flex">
                                                <button onclick="decreaseQTY(document.querySelector('[name=cart-qtd]'), ${o.preco})" class="btn btn-white border px-3 rounded-0" type="button" id="btn-addon3">
                                                    <i class="fas fa-minus"></i>
                                                </button>
                                                <input onclick="info()" type="text" class="form-control text-center bg-white border-bottom border-top border-0 rounded-0" style="width:50px" name="cart-qtd" id="cart-qtd" value="${o.qtd}" aria-label="Quantidade do produto" readonly>
                                                <button onclick="increaseQTY(document.querySelector('[name=cart-qtd]'), ${o.preco})" class="btn btn-white border px-3 rounded-0" type="button" id="btn-addon4">
                                                    <i class="fas fa-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <span class="fw-semibold">Preço: &nbsp;</span>
                                            <span class="mt-2">${roundNumber(o.preco.toLocaleString("de-DE"), 2)} Kz</span>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <span class="fw-semibold">Data: &nbsp;</span>
                                            <span class="mt-2">${o.dataCriacao}</span>
                                        </div>
                                        <div class="d-flex flex-column">
                                            <span class="fw-semibold">Estado: &nbsp;</span>
                                            ${o.estado == 1 ? '<span class="badge bg-primary mt-2">Pronto para entrega</span>' : '<span class="badge bg-danger mt-2">Indisponível</span>'}
                                        </div>
                                    </form>
                                </div>
                                <hr class="hr my-4">
                                <div class="gap-lg-4 justify-content-center modal-footer">
                                    <button type="button" onclick="closeModal()" class="btn bg-dark-blue text-white">Cancelar</button>
                                    <button type="button" onclick="updatePreco(${o.id}, ${user_id()})" class="btn bg-orange text-white">Guardar</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
            // carregarProduto()
            //carregarCarrinho()
            increaseQTY = (e) => { document.querySelector('info') == null || undefined ? null : removeInfo(); v = Number(e.value); return e.value = v >= 1 ? e.value = v + 1 : 1 }
            decreaseQTY = (e) => { document.querySelector('info') == null || undefined ? null : removeInfo(); v = Number(e.value); return e.value = v > 1 ? e.value = v - 1 : 1 }
            removeInfo = () => { var d = document.querySelector('[name=cart-qtd]'); d.classList.remove('border-end', 'border-start', 'border-danger'); document.querySelector('info').remove() }
            info = () => { document.querySelector('info') == null || undefined ? null : removeInfo(); var d = document.querySelector('[name=cart-qtd]'); d.classList.add('border-end', 'border-start', 'border-danger'); x = d.parentNode; x.parentNode.innerHTML += '<info class="d-block small text-danger position-absolute"><b>Não é possível escrever neste campo</b><br><span class="d-flex">Por favor use os botões -/+ para alterar os dados deste campo</span></info>' }
        })
    }
}

closeModal = () => {
    // console.log('>>>>>>>>>. i wanna go home');
    var attr = document.querySelector('.attr');
    document.body.removeAttribute('style');
    attr.classList.remove('d-flex')
    attr.classList.add('d-none')
    attr.innerHTML = "";
}

function readURL(input) {
    var url = input.value ? input.value : null;
    var ext = url.substring(url.lastIndexOf('.') + 1).toLowerCase();

    if (input.files && input.files[0] && (ext == "png" || ext == "jpg" || ext == "jpeg")) {
        var reader = new FileReader();

        reader.onload = (e) => {
            document.querySelector('.img-recept').setAttribute('src', e.target.result);
        }

        reader.readAsDataURL(input.files[0]);
    } else {
        document.querySelector('.img-recept').setAttribute('src', "/img/default_replace_photo.png");
    }
}

//#region Categoria

function getCategorias() {
    request('/api/controller/categorias/?t=1').then(d => {
        d.data.forEach(i => {
            if (document.querySelector('.categ-lista')) {
                document.querySelector('.categ-lista').innerHTML += `<li class="nav-item">
                <a href="/produto/?category=${i.id}&page=1&limit=6" class="ms-lg-4 nav-link"><span>${i.nome}</span></a></li>`
            };
        })
    });
}

function getCategoriasMenu() {
    request('/api/controller/categorias/?t=1').then(d => {
        d.data.forEach(i => document.querySelector('.categorias').innerHTML += `<li class="item" id="category-${i.id}">
            <a href="/produto/?category=${i.id}&page=1&limit=6" class="d-flex flex-column gap-3" rel="noopener noreferrer">
            <img src="${i.imgPath}" alt="${i.nome}"><span>${i.nome}</span></a></li>`);
    });
}

//#endregion Categoria

//#region Produto

function updatePrice(qtd, price) {
    let preco = document.querySelector('.preco');
    value = price * qtd

    preco.innerHTML = value.toLocaleString("de-DE")
}

increaseQTY = (e, p) => {
    // document.querySelector('info') == null || undefined ? null : removeInfo();
    value = Number(e.value);
    total = value >= 1 ? e.value = value + 1 : 1;
    updatePrice(total, p);
    return e.value = total;
}

decreaseQTY = (e, p) => {
    value = Number(e.value);
    total = value > 1 ? e.value = value - 1 : 1;
    updatePrice(total, p);
    return e.value = total;
}

renderProduto = (element, pagina, orderby) => {
    const limite = 6;

    categoria = gQURL(location.href, 'category');
    page = pagina == null ? gQURL(location.href, 'page') : pagina;
    let limit = limite == null ? gQURL(location.href, 'limit') : limite;
    let order = orderby == null ? gQURL(location.href, 'orderby') : orderby;

    let path = `/api/controller/produto/procurar/?category=${categoria}&page=${page}&limit=${limit}&orderby=${order}`;

    element.innerHTML = "";
    element.innerHTML = loader;
    element.innerHTML = "";

    request(path).then(r => {
        r.forEach(i => {
            let img = i.imgPath.split(';')
            element.innerHTML += `<div class="col-lg-4 p-0">
            <div class="m-2 card mb-lg-4 border-1 rounded">
                <div class="img-cover">
                    <a href="/produto/ler/${i.id}" class="p-0">
                        <img src="${img[0]}" class="img-fluid rounded" alt="${i.prod_nome}">
                    </a>
                </div>

                <div class="pd-container">
                    <div class="px-4 header mt-lg-3">
                        <h2 class="card-title fs-4 fw-bolder">
                            <a href="/produto/ler/${i.id}" class="nav-link px-0">${i.prod_nome}</a>
                        </h2>
                    </div>
                    <div class="px-4 pb-lg-4 body s7-text-small-2">
                        <div class="card-text my-lg-3">
                            <span class="descript">${i.descricao.substring(0, 80)}</span>
                        </div>
                        <p class="align-items-center d-flex mb-0">
                            <span class="preco fw-bolder fs-5">Kz
                                ${i.preco.toLocaleString("de-DE")}
                            </span>
                            <span class="qtdMin">/Kg</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>`
        })
    })
}

contarAcesso = (id) => {
    request('/api/controller/produto/setacesso')
}

getProdutoByID = (codigo) => {
    request(`/api/controller/produto/ler/${codigo}`).then(r=>{
        // console.log(r)
        let qtd = document.querySelector('#qty');
        let incQTY = document.querySelector('#increaseQTY');
        let decQTY = document.querySelector('#decreaseQTY');
        let preco = document.querySelector('.preco');
        let nome = document.querySelector('.prd-nome');
        let cb01 = document.querySelector('.cb01');
        let peso = document.querySelector('.peso');
        let title = document.querySelector('.title');
        let code = document.querySelector('.code');
        let imglist = document.querySelector('.img-list');
        let principal = document.querySelector('.principal');
        let currentPage = document.querySelector('[aria-current="page"]');

        img = r.produto.imgPath.split(';')

        currentPage.innerText = r.produto.prod_nome;
        cb01.setAttribute('href', `/produto/?category=${r.produto.cid}&page=1&limit=6`)
        decQTY.setAttribute('onclick', `decreaseQTY(document.getElementById('qty'), ${r.produto.preco})`)
        incQTY.setAttribute('onclick', `increaseQTY(document.getElementById('qty'), ${r.produto.preco})`)
        cb01.innerText = r.produto.categoria
        nome.innerText = r.produto.prod_nome;
        code.innerText = r.produto.codigo;
        preco.innerText = r.produto.preco.toLocaleString("de-DE");
        peso.innerText = r.produto.qtd+' '+r.produto.unidade;

        if (r.produto.qtd > 0) { 
            title.innerHTML += `<span class="badge bg-success small">Em stock</span>`
         } else { 
            title.innerHTML += `<span class="badge bg-danger small">Esgotado</span>` 
        }

        principal.src = img[0];
        principal.setAttribute('alt', r.produto.prod_nome)

        for (let i = 0; i < img.length; i++) {
            imglist.innerHTML += `<img src="${img[i]}" alt="Imagem 1 do produto" id="img0${i}" class="img-fluid">`
        }

        document.getElementById('addCart').setAttribute('onclick', `addToCarrinho(${r.produto.id}, document.querySelector('#qty').value, user_id(), 0)`)
        document.getElementById('checkout').setAttribute('onclick', `confirmarPedido(${r.produto.id}, document.querySelector('#qty').value, user_id())`);
    }).catch(err=>console.log(err));
}

function finalizarPedido(pid, qtd, uid) {}
function confirmarPedido(pid, qtd, uid) {
    attr = document.getElementsByClassName("attr")[0];

    attr.classList.add('d-flex', 'container-fluid');
    attr.classList.remove('d-none');

    let id = getCookie('user').split('&')[0].split(':')[1]
    let uname = getCookie('user').split('&')[1].split(':')[1];
    let email = getCookie('user').split('&')[3].split(':')[1];

    request(`/api/controller/produto/ler/${pid}`).then(s=>{let e = s.produto; /*console.log(e)*/
        estado = e.qtd > 0 ? `<span class="badge bg-success small">Em stock</span>` : `<span class="badge bg-danger small">Esgotado</span>`;
    attr.innerHTML += `
        <div class="w-75 row">
            <div class="bg-white col-lg-12 m-auto rounded p-4">
                <div class="d-flex justify-content-between align-content-center">
                    <h2 class="mb-3">Confirmação de pagamento</h2>
                    <button onclick="closeModal()" class="btn-close" aria-label="Close" id="close-modal"></button>
                </div>
                <p class="small">Por favor confirme os dados da transação abaixo:</p>
                <div class="row">

                    <div class="col-lg-8">
                        <div class="small">
                            <b>Dados do comprador</b>
                            <div class="">
                                <span>Nome:</span>
                                <span class="">${uname}</span>
                            </div>
                            <div class="mt-2">
                                <span>E-mail:</span>
                                <span class="">${email}</span>
                            </div>
                        </div>
                        <hr class="hr my-4">
                        <div class="row small">
                            <div class="col-lg-6">
                                <b>Dados do produto</b>
                                <div class="row">
                                    <div class="col-lg-12 mb-3">
                                        <h3 class="fw-semibold">${e.prod_nome}</h3>
                                    </div>

                                    <div class="d-flex flex-column col-lg-4 bg-dark bg-opacity-10 rounded border border-1">
                                        <span class="fw-semibold">Código: </span>
                                        <span>${e.codigo}</span>
                                    </div>
                                    
                                    <div class="col-lg-2"></div>

                                    <div class="d-flex flex-column col-lg-6 align-items-lg-start">
                                        <span class="fw-semibold">Tipo: </span>
                                        ${estado}
                                    </div>

                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Preço:</span> 
                                        <span>${e.preco.toLocaleString("de-DE")}</span>
                                    </div>

                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Quantidade: </span>
                                        <span>${qtd}/${e.unidade}</span>
                                    </div>
                                    
                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Data do pedido: </span>
                                        <span>${e.dataCriacao}</span>
                                    </div>
                                    
                                    <div class="d-flex flex-column col-lg-6 mt-3">
                                        <span class="fw-semibold">Valor do pedido: </span>
                                        <span>${(e.preco * qtd).toLocaleString("de-DE")}</span>
                                    </div>
                                </div>
                            </div>
                                
                            <div class="col-lg-12 mt-3 d-flex flex-column">
                                <span class="fw-semibold mb-2">Descrição: </span>
                                <span>${e.descricao}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 mt-4">
                        <div class="bg-black bg-opacity-10 border rounded p-3">
                            <div class="text-start">
                                <label for="pay-method">Total a pagar:</label>
                                <h4 class="pgt-01">Kz 0.000.000,00</h4>
                            </div>
                            <div class="mt-3 text-start">
                                <label for="pay-method">Forma de pagamento:</label>
                                <select class="form-select text-capitalize" id="pay-method" name="pay-method"></select>
                            </div>
                            <div class="align-items-center bg-white d-flex flex-column justify-content-center mt-3 pgt-02 px-2 py-3 rounded text-start"></div>
                        </div>
                    </div>
                </div>
                <div class="col-12 col-lg-7 col-md-5 mx-auto mt-4 p-0">
                    <button id="botao" onclick="finalizarPedido()" class="botao btn bg-orange text-white">Pagar</button>
                </div>
            </div>
        </div>`;
    }).finally(()=>{
        document.getElementById("pay-method").addEventListener('change', (e)=>{
            console.log(e.target.value)
            document.querySelector(".pgt-02").innerHTML = loader;
            // document.querySelector("pgt-02").innerHTML = ``;
        })
        
        request('/api/controller/metodopagamento').then((r) => {
            r.forEach(i=>{
                document.getElementById("pay-method").innerHTML += `<option value="${i.id}">${i.metodo}</option>`;
            })
        })
    })
}

//#endregion Produto

//#region Usuario

novoUsuario = async () => {
    let conf = document.getElementById('csenha');
    let p = document.getElementById('senha');

    var d = {
        nome: document.querySelector('#nome').value,
        sobrenome: document.querySelector('#sobrenome').value,
        username: document.querySelector('#username').value,
        senha: document.querySelector('#senha').value,
        telefone: document.querySelector('#telefone').value,
        email: document.querySelector('#email').value,
        genero: document.querySelector('[name=sexo]').value,
        address: document.querySelector('#endereco').value,
        paisID: parseInt(document.querySelector('[name=paisID]').value),
        tipo: parseInt(document.querySelector('[name="usertipo"]').value),
        provinciaID: parseInt(document.querySelector('[name=provincia]').value),
        municipioID: parseInt(document.querySelector('[name=municipio]').value),
        imgPath: null,
        aniversario: document.querySelector('#aniversario').value,
    }

    document.querySelector('.frm').addEventListener("submit", (e) => { e.preventDefault(); return false })

    if (conf.value.length > 3) {
        if (p.value.length === 0 && conf.value.length === 0) {
            p.focus();
            toast(`<div class="text-white small">A senha não pode estar vazia. Escreva a senha da tua conta e tente novamente.</div>`, 1)
        } else if (p.value != conf.value) {
            conf.focus()
            toast(`<div class="text-white small">As senhas não condizem. Verifique a senha e tente novamente.</div>`, 1);
        } else {
            await request('/api/controller/usuario/registo', d).then(i => {
                document.querySelector('#nome').setAttribute('disabled', 'disabled')
                document.querySelector('#sobrenome').setAttribute('disabled', 'disabled')
                document.querySelector('#username').setAttribute('disabled', 'disabled')
                document.querySelector('#senha').setAttribute('disabled', 'disabled')
                document.querySelector('#telefone').setAttribute('disabled', 'disabled')
                document.querySelector('#email').setAttribute('disabled', 'disabled')
                document.querySelector('[name=sexo]').setAttribute('disabled', 'disabled')
                document.querySelector('#endereco').setAttribute('disabled', 'disabled')
                conf.setAttribute('disabled', 'disabled')
                document.querySelector('#provincia').setAttribute('disabled', 'disabled')
                document.querySelector('#municipio').setAttribute('disabled', 'disabled')
                document.querySelector('#aniversario').setAttribute('disabled', 'disabled')

                if (i.success == false){
                    toast(i.message, 1)
                } else if (i.message == "success"){
                    toast("Usuário cadastrado com sucesso");

                    location.reload()
                }
            }).finally(()=>{
                document.querySelector('#nome').removeAttribute('disabled')
                document.querySelector('#sobrenome').removeAttribute('disabled')
                document.querySelector('#username').removeAttribute('disabled')
                document.querySelector('#senha').removeAttribute('disabled')
                document.querySelector('#telefone').removeAttribute('disabled')
                document.querySelector('#email').removeAttribute('disabled')
                document.querySelector('[name=sexo]').removeAttribute('disabled')
                document.querySelector('#endereco').removeAttribute('disabled')
                conf.removeAttribute('disabled')
                document.querySelector('#provincia').removeAttribute('disabled')
                document.querySelector('#municipio').removeAttribute('disabled')
                document.querySelector('#aniversario').removeAttribute('disabled');
                
            });
        }
    } else {
        toast(`A senha tem de ter no mínimo 8 carácteres. Tente novamente`, 1);
        return false
    }
}

getUserData = () => request('/api/controller/usuario/p')
    .then(d => {
        document.getElementById('profile-img').src = d.sessao.img
        document.querySelector('.username').innerText = d.sessao.nome + ' ' + d.sessao.sobrenome
        document.querySelector('.nome').innerText += d.sessao.nome + ' ' + d.sessao.sobrenome
        document.querySelector('.snome').innerText += d.sessao.nome
        document.querySelector('.unome').innerText += d.sessao.username
        document.querySelector('.sexo').innerText += d.sessao.genero
        document.querySelector('.email').innerText += d.sessao.email
        document.querySelector('.userid').setAttribute('data-uid', d.sessao.id)
        document.querySelector('.endereco').innerText += d.sessao.endereco
        document.querySelector('.sessao-phone').innerText += d.sessao.telefone
        // console.log(d.sessao)
    }).catch(err => console.log(err));

editUserData = async () => {
    d = {
        id: document.querySelector('#id').value,
        nome: document.querySelector('#nome').value,
        sobrenome: document.querySelector('#sobrenome').value,
        username: document.querySelector('#username').value,
        telefone: document.querySelector('#telefone').value,
        email: document.querySelector('#email').value,
        genero: document.querySelector('[name=sexo]').value,
        endereco: document.querySelector('#endereco').value,
        provinciaID: document.querySelector('#provincia').value,
        municipioID: document.querySelector('#municipio').value,
        imgPath: null,
    }
    await request('/api/controller/usuario/editar', d)
        .then(r => {
            // let x = document.querySelector('.attr');
            if (r.estado === 1) {
                toast("<b>Parabéns.</b><br>Seus dados foram actualizados com sucesso.")
            } else {
                toast("<b>Oops!</b><br>Não conseguimos actualizar os seus dados. Por favor, tente novamente!", 1)
            }
        }).finally(() => { closeModal() });
}

userLogin = () => {
    u = document.getElementById('_usr');
    p = document.getElementById('_pwd');
    data = { u: u.value, p: p.value }

    if (data.u == '' || data.p == '') {
        toast('Os campos não podem estar vazios. Por favor escreva seu utilizador e sua senha!', 1);
        u.focus();
    } else {
        request('/api/controller/usuario/entrar', data).then(r => {
            if (r.message == "success") {
                setCookie("user", 'uid:' + r.data.id + '&name:' + r.data.nome + '&uname:' + r.data.username + '&email:' + r.data.email, 5);
                location.href = "/usuario"
            } else {
                toast('Usuário/senha incorrecta.<br> Por favor verifique e tente novamente', 1)
            }
        })
    }
}

confirmRecoverAccount = (e) => {
    let suc = document.createElement('div');
    let email = document.getElementById("mail");

    if (email.value.length == 0) { toast("Por favor escreva o e-mail no campo abaixo", 1); email.focus() } else {
        request('/api/controller/usuario/recuperar/confirmar/', { e: email.value }).then(r => {
            if (r.estado == 0) {
                toast(r.message, 1);
            } else {
                suc.innerHTML = `<div class="text">Enviamos um e-mail para seu email 
                <span class="link-offset-1 text-decoration-underline">${email.value}</span>.
                <br><br>Confira e recupere sua conta.</div>`;

                document.querySelector('.d-slide').classList.add('d-none')
                document.querySelector('.card-body').classList.add('flex-column-reverse', 'd-flex', 'gap-3');
                document.querySelector('.card-body').append(suc);

                toast(r.message)
            }
        })
    }
}

recoverAccount =async (e) => {
    let suc = document.createElement('div');
    let senha = document.getElementById("senha");
    let csenha = document.getElementById("csenha");

    if (senha.value.length == 0) { toast("Por favor escreva a sua nova senha", 1); senha.focus() } else {
        if (senha.value != csenha.value){
            toast("As senhas não combinam. Tente novamente", 1); csenha.focus()
        } else {
            senha.setAttribute('disabled','disabled');
            csenha.setAttribute('disabled','disabled');

        await request('/api/controller/usuario/recuperar/', { senha: senha.value, id: gQURL(location.href, 'code') }).then(r => {
            suc.innerHTML = '<div class="text fs-4">Sua conta foi recuperada com sucesso.<br><a href="/usuario/entrar" class="btn bg-orange text-white mt-3 py-2 px-4">Fazer login</a></div>';

            document.querySelector('.d-slide').classList.add('d-none')
            document.querySelector('.card-body').classList.add('flex-column-reverse', 'd-flex', 'gap-3');
            document.querySelector('.card-body').append(suc);
        }).finally(()=>{
            senha.removeAttribute('disabled'); senha.value = "";
            csenha.removeAttribute('disabled'); csenha.value = "";

            toast('Sua conta foi recuperada com sucesso.')
        })}
    }
}

setNewsletter = async () => {
    let x = { n: getCookie("user").split("&")[2].split(":")[1] || null, e: document.querySelector('#newsletter').value.length == 0 ? alert("Preencha este campo") : document.querySelector('#newsletter').value }
    return document.querySelector('#newsletter').value.length == 0 ? null : await request(`/api/controller/newsletter/verificar/existencia/${x.e}`).then(d => {
        if (d.existencia == 1) {
            toast("O email fornecido já está cadastrado para receber todas as novidades.", 1)
        } else {
            request('/api/controller/newsletter/cadastrar', x).then(t => {
                if (t.affectedRows == 1) {
                    toast("Cadastrou-se para receber as novidades com sucesso", 0)
                }
            })
        }
        document.querySelector('#newsletter').value = "";
    })
}

user_id = () => {
    if (!getCookie('user')) {
        location.href = '/usuario/entrar';
    } else {
        let dx = getCookie('user').split('&');
        ds = dx[0].split(':');
        return Number(ds[1]);
    }
}

verificarSessao = (contact)=> {
    // console.log(getCookie('user'))
    const userWrapper = document.getElementById('loginUser');
    if (!getCookie('user')) {
        userWrapper.classList.remove('p-2');
        userWrapper.innerHTML = `
        <a href="/usuario/entrar" class="btn bg-orange text-white mb-3 w-100">Entrar</a>
        <p class="smaller">Você não tem uma conta? <a href="/usuario/criar-conta" class="text-dark-blue text-decoration-none">Criar conta</a></p>
        <hr class="hr">
        <p class="smaller m-0">Tem alguma dúvida? <a href="${contact}" class="text-dark-blue text-decoration-none">Fale connosco</a>
        </p>`;
    } else {
        userWrapper.classList.remove('p-4');
        userWrapper.classList.add('p-2');
        userWrapper.innerHTML = `
            <li class=""><a id="menu-pg-tab-1" class="d-flex mt-3 px-4 text-decoration-none" href="/usuario">A minha conta</a></li>
            <li class=""><a id="menu-pg-tab-2" class="d-flex my-3 px-4 text-decoration-none" href="/usuario/#pg-2">Dados do perfil</a></li>
            <li class=""><a id="menu-pg-tab-3" class="d-flex mb-3 px-4 text-decoration-none" href="/usuario/#pg-3">Histórico de pagamentos</a></li>
            <li class="dropdown-divider"></li>
            <li class="mt-3"><a class="bg-orange d-flex mx-2 my-2 p-3 py-2 text-white" href="/usuario/sair">Terminar Sessão</a></li>
        `;
    }
}

//#endregion Usuario

function setAttr(el, object) {
    for (var key in object) {
        el.setAttribute(key, object[key])
    }
}

function toast(message, type = 0) {
    var cl = null;
    document.querySelector("toast").remove();
    if (type == 0) { cl = "bg-success"; }
    else if (type == 1) { cl = "bg-danger"; }
    else if (type == 2) { cl = "bg-warning"; }
    else if (type == 3) { cl = "bg-info"; }
    else { cl = "bg-default"; }
    initilize_components()
    const msg = new bootstrap.Toast(document.querySelector('toast'));

    document.querySelector("toast").classList.add(cl);
    document.querySelector(".toast-body").innerHTML = message;

    msg.show();
}

function initilize_components() {
    var toast = document.createElement('toast');
    toast.innerHTML = '<div class="d-flex"><div class="toast-body text-white"></div><button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';

    setAttr(toast, { class: `toast fade position-fixed z-3`, role: 'alert', 'aria-live': 'assertive', 'aria-atomic': 'true', style: 'right: 3%; bottom: 5%;' });

    return document.body.append(toast);
}

getProvincia = () => request('/api/controller/pais/provincia').then(c => {
    c.forEach(i => document.querySelector('#provincia').innerHTML += `<option value="${i.id}">${i.prov_nome}</option>`);
    document.querySelector('#provincia').onchange = (ev) => getMunicipio(ev.target.value)
});

getMunicipio = (id) => request(`/api/controller/pais/provincia/${id}/municipio`).then(c => {
    document.querySelector('#municipio').innerHTML = '<option value="null">Escolha o seu município</option>';
    c.forEach(i => document.querySelector('#municipio').innerHTML += `<option value="${i.id}">${i.mun_nome}</option>`)
})

//#region Serviços

getAllServices = (page, limit) => {
    ps = document.querySelector('.servicos-lista');
    var url;
    let query = gQURL(location.href, 'category');
    if (query == '' || query == null){
        url = `/api/controller/servicos/getAll/?page=${page}&limit=${limit}`;
    } else {
        url = `/api/controller/servicos/getAll/?category=${query}&page=${page}&limit=${limit}`
    }

    ps.innerHTML = loader;
    
    request(url).then(data => {
        ps.innerHTML = "";
        if (document.querySelector('.categ-nome')) {
        document.querySelector('.categ-nome').innerText = 'Lista de serviços';
        document.querySelector('.categ-text b').innerText = 'disponíveis';
        // document.querySelector('.categ-text b').classList.add('d-none');
    }

        if (data.length <= 0){
            ps.innerHTML = `<div class="d-flex flex-column justify-content-center align-items-center">
            <div class="fs-4 text-center lh-lg text-dark opacity-50 mb-3"><h2>Nenhum serviço encontrado.</h2></div>
            </div>`
        }

        data.forEach(e => {
            // if (document.querySelector('.categ-nome')) {document.querySelector('.categ-nome').innerText = e.categ_nome;
            // document.querySelector('.categ-text').classList.remove('d-none');
            // document.querySelector('.categ-text b').innerText = e.categ_nome;}
            ps.innerHTML += `
                <div class="col-lg-4 col-sm-12 col-md-4 pt-3">
                    <div class="rounded-4">
                        <div class="w-100 position-relative">
                            <a href="/servicos/ler/${e.id}" class="text-decoration-none">
                                <!-- <img src="https://dummyimage.com/600x400/fbc0044" class="img-fluid w-100 rounded"> -->
                                <img src="${e.imagem}" class="img-fluid w-100 rounded" alt="${e.nome}">
                            </a>
                            <!--<div
                                class="price rounded-circle bg-orange text-white d-flex align-items-center justify-content-center">
                                Kz ${e.preco.toLocaleString("de-DE")}
                            </div>-->
                        </div>
                        <div
                            class="align-items-center align-items-lg-start mt-2 justify-content-center p-4 d-flex flex-column gap-lg-4 gap-3">
                            <div class="card-title">
                                <a href="/servicos/ler/${e.id}" class="text-decoration-none">
                                    <h4 class="text-center text-lg-start fs-5 fw-bold">${e.nome}</h4>
                                </a>
                            </div>
                            <div class="card-detail text-center">
                                <p class="card-detail-text small" style="text-align:justify">${e.descricao.substring(0,100)+'...'}</p>
                            </div>
                            <div class="card-rodape small d-flex justify-content-center flex-column">
                                <!--<div
                                    class="text-dark-blue d-flex gap-2 pe-lg-4">
                                    <span class="align-items-center d-flex fa fa-scroll text-orange"></span>
                                    5 pedidos/mês
                                </div>-->
                                <div class="d-flex align-items-start mt-2 text-dark-blue gap-2">
                                    <span class="mt-1 fa-list far text-orange"></span>${e.categ_nome}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
        })

    }).catch(err => console.log(err))
}

getCategoriaServicos = () => {
    request('/api/controller/categorias/?t=2').then(d => {
        d.data.forEach(i => {
            if (document.querySelector('.service-categoria')) {
                document.querySelector('.service-categoria').innerHTML += `<li class="nav-item">
                <a href="/servicos/?category=${i.id}&page=1&limit=10" class="ms-lg-4 nav-link"><span>${i.nome}</span></a></li>`
            };
        })
    });
}



// reservarServico = () => {}
function filterService(order, entrega) {
    ps = document.querySelector('.servicos-lista');

    ps.innerHTML = loader;
    
    request(`/api/controller/servicos/get/filter?category=${gQURL(location.href, "category")}&page=${gQURL(location.href, "page")}&limit=${gQURL(location.href, "limit")}&orderby=${order}&entrega=${entrega}`).then(r => {
        ps.innerHTML = "";
        
        r.forEach(e => {
            // if (document.querySelector('.categ-nome')) {
            //     document.querySelector('.categ-nome').innerText = e.categ_nome;
            //     document.querySelector('.categ-text').classList.remove('d-none');
            //     document.querySelector('.categ-text b').innerText = e.categ_nome;
            // }
            ps.innerHTML += `
                <div class="col-lg-4 col-sm-12 col-md-4 pt-3">
                    <div class="rounded-4">
                        <div class="w-100 position-relative">
                            <a href="/servicos/ler/${e.id}" class="text-decoration-none">
                                <!-- <img src="https://dummyimage.com/600x400/fbc0044" class="img-fluid w-100 rounded"> -->
                                <img src="${e.imagem}" class="img-fluid w-100 rounded" alt="${e.nome}">
                            </a>
                            <!--<div
                                class="price rounded-circle bg-orange text-white d-flex align-items-center justify-content-center">
                                Kz ${e.preco.toLocaleString("de-DE")}
                            </div>-->
                        </div>
                        <div
                            class="align-items-center align-items-lg-start mt-2 justify-content-center p-4 d-flex flex-column gap-lg-4 gap-3">
                            <div class="card-title">
                                <a href="/servicos/ler/${e.id}" class="text-decoration-none">
                                    <h4 class="text-center text-lg-start fs-5 fw-bold">${e.nome}</h4>
                                </a>
                            </div>
                            <div class="card-detail text-center">
                                <p class="card-detail-text small" style="text-align:justify">${e.descricao}</p>
                            </div>
                            <div class="card-rodape small d-flex justify-content-center flex-column">
                                <!--<div
                                    class="text-dark-blue d-flex gap-2 pe-lg-4">
                                    <span class="align-items-center d-flex fa fa-scroll text-orange"></span>
                                    5 pedidos/mês
                                </div>-->
                                <div class="d-flex align-items-start mt-2 text-dark-blue gap-2">
                                    <span class="mt-1 fa-list far text-orange"></span>${e.categ_nome}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`
        })
    })
}

function reservarServico(serviceID){
    let serviceCode = `${~~(Math.random() * 10e3)}`.padStart(4, 0)

    request(`/api/controller/servicos/reserva/ler/${serviceID}`, {codigo: serviceCode, userID: user_id()}).then(d=>{
        d.data[0].length > 0 ? toast(d.message, 2) : 
        request(`/api/controller/servicos/addreserva`, { serviceID: serviceID, userID: user_id(), codigo: serviceCode}).then(r=>{
            r.data.affectedRows == 1 ? toast(r.message) : toast(r.message, 1);
        })
    })
}
//#endregion Serviços

count_on_scroll = (time) => {
    container = document.querySelector('#section-contador');
    counters = document.querySelectorAll('.contador');
    let isActive = false;

    window.addEventListener("scroll", (e) => {
        if (scrollY > container.offsetTop - container.offsetHeight - 200 && isActive === false) {
            counters.forEach(counter => {
                let count = 0;
                counter.innerText = 0;
                const updateCounter = () => {
                    const target = parseInt(counter.dataset.count);

                    if (count < target) {
                        count++;
                        counter.innerText = count;
                        setTimeout(updateCounter, time)
                    } else {
                        counter.innerText = target
                    }
                };

                updateCounter();

                isActive = true;
            });
        } else if (scrollY < container.offsetTop - 500 || scrollY === 0 && isActive === true) {
            counters.forEach(counter => counter.innerText = 0);
            isActive = false
        }
    })
}

gQURL = (url, term) => { let qs = new URL(url); let xs = qs.searchParams.get(term); return xs },

//#region Carrinho

addToCarrinho = async (pid, qtd, uid, desconto) => {
    if (uid == undefined || uid == null) {
        location.href = '/usuario/entrar';
    } else {
        await request(`/api/controller/carrinho/verificar/existencia/${pid}`).then(async d=> {
            d.length == 0 ? 
                request('/api/controller/carrinho/add', { pid: pid, qtd: parseInt(qtd), uid: parseInt(uid), desconto: desconto }).then(r => {
                console.log(r);
                if (tipo == 1) {
                    toast("Produto adicionado ao carrinho com sucesso")
                } else {
                    toast("Serviço adicionado ao carrinho com sucesso")
                }
                contarCarrinho()
            }).catch(err => console.log(err)) : d[0].estado == 1 ?
                    await request(`/api/controller/carrinho/update`, { userid: user_id(), qtd: (parseInt(d[0].qtd) + parseInt(qtd)), pid:pid}).then(f => {
                    console.log(f)
                    if (f.affectedRows == 1) {
                        toast('Quantidade produto no carrinho foi actualizada com sucesso.');
                    }
                    contarCarrinho()
                }).catch(err => console.log(err))
            : null;
        }).catch(err => console.log(err))
    }
}

removeCarrinho = async (i, u) => {
    let r = document.querySelector('.pedido-abc');
    document.querySelector('.cart-price').classList.add('d-none')
    document.querySelector('.cart-recept').classList.toggle('col-lg-12')
    r.innerHTML = "";
    r.innerHTML = loader;

    await request(`/api/controller/carrinho/remover/${i}`).then(res => {
        r.innerHTML = "";
        if (res.affectedRows == 1) {
            toast('Item removido do seu carrinho com sucesso')
        } else {
            toast('Não foi possível remover do carrinho. Por favor tente novamnte!', 1)
        }
    })
    await carregarCarrinho();
    await contarCarrinho();
},

contarCarrinho = async () => {
    if (getCookie("user") == null || getCookie("user") == 0) {
        return 0
    } else {
        await request(`/api/controller/carrinho/contar/?uid=${user_id()}`).then(d => {
            if (d.qtd_produto_carrinho == 0 || d.qtd_produto_carrinho === undefined) {
                document.querySelector('.q-c') == null ? '' : document.querySelector('.q-c').innerText = 0
            } else {
                document.querySelector('.cart-recept') == null ? 0 : document.querySelector('.cart-recept').classList.add("col-lg-8")
                document.querySelector('.cart-recept') == null ? 0 : document.querySelector('.cart-recept').classList.remove("col-lg-12")
                document.querySelector('.cart-price') == null ? 0 : document.querySelector('.cart-price').classList.remove('d-none');
                document.querySelector('.q-c').innerHTML = d.qtd_produto_carrinho;
            }
        })
    }
}

carregarCarrinho = async () => {
    let rec;
    var total = 0.00;
    var vas;
    uid = 0; getCookie('user')
    if (getCookie('user') == null || getCookie('user') == 0) {
        return 0
    } else {
        // dx = getCookie('user').split('&'); ds = dx[0].split(':'); uid = ds[1];

        if (document.querySelector('.pedido-abc') == null || undefined) rec = null
        else {
            rec = document.querySelector('.pedido-abc');
            rec.innerHTML = "";
            await request(`/api/controller/carrinho/getAll/?uid=${user_id()}`).then(async d => {
                console.log(d)
                if (await d.data.length === 0) {
                    rec.innerHTML = loader;
                    rec.innerHTML = `<div class="d-flex flex-column justify-content-center align-items-center"><div class="fs-4 text-center lh-lg text-dark opacity-50 mb-3">Seu carrinho está vazio. <br>Por favor clique no botão abaixo para procurar <br>um produto e adicionar ao seu carrinho.</div><a href="/procurar/?page=0" class="btn bg-orange fw-normal px-3 rounded-1 text-uppercase text-white">Procurar produto</a></div>`
                } else {
                    await d.data.forEach(e => {
                        document.querySelector('.cart-price').classList.remove('d-none')
                        document.querySelector('.cart-recept').classList.remove('col-lg-12')
                        cd = (e.total).replace(/\./g, '')
                        vas = cd.substring(0, cd.length -3)
                        total = Number(total) + parseFloat(vas);
                        rec.innerHTML += `<div class="produto-carrinho border-bottom py-4">
                                                <div class="fs-3 mb-4 text-primary">
                                                    <a class="nav-link d-flex" href="/produto/ler/${e.id}">
                                                        <span class="fw-light">Trabalho &nbsp;</span>
                                                        <span class="fw-semibold">${e.nome}</span>
                                                    </a>
                                                </div>
                                                <div class="d-flex small pb-3 justify-content-between align-items-center">
                                                    <div class="d-flex flex-column justify-content-start">
                                                        <span class="fw-semibold small">Cópias/Unidades</span>
                                                        <span class="qtd" data-id="${e.pid}">${e.qtd}</span>
                                                    </div>
                                                    <div class="d-flex flex-column justify-content-start">
                                                        <span class="fw-semibold small">Data do pedido</span>
                                                        <span>${e.dataCriacao}</span>
                                                    </div>
                                                    <div class="d-flex flex-column justify-content-start">
                                                        <span class="fw-semibold small">Preço unitário</span>
                                                        <span class="pnu">${roundNumber((e.preco).toLocaleString("de-DE"), 2)}</span>
                                                    </div>
                                                    <div class="d-flex flex-column justify-content-start">
                                                        <span class="fw-semibold small">Valor total</span>
                                                        <span class="total">${roundNumber((e.total).toLocaleString("de-DE"), 2)}</span>
                                                    </div>
                                                    <div class="icon">
                                                        <a href="javascript:removeCarrinho(${e.id},${user_id()})" title="Remover produto do carrinho">
                                                            <i class="rounded-circle border border-2 border-primary fa fa-close" style="padding: 3px 4.75px"></i>
                                                        </a>
                                                    </div>
                                                </div>
                                                <div class="d-flex justify-content-between">
                                                    <a href="javascript:openModal(${e.id},'details');" id="opDet" data-value="${e.id}" class="btn btn-default mt-3 small text-primary">
                                                        <i class="rounded-circle border border-2 border-primary fa fa-plus" style="padding:2px 3px"></i> &nbsp;Detalhes do trabalho
                                                    </a>
                                                    
                                                    <a href="javascript:openModal(${e.id}, 'editCart')" class="nav-link mt-3 small text-primary">
                                                        <i class="rounded-circle border border-2 border-primary fa fa-pen" style="font-size: 0.7rem;padding: 4.4px;"></i> &nbsp;Editar trabalho
                                                    </a>
                                                </div>
                                            </div>`;
                    });

                    await request(`/api/controller/carrinho/entrega/valor`).then(r => {
                        document.querySelector('.dlv') == null || undefined ? null : document.querySelector('.dlv').innerHTML = loader;
                        r.entrega == 0 || r.entrega === null ? $('.dlv').innerHTML = `0,00 Kz` : document.querySelector('.dlv').innerHTML = r.entrega + ` Kz`
                    });

                    request(`/api/controller/carrinho/entrega/iva`).then(r => {
                        document.querySelector('.pv') == null || undefined ? null : document.querySelector('.pv').innerHTML = loader;
                        document.querySelector('.iva') == null || undefined ? null : document.querySelector('.iva').innerHTML = loader;
                        document.querySelector('.ttl') == null || undefined ? null : document.querySelector('.ttl').innerHTML = loader;

                        if (r.iva == 0 || r.iva === null) document.querySelector('.dlv') == null || undefined ? null : document.querySelector('.dlv').innerHTML = `0,00 Kz`;
                        else {
                            pr = parseFloat(document.querySelector('.dlv').innerText.replace(" Kz", "").replace(".", ""))
                            document.querySelector('.pv') == null || undefined ? null : document.querySelector('.pv').innerHTML = roundNumber((total).toLocaleString("de-DE"), 2) + ` Kz`
                            document.querySelector('.iva') == null || undefined ? null : document.querySelector('.iva').innerHTML = roundNumber(parseFloat(total * r.iva).toLocaleString("de-DE"), 2) + ` Kz`
                            document.querySelector('.ttl') == null || undefined ? null : document.querySelector('.ttl').innerHTML = roundNumber(new Intl.NumberFormat("de-DE").format(total + (total * r.iva) + pr), 2) + ` Kz`
                        }
                    });
                }
            });
        }
    }
}

updatePreco = async (i, u, q) => await request('/api/controller/carrinho/update', 
    { 
        userid: parseInt(u), 
        qtd: document.querySelector('#cart-qtd') == null || undefined 
            ? parseInt(q)
            : parseInt(document.querySelector('#cart-qtd').value), pid: i }).then(r => {
    if (r.affectedRows == 1) {
        toast("Quantidade produto no carrinho foi actualizada com sucesso");
        carregarCarrinho();
    }
    closeModal()
})

editarCarrinho = () => {
    console.log('>>>>>>>>')
}

//#endregion Carrinho
