export const esEventoPasado = (fechaEvento: string, hoy = new Date()): boolean => {
  const fecha = new Date(`${fechaEvento}T00:00:00`)
  const referencia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return fecha.getTime() < referencia.getTime()
}
