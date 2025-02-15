import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    inventory: {
      executor: 'constant-arrival-rate',
      rate: 30,               // 30 iteraciones por segundo
      timeUnit: '1s',
      duration: '30s',        // Duración aumentada a 30s para mejor análisis
      preAllocatedVUs: 60,    // VUs pre-asignados
      maxVUs: 100,           // Máximo de VUs
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% de requests bajo 1s
    http_req_failed: ['rate<0.01'],     // Menos del 1% de errores
  },
};

const BASE_URL = 'http://ms-inventory_app:4002/api/inventory';

export default function () {
  const productId = Math.floor(Math.random() * 3) + 1; // IDs del 1 al 3
  const quantity = Math.floor(Math.random() * 10) + 1; // Cantidad entre 1 y 10

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // GET: obtener todos los stocks
  const getAllStocks = http.get(`${BASE_URL}/`, params);
  check(getAllStocks, {
    'GET all stocks status is 200': (r) => r.status === 200,
    'GET all stocks returns array': (r) => Array.isArray(JSON.parse(r.body).data),
  });

  sleep(1);

  // GET: obtener stock por ID
  const getStock = http.get(`${BASE_URL}/${productId}`, params);
  check(getStock, {
    'GET stock by id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(1);

  // POST: agregar stock
  const addStockPayload = JSON.stringify({
    productId: productId,
    quantity: quantity,
    input_output: 1 // INPUT
  });

  const addStock = http.post(
    `${BASE_URL}/`, 
    addStockPayload,
    params
  );

  check(addStock, {
    'POST add stock status is 201': (r) => r.status === 201,
    'POST add stock has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.message === 'Stock agregado exitosamente';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);

  // PUT: actualizar stock
  const updateStockPayload = JSON.stringify({
    productId: productId,
    quantity: Math.min(quantity, 5), // Usar cantidad menor para evitar error de stock insuficiente
    input_output: 2 // OUTPUT
  });

  const updateStock = http.put(
    `${BASE_URL}/update`,
    updateStockPayload,
    params
  );

  check(updateStock, {
    'PUT update stock status is 200': (r) => r.status === 200,
    'PUT update stock has valid response': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.message === 'Stock actualizado exitosamente';
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}
