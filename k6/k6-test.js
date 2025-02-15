// k6-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const getStocksLatency = new Trend('get_stocks_latency');
const addStockLatency = new Trend('add_stock_latency');
const updateStockLatency = new Trend('update_stock_latency');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 },  // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 },   // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    'errors': ['rate<0.1'],          // Error rate should be less than 10%
    'http_req_duration': ['p(95)<1000'], // 95% of requests should be below 1s
    'get_stocks_latency': ['p(95)<500'], // 95% of GET requests should be below 500ms
    'add_stock_latency': ['p(95)<800'],  // 95% of POST requests should be below 800ms
    'update_stock_latency': ['p(95)<800'] // 95% of PUT requests should be below 800ms
  }
};

const BASE_URL = 'http://ms-inventory_app:5002/api/inventory'; 
const SAMPLE_PRODUCT_ID = 1;

// Helper function to generate random quantity
function getRandomQuantity() {
  return Math.floor(Math.random() * 10) + 1;
}

export default function() {
  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Test group for GET all stocks
  const getAllStocksStart = new Date();
  const getAllStocks = http.get(`${BASE_URL}/`, params);
  getStocksLatency.add(new Date() - getAllStocksStart);

  check(getAllStocks, {
    'get all stocks status is 200': (r) => r.status === 200,
    'get all stocks returns array': (r) => Array.isArray(JSON.parse(r.body).data),
  }) || errorRate.add(1);

  sleep(1);

  // Test group for GET stock by product ID
  const getStockStart = new Date();
  const getStock = http.get(`${BASE_URL}/${SAMPLE_PRODUCT_ID}`, params);
  getStocksLatency.add(new Date() - getStockStart);

  check(getStock, {
    'get stock by id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  }) || errorRate.add(1);

  sleep(1);

  // Test group for POST new stock
  const addStockPayload = JSON.stringify({
    productId: SAMPLE_PRODUCT_ID,
    quantity: getRandomQuantity(),
    input_output: 1 // INPUT
  });

  const addStockStart = new Date();
  const addStock = http.post(
    `${BASE_URL}/`, 
    addStockPayload,
    params
  );
  addStockLatency.add(new Date() - addStockStart);

  check(addStock, {
    'add stock status is 201': (r) => r.status === 201,
    'add stock returns data': (r) => JSON.parse(r.body).data !== undefined,
  }) || errorRate.add(1);

  sleep(1);

  // Test group for PUT update stock
  const updateStockPayload = JSON.stringify({
    productId: SAMPLE_PRODUCT_ID,
    quantity: getRandomQuantity(),
    input_output: 2 // OUTPUT
  });

  const updateStockStart = new Date();
  const updateStock = http.put(
    `${BASE_URL}/update`,
    updateStockPayload,
    params
  );
  updateStockLatency.add(new Date() - updateStockStart);

  check(updateStock, {
    'update stock status is 200': (r) => r.status === 200,
    'update stock returns data': (r) => JSON.parse(r.body).data !== undefined,
  }) || errorRate.add(1);

  sleep(1);
}

// Optional teardown function
export function teardown(data) {
  console.log('Test finished');
}