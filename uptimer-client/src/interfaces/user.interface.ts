import { RegisterType } from '@/app/(auth)/validations/auth';
import { Dispatch, SetStateAction } from 'react';

export interface IUserAuth {
  loading: boolean;
  validationErrors?: RegisterType;
  setValidationErrors?: Dispatch<SetStateAction<RegisterType>>;
  onRegisterSubmit?: (formData: FormData) => void;
  onLoginSubmit?: (formData: FormData) => void;
  authWithGoggle?: (formData: FormData) => Promise<void>;
  authWithFacebook?: (formData: FormData) => Promise<void>;
}
