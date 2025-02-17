import React, {
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

interface User extends IUser {
  isGuest: boolean
}

interface AuthContextProps {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  accessToken: string | null
  loginGuest: (key: string, redirect: string) => Promise<void>
  logout: () => Promise<void>
  getProfile: () => Promise<void>
  oauthLogin: (provider: 'discord' | 'github' | 'google') => Promise<void>
}

//  สร้าง Context ให้ถูกต้อง
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const loginGuest = async (key: string, redirect: string) => {
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
      alert(credentials.accessToken)
      localStorage.setItem('accessToken', credentials.accessToken)
      window.location.href = redirect
    } finally {
      setIsLoading(false)
    }
  }

  const oauthLogin = async (provider: 'discord' | 'github' | 'google') => {
    const service = 'vote'
    window.location.href = `${config.apiOpenIdConnectUrl}/auth/${provider}?service=${service}&redirect=${config.appUrlCallback}`
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      localStorage.clear()
      window.location.reload()
    } finally {
      setIsLoading(false)
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
          meta: any[]
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

// ใช้ useContext ให้ถูกต้อง
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
