import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración del test de estrés (Simulación de tráfico para probar escalabilidad)
export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Rampa de subida: hasta 20 usuarios virtuales en 30 segundos
    { duration: '1m', target: 50 },  // Carga máxima: mantiene 50 usuarios concurrentes durante 1 minuto
    { duration: '30s', target: 0 },  // Rampa de bajada: reduce a 0 usuarios en 30 segundos
  ],
  thresholds: {
    // Requisitos de rendimiento (SLAs) para aprobar la auditoría del proyecto
    http_req_duration: ['p(95)<500'], // El 95% de las peticiones deben responder en menos de 500ms
    http_req_failed: ['rate<0.01'],    // La tasa de errores debe ser menor al 1%
  },
};

// Escenario principal de prueba simulando el comportamiento de un cliente en la tienda
export default function () {
  const BASE_URL = 'http://localhost:3000';

  // 1. Simular al cliente accediendo al catálogo de productos
  const resCatalog = http.get(`${BASE_URL}/products?limit=10&page=1`);
  
  check(resCatalog, {
    'Catálogo responde con status 200': (r) => r.status === 200,
    'Tiempo de respuesta menor a 500ms': (r) => r.timings.duration < 500,
  });

  // Pausa simulando al usuario leyendo los productos antes de hacer otra acción
  sleep(1);
}
