import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuración inicial de URL y headers
const BASE_URL = 'http://ms-inventory_app:4002/api/inventory';

// Headers para las peticiones HTTP 
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Parámetros de configuración para las peticiones
const params = {
  headers: headers,
  timeout: 10000  // 10s timeout
};

// Opciones de configuración del test de carga
export const options = {
  setupTimeout: '30s',
  scenarios: {
    inventory: {
      executor: 'constant-arrival-rate',
      rate: 30,              
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 60,    
      maxVUs: 100,          
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

// Función de inicialización: verifica productos y crea stock inicial
export function setup() {
  console.log('Setting up initial stock data...');
  
  // Verificar si los productos existen en el catálogo
  for (let i = 1; i <= 3; i++) {
    const checkProduct = http.get(`http://ms-catalog_app:4001/api/product/${i}`, params);
    if (checkProduct.status !== 200) {
      console.error(`Product ${i} not found in catalog service. Please ensure products exist.`);
      return;
    }
  }
  
  const initialStocks = [
    { productId: 1, quantity: 100, input_output: 1 },
    { productId: 2, quantity: 100, input_output: 1 },
    { productId: 3, quantity: 100, input_output: 1 }
  ];

  // Inicializar stock para los productos
  initialStocks.forEach(stock => {
    const response = http.post(
      `${BASE_URL}/`,
      JSON.stringify(stock),
      params
    );
    
    if (response.status !== 201) {
      console.error(`Failed to initialize stock for product ${stock.productId}:`, response.body);
    }
  });

  // Dar tiempo para que los stocks se creen
  sleep(2);
}

// Función auxiliar para reintentar peticiones fallidas
const retryRequest = (request, maxRetries = 3) => {
  let retries = 0;
  while (retries < maxRetries) {
    const response = request();
    if (response.status < 500) {
      return response;
    }
    retries++;
    sleep(1);
  }
  return request();
};

// Función principal del test: ejecuta operaciones CRUD en el inventario
export default function () {
  const productId = Math.floor(Math.random() * 3) + 1;
  const quantity = Math.floor(Math.random() * 10) + 1;

  // GET: obtener todos los stocks
  const getAllStocks = retryRequest(() => 
    http.get(`${BASE_URL}/`, params)
  );
  check(getAllStocks, {
    'GET all stocks status is 200': (r) => r.status === 200,
    'GET all stocks returns array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.data || body);
      } catch (e) {
        console.error('Parse error:', e);
        return false;
      }
    },
  });

  sleep(Math.random() * 2 + 1); // Random sleep entre 1-3 segundos

  // GET: obtener stock por ID
  const getStock = retryRequest(() => http.get(`${BASE_URL}/${productId}`, params));
  check(getStock, {
    'GET stock by id status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  sleep(Math.random() * 2 + 1); // Random sleep entre 1-3 segundos

  // POST: agregar stock
  const addStockPayload = JSON.stringify({
    productId: productId,
    quantity: quantity,
    input_output: 1 // INPUT
  });

  const addStock = retryRequest(() => http.post(
    `${BASE_URL}/`, 
    addStockPayload,
    params
  ));

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

  check(addStock, {
    'POST add stock success': (r) => {
      if (r.status !== 201) {
        console.error('Add stock failed:', r.body);
        return false;
      }
      return true;
    }
  });

  sleep(Math.random() * 2 + 1); // Random sleep entre 1-3 segundos

  // PUT: actualizar stock
  const updateStockPayload = JSON.stringify({
    productId: productId,
    quantity: Math.min(quantity, 5), // Usar cantidad menor para evitar error de stock insuficiente
    input_output: 2 // OUTPUT
  });

  const updateStock = retryRequest(() => http.put(
    `${BASE_URL}/update`,
    updateStockPayload,
    params
  ));

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

  check(updateStock, {
    'PUT update stock success': (r) => {
      if (r.status !== 200) {
        console.error('Update stock failed:', r.body);
        return false;
      }
      return true;
    }
  });

  sleep(Math.random() * 2 + 1); // Random sleep entre 1-3 segundos
}
