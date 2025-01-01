import { IUserAuth } from '@/interfaces/user.interface';

export const useRegister = (): IUserAuth => {
  const onRegisterSubmit = (formData: FormData): void => {};

  return {
    loading: false,
    onRegisterSubmit,
  };
};
