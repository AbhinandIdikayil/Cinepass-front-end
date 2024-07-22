import { useCallback } from 'react';
import { IInitialStateError, Role } from '../interface/Interface';
import { clearAdminError, setAdminAuthentication, setAdminError, setAdminLoading } from '../redux/reducers/adminReducer';
import { clearUserError, setUserAuthentication, setUserError, setUserLoading } from '../redux/reducers/userReducer';
import { clearTheaterError, setTheaterError, setTheaterLoading, setTheatersAuthentication } from '../redux/reducers/theatersReducer';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../redux/store';

interface Action {
  clearError: () => void;
  setLoading: () => void;
  setError: (error: IInitialStateError) => void;
  setIsAuthenticated: () => void;
}


const useAction = (role: Role): Action => {
  const dispatch = useDispatch<AppDispatch>();

  const getActions = useCallback(():Action => {
    switch (role) {
      case Role.admin:
        return {
          clearError: () => dispatch(clearAdminError()),
          setLoading: () => dispatch(setAdminLoading()),
          setError: (error: IInitialStateError) => dispatch(setAdminError(error)),
          setIsAuthenticated: () => dispatch(setAdminAuthentication()),
        };
      case Role.users:
        return {
          clearError: () => dispatch(clearUserError()),
          setLoading: () => dispatch(setUserLoading()),
          setError: (error: IInitialStateError) => dispatch(setUserError(error)),
          setIsAuthenticated: () => dispatch(setUserAuthentication()),
        };
      case Role.theaters:
        return {
          clearError: () => dispatch(clearTheaterError()),
          setLoading: () => dispatch(setTheaterLoading()),
          setError: (error: IInitialStateError) => dispatch(setTheaterError(error)),
          setIsAuthenticated: () => dispatch(setTheatersAuthentication()),
        };
      default:
        return {
          clearError: () => void 0,
          setLoading: () => void 0,
          setError: () => void 0,
          setIsAuthenticated: () => void 0,
        };
    }
  }, [dispatch, role]);

  return getActions();
};

export default useAction;