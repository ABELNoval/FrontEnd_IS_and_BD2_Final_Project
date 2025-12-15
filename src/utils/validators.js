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

export function hasMinLength(value, min) {
  return value?.length >= min;
}

export function isNumber(value) {
  return !isNaN(value);
}

export const validateRequired = (value) => {
  if (value === null || value === undefined) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  return true;
};

