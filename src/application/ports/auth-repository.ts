export interface AuthUser {
  id: string;
  email?: string | null;
}

export interface AuthRepository {
  getCurrentUser(): Promise<AuthUser | null>;
  signInWithMagicLink(email: string): Promise<{ error: Error | null }>;
  signInWithPassword(
    email: string,
    password: string
  ): Promise<{ error: Error | null }>;
  signUp(
    email: string,
    password: string
  ): Promise<{ error: Error | null }>;
  signOut(): Promise<void>;
}
