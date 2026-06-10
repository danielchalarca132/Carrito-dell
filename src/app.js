import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 🔴 CONEXIÓN DE TUS SERVICIOS: Importamos tus funciones reales
import { 
  agregarAlCarrito, 
  eliminarDelCarrito, 
  calcularTotal, 
  filtrarProductos, 
  obtenerCarrito 
} from './services/carritoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png'
};

const server = http.createServer((req, res) => {
  const url = req.url;

  // 1. ENDPOINT:
  if (url === '/api/inventario' && req.method === 'GET') {
    import('./data/inventario.js').then(({ inventario }) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(inventario));
    });
    return;
  }

  // 2. ENDPOINT:
  if (url === '/api/carrito' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      items: obtenerCarrito(),
      total: calcularTotal() // Usa tu función calcularTotal con .reduce()
    }));
    return;
  }

  // 3. ENDPOINT: 
  if (url.startsWith('/api/carrito/agregar') && req.method === 'POST') {
    let body = '';
    
    // Recibe los fragmentos de datos que envía el navegador
    req.on('data', chunk => { 
      body += chunk; 
    });
    
    // Una vez se termina de recibir el paquete de red completo, procesamos la lógica
    req.on('end', () => {
      try {
        const parsedBody = JSON.parse(body);
        const idProducto = parsedBody.idProducto;
        
        // Ejecuta TU función real de carritoService.js
        agregarAlCarrito(Number(idProducto), 1); 
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
          success: true, 
          items: obtenerCarrito(), 
          total: calcularTotal()
        }));
      } catch (error) {
        // Si el control de existencias arroja una excepción, responde con código 400
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message || 'Error al procesar el inventario' 
        }));
      }
    });
    return;
  }

  // 4. ENDPOINT:
  if (url.startsWith('/api/carrito/eliminar') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const { idProducto } = JSON.parse(body);
      
      // Ejecuta TU función real de carritoService.js
      eliminarDelCarrito(Number(idProducto)); 
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, items: obtenerCarrito(), total: calcularTotal() }));
    });
    return;
  }

  // SERVIDOR DE ARCHIVOS ESTÁTICOS (HTML, CSS, JS del Front)
  const requestUrl = req.url === '/' ? '/index.html' : req.url;
  const filePath = path.join(publicDir, requestUrl);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Página no encontrada');
      return;
    }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(content);
  });
});

server.listen(port, () => {
  console.log(`Servidor web iniciado en http://localhost:${port}`);
});