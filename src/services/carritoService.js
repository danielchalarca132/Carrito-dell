import { inventario } from '../data/inventario.js';
import colors from 'colors'; 

let carrito = [];

export function agregarAlCarrito(idProducto, cantidad) {
    try {
        const producto = inventario.find(p => p.id === idProducto);

        if (!producto) {
            throw new Error(`Producto con ID ${idProducto} no encontrado.`);
        }

        if (producto.stock < cantidad) {
            throw new Error(`No hay suficiente stock para el producto ${producto.nombre}. Stock disponible: ${producto.stock}`);
        }

        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        })

        console.log(`Agregado: ${cantidad} x ${producto.nombre} al carrito`.green);
    } catch (error) {
        console.error(`Error al agregar: ${error.message}`.red);
    }
}

export function eliminarDelCarrito(idProducto) {
    const longitudInicial = carrito.length;

    carrito = carrito.filter(item => item.id !== idProducto);

    if (carrito.length < longitudInicial) {
        console.log(`Producto con ID ${idProducto} eliminado del carrito.`.yellow);
    } else {
        console.log(`Producto con ID ${idProducto} no encontrado en el carrito.`.red);
    }
}

export function calcularTotal() {
    return carrito.reduce((acumulador, item) => acumulador + (item.precio * item.cantidad), 0);
}

export function filtrarProductos(criterio) {
    const busqueda = criterio.toLowerCase();

    return inventario.filter(p =>
        p.nombre.toLowerCase().includes(busqueda) ||
        p.categoria.toLowerCase().includes(busqueda)
    );       
}

export function obtenerCarrito() {
    return carrito;
}
