import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '4m', target: 100000 },   
    { duration: '5m', target: 500000 },  
    { duration: '7m', target: 1000000 },  
    { duration: '12m', target: 1000000 }, 
    { duration: '5m', target: 500000 },   
    { duration: '4m', target: 100000 },  
    { duration: '3m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  let res = http.get('http://localhost:3001/api');
  check(res, { 'status was 200': (r) => r.status === 200 });
  sleep(1);
}
