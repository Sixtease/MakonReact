const USERNAME_KEY = 'username';

export const get_username = () => localStorage.getItem(USERNAME_KEY) || '';

export const set_username = value => {
  localStorage.setItem(USERNAME_KEY, value || '');
};
