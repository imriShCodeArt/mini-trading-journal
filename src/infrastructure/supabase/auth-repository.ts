import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthRepository, AuthUser } from "@/application/ports/auth-repository";

export function createSupabaseAuthRepository(
  supabase: SupabaseClient
): AuthRepository {
  return {
    async getCurrentUser(): Promise<AuthUser | null> {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      return {
        id: user.id,
        email: user.email ?? null,
      };
    },

    async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return { error: error ? new Error(error.message) : null };
    },

    async signInWithPassword(
      email: string,
      password: string
    ): Promise<{ error: Error | null }> {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? new Error(error.message) : null };
    },

    async signUp(
      email: string,
      password: string
    ): Promise<{ error: Error | null }> {
      const { error } = await supabase.auth.signUp({ email, password });
      return { error: error ? new Error(error.message) : null };
    },

    async signOut(): Promise<void> {
      await supabase.auth.signOut();
    },
  };
}
