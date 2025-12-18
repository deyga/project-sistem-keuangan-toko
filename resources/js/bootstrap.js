import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
 window.axios.defaults.withCredentials = true;
// window.axios.defaults.baseURL = 'http://localhost:8000';

// AMBIL CSRF TOKEN DARI META
const token = document
  .querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found');
}
