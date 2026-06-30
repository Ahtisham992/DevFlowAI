import http from 'k6/http';
import { check, sleep } from 'k6';

// The options dictate how the load test ramps up and down
export const options = {
  stages: [
    { duration: '15s', target: 50 }, // Ramp up to 50 virtual users over 15 seconds
    { duration: '30s', target: 50 }, // Hold at 50 virtual users for 30 seconds
    { duration: '15s', target: 0 },  // Ramp down to 0 virtual users
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Less than 1% of requests should fail
    http_req_failed: ['rate<0.01'],
  },
};

// We will hit the live Render backend
const BASE_URL = __ENV.API_URL || 'https://devflow-api-comy.onrender.com';

export default function () {
  // 1. Health check (simple fast endpoint)
  const healthRes = http.get(`${BASE_URL}/`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Simulate a login attempt (stresses the database)
  const payload = JSON.stringify({
    email: 'loadtest@example.com',
    password: 'Password123!',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const authRes = http.post(`${BASE_URL}/auth/login`, payload, params);
  
  // Note: We expect 401 Unauthorized if the user doesn't exist, which is a successful API response
  // We just want to ensure it doesn't return 500 or timeout. 429 is perfectly fine (rate limited).
  check(authRes, {
    'login responded quickly': (r) => r.status === 401 || r.status === 201 || r.status === 200 || r.status === 429,
  });

  // Wait 1 second before the next iteration
  sleep(1);
}
