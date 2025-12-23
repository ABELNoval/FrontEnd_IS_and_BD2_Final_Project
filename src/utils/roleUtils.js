/**
 * Get the appropriate dashboard path for a user's role
 * @param {string} role 
 * @returns {string}
 */
export function getRoleRedirectPath(role) {
  switch (role) {
    case 'Administrator':
      return '/admin';
    case 'Director':
      return '/director';
    case 'Technical':
      return '/technical';
    case 'Responsible':
      return '/responsible';
    case 'Employee':
      return '/employee';
    case 'Receptor':
      return '/receptor';
    default:
      return '/';
  }
}
