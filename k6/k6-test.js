import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '30s', target: 0 }
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500']
  }
};

const BASE_URL = 'http://ms-inventory_app:4002/api/inventory';
const SAMPLE_PRODUCT_ID = 1;

export default function() {
  const params = {
    headers: { 'Content-Type': 'application/json' }
  };

  // Test GET all stocks
  const getAllStocks = http.get(`${BASE_URL}/`, params);
  check(getAllStocks, {
    'get all stocks status is 200': (r) => r.status === 200,
    'get all stocks returns array': (r) => Array.isArray(JSON.parse(r.body).data),
  });

  sleep(1);

  // Test POST new stock
  const addStock = http.post(
    `${BASE_URL}/`,
    JSON.stringify({
      productId: SAMPLE_PRODUCT_ID,
      quantity: Math.floor(Math.random() * 10) + 1,
      input_output: 1
    }),
    params
  );

  check(addStock, {
    'add stock status is 201': (r) => r.status === 201
  });

  sleep(1);
}