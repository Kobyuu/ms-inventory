import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { fetchDataWithCircuitBreaker } from '../middleware/circuitBreaker';

describe('Circuit Breaker', () => {
  let mockAxios: MockAdapter;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
  });

  afterEach(() => {
    mockAxios.reset();
    mockAxios.restore();
  });

  it('should successfully fetch data when service is available', async () => {
    const testData = { message: 'Success' };
    const testUrl = 'http://test-api.com/data';
    
    mockAxios.onGet(testUrl).reply(200, testData);

    const result = await fetchDataWithCircuitBreaker(testUrl);
    expect(result).toEqual(testData);
  });

  it('should throw error when service is unavailable', async () => {
    const testUrl = 'http://test-api.com/data';
    mockAxios.onGet(testUrl).networkError();

    await expect(fetchDataWithCircuitBreaker(testUrl))
      .rejects
      .toThrow();
  });

  it('should handle timeout errors', async () => {
    const testUrl = 'http://test-api.com/data';
    mockAxios.onGet(testUrl).timeout();

    await expect(fetchDataWithCircuitBreaker(testUrl))
      .rejects
      .toThrow();
  });
});