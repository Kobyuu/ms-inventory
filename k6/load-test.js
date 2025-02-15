import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    purchases: {
      executor: 'constant-arrival-rate',
      rate: 30,               // 30 iteraciones por segundo (cada iteración hace 2 requests → 60 requests/s)
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 60,    // Se asignan 60 VUs para cubrir la carga
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],  // 95% de los requests en menos de 1s
    http_req_failed: ['rate<0.01'],       // Menos del 1% de errores
  },
};

const BASE_URL = 'http://ms-purchase_app:4002/api/inventory';

export default function () {
  // Generamos un identificador único usando el ID del VU y la iteración
  const uniqueId = `${__VU}-${__ITER}`;
  
  // Payload con datos únicos para evitar duplicados
  const productId = Math.floor(Math.random() * 3) + 1; // Genera un número aleatorio entre 1 y 3
  const payload = JSON.stringify({
    product_id: productId,
    mailing_address: `Test Address ${uniqueId}`
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };

  // POST: creación de compra
  const resPost = http.post(BASE_URL, payload, params);
  check(resPost, {
    'POST status is 201': (r) => r.status === 201,
    'POST has valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  // GET: consulta de compras
  const resGet = http.get(BASE_URL, params);
  check(resGet, {
    'GET status is 200': (r) => r.status === 200,
    'GET has valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });
}
