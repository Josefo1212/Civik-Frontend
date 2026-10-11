# Constitución — Civik Frontend

Principios innegociables. Toda spec, plan y tarea debe cumplirlos.

1. **Sin negocio propio**: ninguna nota, elegibilidad, reprogramación o
   regla de dominio se calcula acá. Si hace falta, se le pide al backend.
2. **Offline-first para asistencia**: tomarla debe funcionar sin internet;
   el resto de la app puede requerir conexión.
3. **Lógica separada de interfaz**: las reglas de presentación (cuándo
   mostrar "provisional", cómo arma el outbox) son funciones puras,
   testeables sin DOM.
4. **Los datos del usuario (offline) son sagrados**: ninguna
   sincronización puede perder una asistencia tomada sin conexión.
5. **El id del cliente es la clave de idempotencia**: se genera una sola
   vez, nunca se regenera en un reintento.
6. **Tests antes de avanzar**: ningún RF se da por cumplido sin una
   prueba (unitaria, o con Chrome DevTools para lo visual).
7. **Idioma**: dominio en español (igual que el backend), interfaz y
   comentarios en español, convenciones de React/TS en inglés donde
   corresponda.
