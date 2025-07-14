// --- 1. Obtener referencias a elementos del HTML ---
const fechaInput = document.getElementById('fecha');
const descripcionInput = document.getElementById('descripcion');
const montoVentaInput = document.getElementById('montoVenta');
const agregarVentaBtn = document.getElementById('agregarVenta');
const tablaVentasBody = document.querySelector('#tablaVentas tbody');
const gananciaTotalSpan = document.getElementById('gananciaTotal');
const capitalActualSpan = document.getElementById('capitalActual');
const configurarCapitalBtn = document.getElementById('configurarCapitalBtn');

// Formateador de moneda para Pesos Argentinos
const arsFormatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

// --- 2. Variables para almacenar los datos ---
let ventas = []; // Array para guardar todas las ventas
let capitalInicial = 0; // Variable para el capital inicial del negocio

// --- 3. Funciones de ayuda (para guardar y cargar datos) ---

// Guarda los datos de ventas y capital en el almacenamiento local del navegador
function guardarDatos() {
    localStorage.setItem('ventas', JSON.stringify(ventas));
    localStorage.setItem('capitalInicial', capitalInicial.toString());
}

// Carga los datos al iniciar la aplicación
function cargarDatos() {
    const ventasGuardadas = localStorage.getItem('ventas');
    const capitalGuardado = localStorage.getItem('capitalInicial');

    if (ventasGuardadas) {
        ventas = JSON.parse(ventasGuardadas);
    }
    if (capitalGuardado) {
        capitalInicial = parseFloat(capitalGuardado);
    }
    
    actualizarTablaYResumen(); // Actualiza la interfaz con los datos cargados
}

// --- 4. Funciones de cálculo y actualización de la interfaz ---

// Calcula la ganancia de una venta individual (20% del monto vendido)
function calcularGananciaVenta(monto) {
    return monto * 0.20;
}

// Calcula la ganancia total de todas las ventas
function calcularGananciaTotal() {
    return ventas.reduce((total, venta) => total + calcularGananciaVenta(venta.monto), 0);
}

// Calcula el capital actual (capital inicial + suma del capital retenido de cada venta)
function calcularCapitalActual() {
    // Suma la parte del 80% (capital retenido) de todas las ventas
    const totalCapitalRetenidoDeVentas = ventas.reduce((total, venta) => total + (venta.monto * 0.80), 0);
    return capitalInicial + totalCapitalRetenidoDeVentas;
}

// Actualiza la tabla de ventas y los resúmenes de ganancia y capital
function actualizarTablaYResumen() {
    // Limpiar la tabla antes de volver a llenarla
    tablaVentasBody.innerHTML = '';

    ventas.forEach((venta, index) => {
        const gananciaVenta = calcularGananciaVenta(venta.monto); // Ganancia es 20% del monto
        const capitalRetenido = venta.monto * 0.80; // Capital Retenido es 80% del monto
        
        const row = tablaVentasBody.insertRow(); // Insertar una nueva fila en la tabla

        row.innerHTML = `
            <td>${venta.fecha}</td>
            <td>${venta.descripcion}</td>
            <td>${arsFormatter.format(venta.monto)}</td>
            <td>${arsFormatter.format(gananciaVenta)}</td>
            <td>${arsFormatter.format(capitalRetenido)}</td>
            <td><button class="delete-btn" data-index="${index}">Eliminar</button></td>
        `;
    });

    // Actualizar los textos de ganancia total y capital actual
    gananciaTotalSpan.textContent = arsFormatter.format(calcularGananciaTotal());
    capitalActualSpan.textContent = arsFormatter.format(calcularCapitalActual());

    // Adjuntar eventos a los nuevos botones de eliminar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            eliminarVenta(index);
        });
    });
}

// Elimina una venta del array y actualiza todo
function eliminarVenta(index) {
    if (confirm('¿Estás seguro de que quieres eliminar esta venta?')) {
        ventas.splice(index, 1); // Elimina 1 elemento desde la posición 'index'
        guardarDatos();
        actualizarTablaYResumen();
    }
}

// --- 5. Event Listeners (lo que sucede cuando interactúas con la app) ---

// Cuando se hace clic en el botón "Agregar Venta"
agregarVentaBtn.addEventListener('click', () => {
    const fecha = fechaInput.value;
    const descripcion = descripcionInput.value.trim();
    const monto = parseFloat(montoVentaInput.value);

    // Validar que los campos numéricos sean válidos y positivos
    if (!fecha || isNaN(monto) || monto <= 0) {
        alert('Por favor, ingresa una fecha válida y un monto de venta numérico positivo.');
        return; // Detener la función si la validación falla
    }

    const nuevaVenta = {
        fecha: fecha,
        descripcion: descripcion,
        monto: monto // Este es el monto total vendido
    };

    ventas.push(nuevaVenta); // Agrega la nueva venta al array
    guardarDatos(); // Guarda los datos actualizados
    actualizarTablaYResumen(); // Actualiza la interfaz

    // Limpiar los campos del formulario para la siguiente entrada
    descripcionInput.value = '';
    montoVentaInput.value = '';
    // La fecha se mantiene en la actual por el script en HTML
});

// Cuando se hace clic en el botón "Configurar Capital Inicial"
configurarCapitalBtn.addEventListener('click', () => {
    const nuevoCapitalStr = prompt('Ingresa tu capital inicial actual:');
    if (nuevoCapitalStr === null || nuevoCapitalStr.trim() === '') {
        return; // Si el usuario cancela o no ingresa nada
    }

    const nuevoCapital = parseFloat(nuevoCapitalStr);

    if (isNaN(nuevoCapital) || nuevoCapital < 0) {
        alert('Por favor, ingresa un valor numérico positivo para el capital.');
        return;
    }

    capitalInicial = nuevoCapital;
    guardarDatos(); // Guarda el nuevo capital
    actualizarTablaYResumen(); // Actualiza la interfaz
});

// --- 6. Cargar datos al iniciar la aplicación ---
document.addEventListener('DOMContentLoaded', cargarDatos);