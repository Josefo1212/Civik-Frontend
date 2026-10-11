---
name: civik-dominio-frontend
description: Úsala al construir cualquier pantalla o lógica de sincronización que dependa de las reglas de negocio de Civik (notas, estados de evento/asistencia, sincronización offline). Resume, desde la perspectiva del front, lo que ya está implementado en el backend.
---

# Dominio de Civik — vista desde el frontend

Este repo NUNCA implementa estas reglas — viven y se aplican en
`Civik-Backend`. Esta skill existe para que la interfaz las respete al
mostrar información y al armar la sincronización, no para recalcularlas.

## Qué puede mostrar la interfaz sobre una nota

- La nota final de un lapso viene siempre del backend. Nunca se calcula
  en el cliente.
- Mientras el lapso esté `ACTIVE`, la nota es **provisional**: puede bajar
  cuando se agreguen los eventos que faltan. Mostrarlo explícito (una
  etiqueta, un tooltip), no solo el número.
- Al cerrar el lapso (`CLOSED`), la nota ya es definitiva.
- Si el backend devuelve un override, mostrarlo marcado como "editado
  manualmente", no mezclado con el cálculo automático.

## Estados de evento (solo lectura desde el front)

- `SCHEDULED`: programado. Reprogramar o cancelar son operaciones que
  pide el backend, el front solo dispara la petición.
- `CANCELLED`: tiene un motivo obligatorio — mostrarlo siempre junto al
  evento.
- Un evento pasado sin asistencia registrada está **pendiente**, no es
  una ausencia. La interfaz debería distinguirlo visualmente.

## Sincronización offline — lo que SÍ construye el frontend

- Al registrar asistencia offline, generar el id del lado del cliente con
  `crypto.randomUUID()` una sola vez, guardarlo junto con el registro en
  el outbox de Dexie. Nunca regenerarlo en un reintento.
- El outbox se vacía solo cuando el servidor confirma cada ítem, nunca
  antes.
- Si el servidor rechaza un ítem por conflicto (su `updated_at` es más
  viejo que el almacenado), el ítem se mantiene en el outbox y se le pide
  al usuario refrescar — nunca se descarta en silencio ni se sobrescribe
  sin avisar.
- Disparar la sincronización: al abrir la app, al recibir el evento
  `online` del navegador, y con un botón manual (en iOS no hay Background
  Sync).
- `navigator.storage.persist()` al instalar la PWA.

## Lo que el frontend NO debe asumir

- No asumir que los eventos pertenecen a una sección — todas las
  secciones comparten los mismos eventos.
- No inventar un estado "COMPLETED": no existe, se deriva de si el
  evento tiene asistencia.
- No mostrar una ausencia para un evento pasado sin registro: es un
  pendiente, se reporta aparte.
