import { signUp, signIn, signOut, confirmSignUp, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import type { User, LoginCredentials, SignupCredentials } from '../types';

export class AuthService {
  static async signUp(credentials: SignupCredentials): Promise<{ success: boolean; needsConfirmation?: boolean; error?: string }> {
    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: credentials.email,
        password: credentials.password,
        options: {
          userAttributes: {
            email: credentials.email,
            phone_number: credentials.phone || undefined,
          },
        },
      });

      return {
        success: true,
        needsConfirmation: !isSignUpComplete,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Signup failed',
      };
    }
  }

  static async confirmSignUp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: code,
      });

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Verification failed',
      };
    }
  }

  static async signIn(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.email,
        password: credentials.password,
      });

      if (isSignedIn) {
        const user = await this.getCurrentUser();
        return { success: true, user };
      } else {
        return {
          success: false,
          error: 'Additional steps required',
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Login failed',
      };
    }
  }

  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      await signOut();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Logout failed',
      };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const user = await getCurrentUser();
      return {
        id: user.userId,
        email: user.signInDetails?.loginId || '',
        name: user.signInDetails?.loginId || 'User',
        phone: '',
        isVerified: true,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  static async getAuthSession(): Promise<{ accessToken?: string; idToken?: string }> {
    try {
      const session = await fetchAuthSession();
      return {
        accessToken: session.tokens?.accessToken?.toString(),
        idToken: session.tokens?.idToken?.toString(),
      };
    } catch (error) {
      return {};
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    try {
      const user = await getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
}