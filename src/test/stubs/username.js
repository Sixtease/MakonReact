export function get_username() {
  return localStorage.getItem('username') || '';
}

export function set_username(value) {
  localStorage.setItem('username', value || '');
}
