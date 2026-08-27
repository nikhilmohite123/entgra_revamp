// Mock authentication service
export const authService = {
  login: async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (username && password) {
          resolve({
            success: true,
            user: { username, role: 'Administrator', token: 'mock-jwt-token' }
          });
        } else {
          reject(new Error('Username and password are required.'));
        }
      }, 500);
    });
  },
  
  logout: () => {
    localStorage.removeItem('auth_user');
  }
};
