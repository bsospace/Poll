export const APP_NAME = 'React Enterprise App';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/guest',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  USERS: {
    BASE: '/user',
    PROFILE: '/user/profile',
  },
} as const;

export const ROUTES = {
  HOME: '/',              
  LOGIN: '/login', 
  CALLBACK:'/callback',       
  PROFILE: '/profile',      

  // Events
  EVENT: {
    BASE: '/events',      
    VIEW: '/event/:id',
    CREATE: '/event/create',    
    EDIT: '/event/edit',
    CREATE_POLL: '/event/:id/polls/create',
  }, 

  // Polls
  POLL: {
    BASE: '/polls',       
    CREATE: '/polls/create',
    VIEW: '/polls/:id',   
  }
} as const;