import { onAuthChange, isAuthenticated } from './auth.js';

export function protectPage() {
  onAuthChange((user) => {
    if (!user) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login.html')) {
        window.location.href = 'login.html';
      }
    }
  });
}

export function redirectIfLoggedIn() {
  onAuthChange((user) => {
    if (user) {
      window.location.href = 'index.html';
    }
  });
}

export function checkAuth() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}