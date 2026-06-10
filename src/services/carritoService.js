import { inventario } from '../data/inventario.js';
import colors from 'colors'; 

let carrito = [];

export function agregarAlCarrito(idProducto, cantidad) {
    try {
        const producto = inventario.find(p => p.id === idProducto);

        if (!producto) {
            throw new Error(`Producto con ID ${idProducto} no encontrado.`);
        }

        if (producto.stock <= 0) {
            throw new Error(`Lo sentimos, el producto ${producto.nombre} se encuentra agotado.`);
        }
        const productoExistente = carrito.find(item => item.id === idProducto);

        if (productoExistente) {
            // 2.EL CANDADO: Si lo que ya hay en el carrito + el nuevo clic supera el stock real, frena el código
            if (productoExistente.cantidad + cantidad > producto.stock) {
                throw new Error(`No hay suficiente stock para el producto ${producto.nombre}. Stock disponible: ${producto.stock}`);
            }
            productoExistente.cantidad += cantidad;
        } else {
            // Primera unidad: validamos que no pida más de lo que hay
            if (cantidad > producto.stock) {
                throw new Error(`No puedes agregar ${cantidad} uds. Solo hay ${producto.stock} disponibles.`);
            }
                carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: cantidad
            })
        }
        console.log(`Agregado: ${cantidad} x ${producto.nombre} al carrito`.green);
    } catch (error) {
        console.error(`Error al agregar: ${error.message}`.red);
    }
}

export function eliminarDelCarrito(idProducto) {
    const itemEnCarrito = carrito.find(item => item.id === idProducto);
    if (itemEnCarrito) {
        
        if(itemEnCarrito.cantidad > 1) {
            itemEnCarrito.cantidad -= 1;
            console.log(`Restada 1 unidad de ${itemEnCarrito.nombre}. Cantidad actual: ${itemEnCarrito.cantidad}`.yellow);
        } else {
            carrito = carrito.filter(item => item.id !== idProducto);
            console.log(`Producto ${itemEnCarrito.nombre} eliminado del carrito.`.yellow);
        }
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
