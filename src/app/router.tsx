import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppShell from '../components/AppShell/AppShell'
import NotFound from '../components/NotFound'
import { RUTAS } from '../constants/routes'
import AsistenciaPage from '../pages/AsistenciaPage'
import EstudiantesPage from '../pages/EstudiantesPage'
import EventosPage from '../pages/EventosPage'
import SeccionesPage from '../pages/SeccionesPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to={RUTAS.secciones} replace /> },
      { path: RUTAS.secciones, element: <SeccionesPage /> },
      { path: RUTAS.estudiantes, element: <EstudiantesPage /> },
      { path: RUTAS.eventos, element: <EventosPage /> },
      { path: RUTAS.asistencia, element: <AsistenciaPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])