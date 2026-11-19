class Vino {
    constructor(id, nombre, precio, cepa, stock) {
        this.id = id
        this.nombre = nombre
        this.precio = precio
        this.cepa = cepa
        this.stock = stock
    }

    calcularPrecioConIva() {
        return this.precio * 1.21
    }

    descontarStock(cantidad) {
        let hayStockSuficiente = false
        if (this.stock >= cantidad) {
            this.stock = this.stock - cantidad
            hayStockSuficiente = true
        }
        return hayStockSuficiente
    }

    reponerStock(cantidad) {
        this.stock = this.stock + cantidad
    }
}

let listaVino = [
    new Vino(1, "Uvas Sweet", 9788, "Torrontes", 10),
    new Vino(2, "13 Cles Reserva", 11800, "Bonarda", 8),
    new Vino(3, "Pokahara", 12300, "Bonarda", 6),
    new Vino(4, "Simonasi", 14900, "Malbec", 5),
    new Vino(5, "Gran Sombrero", 16200, "Cabernet Sauvignon", 4)
]

let carrito = []

const contenedorItems = document.getElementById("contenedor-items")
const contenedorCarrito = document.getElementById("contenedor-carrito")
const contenedorComprobante = document.getElementById("contenedor-comprobante")
const inputNombre = document.getElementById("input-nombre")
const inputCepa = document.getElementById("input-cepa")
const inputPrecio = document.getElementById("input-precio")
const inputStock = document.getElementById("input-stock")
const btnAgregarVino = document.getElementById("btn-agregar-vino")
const mensajeAlta = document.getElementById("mensaje-alta")
const inputBusqueda = document.getElementById("input-busqueda")
const btnLimpiarFiltros = document.getElementById("btn-limpiar-filtros")
const textoSubtotal = document.getElementById("texto-subtotal")
const textoIva = document.getElementById("texto-iva")
const textoTotalIva = document.getElementById("texto-total-iva")
const textoTotalFinal = document.getElementById("texto-total-final")
const inputCliente = document.getElementById("input-cliente")
const selectPago = document.getElementById("select-pago")
const btnFinalizarVenta = document.getElementById("btn-finalizar-venta")
const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito")

const aplicarDescuento = (monto, porcentaje) => {
    return monto * (1 - porcentaje / 100)
}

const crearTarjetaVino = (vino) => {
    const tarjeta = document.createElement("article")
    tarjeta.className = "card-vino"
    tarjeta.innerHTML = `
        <div>
            <span class="etiqueta-cepa">${vino.cepa}</span>
            <h3>${vino.nombre}</h3>
        </div>
        <div>
            <p class="precio-vino">$${vino.precio.toFixed(2)}</p>
            <p class="precio-iva">Con IVA: $${vino.calcularPrecioConIva().toFixed(2)}</p>
            <p class="stock-vino">Stock disponible: ${vino.stock}</p>
        </div>
        <button class="btn-primario btn-comprar">Agregar al carrito</button>
    `

    const textoStock = tarjeta.querySelector(".stock-vino")
    const botonComprar = tarjeta.querySelector(".btn-comprar")

    if (vino.stock === 0) {
        textoStock.textContent = "Sin stock"
        textoStock.classList.add("sin-stock")
        botonComprar.className = "btn-deshabilitado btn-comprar"
        botonComprar.disabled = true
    }

    botonComprar.addEventListener("click", () => {
        agregarProductoAlCarrito(vino)
    })

    return tarjeta
}

const renderizarCatalogo = (vinosARenderizar) => {
    contenedorItems.innerHTML = ""

    if (vinosARenderizar.length === 0) {
        contenedorItems.innerHTML = `<p class="texto-vacio">No se encontraron vinos con los criterios ingresados.</p>`
    } else {
        vinosARenderizar.forEach((vino) => {
            contenedorItems.appendChild(crearTarjetaVino(vino))
        })
    }
}

const aplicarFiltros = () => {
    const textoBuscado = inputBusqueda.value.trim().toLowerCase()
    const vinosFiltrados = listaVino.filter((vino) => {
        return vino.nombre.toLowerCase().includes(textoBuscado) || vino.cepa.toLowerCase().includes(textoBuscado)
    })
    renderizarCatalogo(vinosFiltrados)
}

const obtenerSiguienteId = () => {
    let mayorId = 0
    listaVino.forEach((vino) => {
        if (vino.id > mayorId) {
            mayorId = vino.id
        }
    })
    return mayorId + 1
}

const mostrarMensajeAlta = (texto, claseMensaje) => {
    mensajeAlta.textContent = texto
    mensajeAlta.className = "mensaje-estado " + claseMensaje
}

const limpiarInputsAlta = () => {
    inputNombre.value = ""
    inputCepa.value = ""
    inputPrecio.value = ""
    inputStock.value = ""
}

const crearNuevoVino = () => {
    const nombre = inputNombre.value.trim()
    let cepa = inputCepa.value.trim()
    const precio = parseFloat(inputPrecio.value)
    const stock = parseInt(inputStock.value)

    if (cepa === "") {
        cepa = "Sin especificar"
    }

    const datosValidos = nombre !== "" && !isNaN(precio) && precio > 0 && !isNaN(stock) && stock >= 0

    if (datosValidos) {
        const nuevoVino = new Vino(obtenerSiguienteId(), nombre, precio, cepa, stock)
        listaVino.push(nuevoVino)
        limpiarInputsAlta()
        mostrarMensajeAlta(`Se agrego "${nuevoVino.nombre}" al catalogo.`, "mensaje-exito")
        aplicarFiltros()
    } else {
        mostrarMensajeAlta("Completa correctamente el nombre, un precio mayor a 0 y un stock valido.", "mensaje-error")
    }
}

const actualizarVista = () => {
    aplicarFiltros()
    renderizarCarrito()
}

const buscarItemEnCarrito = (vino) => {
    return carrito.find((item) => item.vino.id === vino.id)
}

const agregarProductoAlCarrito = (vino) => {
    if (vino.descontarStock(1)) {
        const itemExistente = buscarItemEnCarrito(vino)

        if (itemExistente) {
            itemExistente.cantidad = itemExistente.cantidad + 1
        } else {
            carrito.push({ vino: vino, cantidad: 1 })
        }

        contenedorComprobante.classList.add("oculto")
        actualizarVista()
    }
}

const eliminarDelCarrito = (vino) => {
    const item = buscarItemEnCarrito(vino)

    if (item) {
        vino.reponerStock(item.cantidad)
        carrito = carrito.filter((itemCarrito) => itemCarrito.vino.id !== vino.id)
        actualizarVista()
    }
}

const quitarUnidadDelCarrito = (vino) => {
    const item = buscarItemEnCarrito(vino)

    if (item && item.cantidad > 1) {
        vino.reponerStock(1)
        item.cantidad = item.cantidad - 1
        actualizarVista()
    } else if (item) {
        eliminarDelCarrito(vino)
    }
}

const vaciarCarritoCompleto = () => {
    carrito.forEach((item) => {
        item.vino.reponerStock(item.cantidad)
    })
    carrito = []
    actualizarVista()
}

const calcularMontoFinalSegunPago = (totalConIva) => {
    let totalFinal = totalConIva

    if (selectPago.value === "efectivo") {
        totalFinal = aplicarDescuento(totalConIva, 10)
    } else if (selectPago.value === "credito") {
        totalFinal = totalConIva * 1.15
    }

    return totalFinal
}

const calcularSubtotal = () => {
    return carrito.reduce((acumulador, item) => acumulador + item.vino.precio * item.cantidad, 0)
}

const calcularTotalConIva = () => {
    return carrito.reduce((acumulador, item) => acumulador + item.vino.calcularPrecioConIva() * item.cantidad, 0)
}

const actualizarTotalesDOM = () => {
    const subtotal = calcularSubtotal()
    const totalConIva = calcularTotalConIva()
    const iva = totalConIva - subtotal
    const totalFinal = calcularMontoFinalSegunPago(totalConIva)

    textoSubtotal.textContent = `$${subtotal.toFixed(2)}`
    textoIva.textContent = `$${iva.toFixed(2)}`
    textoTotalIva.textContent = `$${totalConIva.toFixed(2)}`
    textoTotalFinal.textContent = `$${totalFinal.toFixed(2)}`
}

const crearFilaCarrito = (item) => {
    const fila = document.createElement("div")
    fila.className = "item-carrito"
    fila.innerHTML = `
        <span>${item.vino.nombre} <small>($${item.vino.precio.toFixed(2)} c/u)</small></span>
        <div class="controles-cantidad">
            <button class="btn-cantidad btn-restar">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad btn-sumar">+</button>
            <button class="btn-quitar">X</button>
        </div>
    `

    const botonRestar = fila.querySelector(".btn-restar")
    const botonSumar = fila.querySelector(".btn-sumar")
    const botonQuitar = fila.querySelector(".btn-quitar")

    if (item.vino.stock === 0) {
        botonSumar.disabled = true
    }

    botonRestar.addEventListener("click", () => {
        quitarUnidadDelCarrito(item.vino)
    })
    botonSumar.addEventListener("click", () => {
        agregarProductoAlCarrito(item.vino)
    })
    botonQuitar.addEventListener("click", () => {
        eliminarDelCarrito(item.vino)
    })

    return fila
}

const renderizarCarrito = () => {
    contenedorCarrito.innerHTML = ""

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = `<p class="texto-vacio">El carrito esta vacio.</p>`
    } else {
        carrito.forEach((item) => {
            contenedorCarrito.appendChild(crearFilaCarrito(item))
        })
    }

    actualizarTotalesDOM()
}

const finalizarVenta = () => {
    if (carrito.length > 0) {
        let nombreCliente = inputCliente.value.trim()
        if (nombreCliente === "") {
            nombreCliente = "Consumidor Final"
        }

        const subtotal = calcularSubtotal()
        const totalConIva = calcularTotalConIva()
        const iva = totalConIva - subtotal
        const totalFinal = calcularMontoFinalSegunPago(totalConIva)
        const textoMetodoPago = selectPago.options[selectPago.selectedIndex].text

        let detalleProductosHTML = ""
        carrito.forEach((item) => {
            detalleProductosHTML += `<li>${item.cantidad} x ${item.vino.nombre} (${item.vino.cepa}) - $${(item.vino.precio * item.cantidad).toFixed(2)}</li>`
        })

        contenedorComprobante.innerHTML = `
            <h3>Comprobante de Venta</h3>
            <p><strong>Cliente:</strong> ${nombreCliente}</p>
            <p><strong>Forma de pago:</strong> ${textoMetodoPago}</p>
            <ul>${detalleProductosHTML}</ul>
            <hr>
            <p>Subtotal: $${subtotal.toFixed(2)}</p>
            <p>IVA (21%): $${iva.toFixed(2)}</p>
            <p><strong>Total Final Abonado: $${totalFinal.toFixed(2)}</strong></p>
        `
        contenedorComprobante.classList.remove("oculto")
        carrito = []
        renderizarCarrito()
    }
}

btnAgregarVino.addEventListener("click", crearNuevoVino)
inputBusqueda.addEventListener("keyup", aplicarFiltros)

btnLimpiarFiltros.addEventListener("click", () => {
    inputBusqueda.value = ""
    renderizarCatalogo(listaVino)
})

selectPago.addEventListener("change", actualizarTotalesDOM)
btnVaciarCarrito.addEventListener("click", vaciarCarritoCompleto)
btnFinalizarVenta.addEventListener("click", finalizarVenta)

renderizarCatalogo(listaVino)
renderizarCarrito()