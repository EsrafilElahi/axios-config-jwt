import axios from "axios";
import Cookies from 'js-cookie';
import { useRouter } from "next/router";

const axiosInstance = axios.create({
  baseURL:
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_BACKEND_BASE_URL,
});

// request config jwt
axiosInstance.interceptors.request.use((config) => {
  const accessToken = Cookies.get('accessToken');
  const refreshToken = Cookies.get('refreshToken');

  console.log("acc in req :", accessToken)
  console.log("ref in req :", refreshToken)

  console.log("axiosInstance in req :", axiosInstance.defaults);

  const excludeAuthorizationUrls = [
    "/api/auth/email/",
    "/api/auth/confirm/",
  ]

  const excludeUrl = excludeAuthorizationUrls.some(url => config.url.includes(url))

  if (accessToken && !excludeUrl) {
    config.headers.Authorization = `Bearer ${accessToken}`;
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; 
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// response config jwt
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },

  async (error) => {

    const refreshToken = Cookies.get('refreshToken');
    const router = useRouter();

    if (!refreshToken) {
      console.log('no refresh')
      router.push("/auth/login")
    }

    if (error.response.status === 401) {

      const response = await axiosInstance.post('/api/auth/refresh/', { refresh: refreshToken });

      const { access_tok, access_tok_exp } = response.data;
      const access_expiration = new Date(access_tok_exp);

      error.config.headers.Authorization = `Bearer ${access_tok}`;

      // save access token in cookie
      Cookies.set('accessToken', access_tok, {
        expires: access_expiration,
        secure: process.env.NODE_ENV === 'production', // Ensure secure in production
        sameSite: 'lax',
        // path: '/',
        // domain: esrafil.com
      });
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${access_tok}`; 
      return axiosInstance(error.config);
    } else {
      // handle other error code or refresh-token expires
      console.log('other error-code or no-refresh')
      router.push("/auth/login")
    }
  }
);

export default axiosInstance;
