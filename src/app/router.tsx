import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from '../components/AppShell/AppShell'
import NotFound from '../components/NotFound'
import { RUTAS } from '../constants/routes'
import AlumnosYSeccionesPage from '../pages/AlumnosYSeccionesPage'
import AsistenciaPage from '../pages/AsistenciaPage'
import DashboardPage from '../pages/DashboardPage'
import EventosPage from '../pages/EventosPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: RUTAS.inicio, element: <Navigate to="/" replace /> },
      { path: RUTAS.secciones, element: <Navigate to={RUTAS.estudiantes} replace /> },
      { path: RUTAS.estudiantes, element: <AlumnosYSeccionesPage /> },
      { path: RUTAS.eventos, element: <EventosPage /> },
      { path: RUTAS.asistencia, element: <AsistenciaPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])