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

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;
