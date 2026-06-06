import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { setUser, setLoading, setError, logout as logoutAction } from '../store/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.login(email, password);
      // Transform response data to match the User interface structure
      const formattedUser = {
        ...res.data,
        token: res.token,
      };
      dispatch(setUser(formattedUser));
      return formattedUser;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || 'Login failed';
      dispatch(setError(errMsg));
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role?: string) => {
    dispatch(setLoading(true));
    try {
      const res = await authService.register({ name, email, password, role });
      const formattedUser = {
        ...res.data,
        token: res.token,
      };
      dispatch(setUser(formattedUser));
      return formattedUser;
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errMsg = axiosError.response?.data?.message || 'Registration failed';
      dispatch(setError(errMsg));
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout API request failed', err);
    }
    dispatch(logoutAction());
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
};

export default useAuth;
