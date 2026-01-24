export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  dateOfBirth?: string;
  workplace?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IAuthResponse {
  token: string;
  user: IUser;
}
