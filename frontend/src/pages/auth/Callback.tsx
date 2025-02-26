import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

function Callback() {
  useEffect(() => {
    // Get access token and refresh token from URL query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const accessToken = urlParams.get('accessToken')
    const refreshToken = urlParams.get('refreshToken')

    console.log(accessToken)
    console.log(refreshToken)

    // Set tokens to local storage
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken)
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }

    // If authentication failed, redirect to login
    if (!accessToken || !refreshToken) {
      window.location.href = '/login'
      return
    }

    const redirectPath = localStorage.getItem('redirectPath')
    
    if (redirectPath) {
      // Redirect to the original requested path
      window.location.href = redirectPath
    } else {
      // Default redirect to home if no specific path was saved
      localStorage.removeItem('redirectPath')
      window.location.href = '/'
    }
  }, [])

  return (
    <div className='flex items-center justify-center h-screen'>
      <Loader2 className='w-12 h-12 animate-spin' />
    </div>
  )
}

export default Callback