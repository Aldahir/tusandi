const dlu = () => {
    data = {
        uname: document.getElementById('uname').value,
        senha: document.getElementById('senha').value,
        action: document.getElementById('action').value,
    }
    fetch('http://127.0.0.1:5500/admin/controller/', {
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json;charset=UTf-8"
        },
        method: "post", body: JSON.stringify(data), mode: "cors"
    }).then(r => r.json())
        .then(r => {
            console.log(r);
            if (r.status == true) {
                location.href = `/admin/?uid=${r.data.uid}&lang=pt&token=${r.hash}`;
            }
        })
        .catch(err => console.error(err))
}

async function request(endpoint, data) {
    return await fetch(endpoint, data != null ? { headers: { accept: 'application/json', 'Content-Type': 'application/json;charset=utf-8' }, method: "POST", body: JSON.stringify(data) } : null).then(r => r.json()).then(r => r).catch(err => console.log(err))
};

getProvincia = () => request('/api/controller/pais/provincia').then(c => {
    c.forEach(i => document.querySelector('#provincia').innerHTML += `<option value="${i.id}">${i.prov_nome}</option>`);
    document.querySelector('#provincia').onchange = (ev) => getMunicipio(ev.target.value)
});

getMunicipio = (id) => request(`/api/controller/pais/provincia/${id}/municipio`).then(c => {
    document.querySelector('#municipio').innerHTML = '<option value="null">Escolha o seu município</option>';
    c.forEach(i => document.querySelector('#municipio').innerHTML += `<option value="${i.id}">${i.mun_nome}</option>`)
})

getProdutos = () => fetch('/api/controller/produto').then(r => r.json()).then(r => {
    console.log(r)
    r.forEach(e => {
        if (e.estado == 1) {
            estado = `<span class="bagde p-1 px-4 rounded bg-success text-white fw-semibold small">Online</span>`;
        } else if (e.estado == 2) {
            estado = `<span class="bagde p-1 px-4 rounded bg-gray text-white fw-semibold small">Desactivado</span>`;
        } else {
            estado = `<span class="bagde p-1 px-4 rounded bg-danger text-white fw-semibold small">Offline</span>`;
        }

        digits = ('000' + e.id).substr(-3)

        document.querySelector('.body').innerHTML += `<tr>
            <td>${digits}</td>    
            <td>${e.prod_nome}</td>    
            <td>${e.codigo}</td>     
            <td>${e.preco.toLocaleString('de-DE')}</td>    
            <td style="text-align:center">${estado}</td>    
            <td>
            <a href="/admin/parceiros/editar/${e.id}" class="fa fa-pen-alt fs-6 me-3"></a>
            <a href="/admin/parceiros/estado/${e.id}" class="fa fa-eye-slash fs-6"></a>
            </td>
            </tr>`;
    })
}).catch(err => console.log(err))


editsection = (id) => {
    console.error(id);
}

function navigateToId(id) {
    var iframe = document.getElementById('iframe');
    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    var targetElement = iframeDocument.getElementById(id);
    if (targetElement) {
        // Scroll to the target element inside the iframe
        targetElement.scrollIntoView({ behavior: 'smooth' });
    } else {
        console.error('Element with ID ' + id + ' not found inside iframe.');
    }
}