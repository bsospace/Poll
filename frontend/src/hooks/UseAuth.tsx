/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react'
import { axiosInstance } from '@/lib/Utils'
import { API_ENDPOINTS } from '@/lib/Constants'
import { config } from '@/config/Config'
import { IUser } from '@/interfaces/interfaces'
import { toast } from 'sonner';

interface User extends IUser {
  isGuest: boolean
}

interface AuthContextProps {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  loginGuest: (key: string, redirect?: string) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  oauthLogin: (provider: 'discord' | 'github' | 'google') => Promise<void>
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const loginGuest = async (key: string, redirect?: string) => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.post(
        `${config.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`,
        { key }
      )

      const data = response.data.data as {
        id: string
        firstName: string
        lastName: string
        email: string
        avatar: string
        guest: boolean,
      }

      const credentials = response.data.credentials as {
        accessToken: string
      }

      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatar: data.avatar,
        createdAt: new Date(),
        updatedAt: new Date(),
        isGuest: data.guest
      })

      setIsAuthenticated(true)
      setAccessToken(credentials.accessToken)
      localStorage.setItem('accessToken', credentials.accessToken)
      
      // Get the stored redirect path or use the provided redirect
      const redirectPath = localStorage.getItem('redirectPath') ?? redirect ?? '/';
      // Clear the stored redirect path
      localStorage.removeItem('redirectPath');
      
      window.location.href = redirectPath;

    } catch (error: unknown) {
      console.error("Error:", error);
    
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response: { data?: { message?: string; error?: string } } };
    
        const errorMessage = err.response?.data?.message ?? "An unexpected error occurred.";
        const errorDescription = err.response?.data?.error ?? "";
    
        toast.error(errorMessage, {description: errorDescription});
  
      } else {
        toast.error("An unexpected error occurred.");
      }    
    } finally {
      setIsLoading(false)
    }
  }

  const oauthLogin = async (provider: 'discord' | 'github' | 'google') => {
    const service = 'vote'
    
    window.location.href = `${config.apiOpenIdConnectUrl}/auth/${provider}?service=${service}&redirect=${config.appUrlCallback}`
  }

  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      sessionStorage.setItem('isLogout', 'true');
      window.location.reload();
    } finally {
      setIsLoading(false);
    }
  }

  const getProfile = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get(
        `${config.apiUrl}${API_ENDPOINTS.AUTH.ME}`
      )
      const data = response.data.data as {
        id: string
        firstName: string
        lastName: string
        email: string
        avatar: string
        createdAt: string
        updatedAt: string
        deletedAt: string | null
        dataLogs: Array<{
          meta: Record<string, unknown>[]
          action: string
          createdAt: string
          createdBy: string
          updatedAt: string
        }>
        guest: boolean
      }

      setUser({
        id: data.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        avatar: data.avatar,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        isGuest: data.guest
      })
      setIsAuthenticated(true)
      
      // After successfully authenticating, check for saved redirect path
      const redirectPath = localStorage.getItem('redirectPath');
      if (redirectPath) {
        localStorage.removeItem('redirectPath');
        window.location.href = redirectPath;
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getProfile()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        accessToken,
        loginGuest,
        logout,
        getProfile,
        oauthLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}