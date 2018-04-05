import instanceAxios from './axios';
import Cookies from 'js-cookie';


function login(username, password) {
  instanceAxios.post('api/login', { username, password })
    .then((response) => {
      const { accessToken, accessToken_exp, refreshToken, refreshToken_exp } = response.data;

      const access_expiration = new Date(accessToken_exp);
      const refresh_expiration = new Date(refreshToken_exp);

      // Set the access token and refresh token as cookies
      Cookies.set('accessToken', accessToken, { 
        expires: access_expiration,
        secure: process.env.NODE_ENV === 'production', // Ensure secure in production
        // path: '/',
        // domain: esrafil.com
      });

      Cookies.set('refreshToken', refreshToken, {
        expires: access_expiration,
        secure: process.env.NODE_ENV === 'production', // Ensure secure in production
        // path: '/',
        // domain: 'esrafil.com'
      });

    })
    .catch((error) => {
      // Handle login error
      console.log('Login error:', error);
    });
}
