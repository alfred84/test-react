export interface LoginRequestDto {
  readonly username: string;
  readonly password: string;
}

export interface LoginResponseDto {
  readonly token: string;
  readonly expiration: string;
  readonly userid: string;
  readonly username: string;
}

export interface RegisterRequestDto {
  readonly username: string;
  readonly email: string;
  readonly password: string;
}

export interface RegisterResponseDto {
  readonly status: string;
  readonly message: string;
}
