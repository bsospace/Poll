import { Routes, Route } from 'react-router-dom'
import { ROUTES } from '@/lib/Constants'
import { PrivateRoute } from './PrivateRoute'
import { PublicRoute } from './PubilcRoute'
import { LoginPage} from '@/pages/auth/LogIn'
import HomePage from '@/pages/Home'
import Callback from '@/pages/auth/Callback'
import Events from '@/pages/events/Index'
import CreateEvent from '@/pages/events/create/Index'
import PollDetails from '@/pages/polls/Index'
import EventView from '@/pages/events/EventView'
import CreatePoll from '@/pages/events/poll'
import PollResult from '@/pages/events/PollResult'


const publicRoutes = [
  { path: ROUTES.LOGIN, element: <LoginPage /> },
  { path: ROUTES.CALLBACK, element: <Callback /> }
//   { path: ROUTES.CALLBACK, element: <Callback /> }
]

const privateRoutes = [
    {path: ROUTES.HOME, element: <HomePage />},
    {path: ROUTES.EVENT.BASE, element: <Events />},
    {path: ROUTES.EVENT.CREATE, element: <CreateEvent />},
    {path: ROUTES.POLL.VIEW, element: <PollDetails />},
    {path: ROUTES.EVENT.VIEW, element: <EventView />},
    {path: ROUTES.EVENT.CREATE_POLL, element: <CreatePoll />},
    {path: ROUTES.POLL.RESULT, element: <PollResult />}
//   { path: ROUTES.HOME, element: <HomePage /> },
//   { path: ROUTES.PROFILE, element: <ProfilePage /> },
//   { path: ROUTES.CALENDAR, element: <CalendarPage /> },
//   { path: ROUTES.SCAN, element: <ScanPage /> },
//   { path: ROUTES.ANNOUNCEMENT.BASE, element: <Announcement /> },

//   // Activities
//   { path: ROUTES.ACTIVITY.BASE, element: <AllActivityPage /> },
//   { path: ROUTES.ACTIVITY.VIEW, element: <ActivityPage /> },
//   { path: ROUTES.ACTIVITY.ME, element: <MyActivityPage /> },

//   // Projects
//   { path: ROUTES.PROJECT.BASE, element: <AllProjectPage /> },
//   { path: ROUTES.PROJECT.VIEW, element: <ProjectPage /> },
//   { path: ROUTES.PROJECT.CREATE, element: <CreateProjectPage /> },
//   { path: ROUTES.PROJECT.EDIT, element: <EditProjectPage /> },
//   { path: ROUTES.PROJECT.RESTORE, element: <RestoreProjectPage /> },

//   // Locations
//   { path: ROUTES.LOCATION.BASE, element: <AllLocationPage /> },

//   // Users
//   { path: ROUTES.USER.BASE, element: <AllUserPage /> },
//   { path: ROUTES.USER.VIEW, element: <UserPage /> },
//   { path: ROUTES.USER.CREATE, element: <CreateUserPage /> },
//   { path: ROUTES.USER.EDIT, element: <EditUserPage /> },

//   // Groups
//   { path: ROUTES.GROUP.BASE, element: <AllGroupPage /> },
//   { path: ROUTES.GROUP.VIEW, element: <GroupPage /> },
]

export function AppRoutes () {
  return (
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          {privateRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
      </Routes>
    // </BreadcrumbProvider>
  )
}
