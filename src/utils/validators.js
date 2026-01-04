// src/utils/validators.js

export function isEmpty(value) {
  return !value || !value.trim();
}

export function isValidEmail(value) {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value);
}

export function isValidPassword(value) {
  return (value.length >= 8);
}


