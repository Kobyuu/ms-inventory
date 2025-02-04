import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import axiosClient from '../config/axiosClient';

describe('axios-retry', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(axiosClient);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should retry the request on network error', async () => {
    mock.onGet('/test').networkError();

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.message).toBe('Network Error');
        expect(mock.history.get.length).toBeGreaterThan(1); // Ensure retries happened
      } else {
        throw error;
      }
    }
  });

  it('should retry the request on 5xx error', async () => {
    mock.onGet('/test').reply(500);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.message).toBe('Request failed with status code 500');
        expect(mock.history.get.length).toBeGreaterThan(1); // Ensure retries happened
      } else {
        throw error;
      }
    }
  });

  it('should not retry the request on 4xx error', async () => {
    mock.onGet('/test').reply(400);

    try {
      await axiosClient.get('/test');
    } catch (error) {
      if (axios.isAxiosError(error)) {
        expect(error.message).toBe('Request failed with status code 400');
        expect(mock.history.get.length).toBe(1); // Ensure no retries happened
      } else {
        throw error;
      }
    }
  });
});