import type { Estudiante } from '../../domain/estudiante'
import { apiSend } from '../../api/client'

export type CrearEstudiantePayload = {
  apellido: string
  nombre: string
  telefono?: string | null
}

export type EditarEstudiantePayload = {
  id_seccion: string
  apellido: string
  nombre: string
  telefono?: string | null
}

export const listarPorSeccion = async (
  seccionId: string,
  incluirInactivas = false,
): Promise<Estudiante[]> => {
  const params = incluirInactivas ? '?incluir_inactivas=true' : ''
  return await apiSend<Estudiante[]>(`/sections/${seccionId}/students${params}`, 'GET')
}

export const crearEnSeccion = async (
  seccionId: string,
  payload: CrearEstudiantePayload,
): Promise<Estudiante> => {
  return await apiSend<Estudiante>(`/sections/${seccionId}/students`, 'POST', payload)
}

export const editarEstudiante = async (
  estudianteId: string,
  payload: EditarEstudiantePayload,
): Promise<Estudiante> => {
  return await apiSend<Estudiante>(`/students/${estudianteId}`, 'PUT', payload)
}

export const darDeBaja = async (estudianteId: string): Promise<Estudiante> => {
  return await apiSend<Estudiante>(`/students/${estudianteId}/baja`, 'POST')
}

export const reactivar = async (estudianteId: string): Promise<Estudiante> => {
  return await apiSend<Estudiante>(`/students/${estudianteId}/reactivar`, 'POST')
}
