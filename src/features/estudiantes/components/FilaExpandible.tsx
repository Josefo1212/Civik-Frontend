import type { Evento } from '../../../domain/evento'
import type { EstadoAsistencia } from '../../../domain/asistencia'
import type { EstadoLapso } from '../../../domain/lapso'
import type { FilaNota } from '../../../domain/nota'
import type { FilaFusionada } from '../../../sync/fusionar'
import { ESTADOS_ASISTENCIA, ETIQUETAS_ESTADO_ASISTENCIA, SIN_MARCAR } from '../../asistencia/constants'
import { ETIQUETAS_ESTADO_EVENTO, ETIQUETAS_TIPO } from '../../eventos/constants'
import { esEventoPasado } from '../../eventos/utils'
import { MARCA_OVERRIDE, SIN_NOTA } from '../../notas/constants'
import { esNotaProvisional, textoEstadoNota } from '../../notas/utils'
import styles from './FilaExpandible.module.css'

export type PropsFilaExpandible = {
  eventos: Evento[]
  porEvento: Map<string, FilaFusionada>
  nota: FilaNota | null
  estadoLapso: EstadoLapso
  onCorregir: (idEvent: string, state: EstadoAsistencia) => void
  enviando?: boolean
}

const FilaExpandible = ({
  eventos,
  porEvento,
  nota,
  estadoLapso,
  onCorregir,
  enviando = false,
}: PropsFilaExpandible) => {
  const provisional = esNotaProvisional(estadoLapso)

  return (
    <div className={styles.detalle} data-testid="asistencia-lapso">
      <div className={styles.bloqueNota}>
        <span className={styles.notaEtiqueta}>Nota del lapso</span>
        <span className={`${styles.notaValor} dato`}>
          {nota?.nota ?? SIN_NOTA}
          {nota?.es_override ? <span className={styles.marcaOverride}>{MARCA_OVERRIDE}</span> : null}
        </span>
        <span className={`${styles.aviso} ${provisional ? styles.avisoProvisional : styles.avisoDefinitiva}`}>
          {textoEstadoNota(estadoLapso)}
        </span>
      </div>

      {eventos.length === 0 ? (
        <p className={styles.vacio} aria-live="polite">
          Este lapso no tiene eventos.
        </p>
      ) : (
        <div className={styles.contenedor}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Evento</th>
                <th>Estado</th>
                <th>Corregir</th>
              </tr>
            </thead>
            <tbody>
              {eventos.map((evento) => {
                const fila = porEvento.get(evento.id)
                const cancelado = evento.status === 'CANCELLED'
                const sinEstado = fila?.state == null
                const pendiente = sinEstado && esEventoPasado(evento.event_date)
                const grupo = `asistencia-corregir-${evento.id}`

                return (
                  <tr key={evento.id} className={cancelado ? styles.cancelado : undefined}>
                    <td className={`${styles.dato} ${styles.fecha}`}>{evento.event_date}</td>
                    <td>
                      <span className={styles.nombreEvento}>{evento.event_name}</span>
                      {evento.type_event !== null ? (
                        <span className={styles.tipo}>{ETIQUETAS_TIPO[evento.type_event]}</span>
                      ) : null}
                      {cancelado ? (
                        <span className={styles.marcaCancelado}>
                          {ETIQUETAS_ESTADO_EVENTO.CANCELLED}
                          {evento.cancelled_reason !== null ? ` — ${evento.cancelled_reason}` : ''}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span className={styles.estadoAsistencia}>
                        {pendiente ? 'Pendiente' : fila?.state ? ETIQUETAS_ESTADO_ASISTENCIA[fila.state] : SIN_MARCAR}
                      </span>
                      {fila?.estadoSync ? (
                        <span
                          role="status"
                          className={`${styles.marcaSync} ${fila.estadoSync === 'error' ? styles.syncError : ''}`}
                        >
                          {fila.estadoSync === 'error' ? 'Error al sincronizar' : 'Pendiente de sincronizar'}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      {cancelado ? (
                        <span className={styles.sinCorreccion}>—</span>
                      ) : (
                        <div className={styles.opciones}>
                          {ESTADOS_ASISTENCIA.map((estado) => (
                            <label key={estado} className={styles.opcion}>
                              <input
                                type="radio"
                                name={grupo}
                                aria-label={`${estado}-${fila?.id_student}-${evento.id}`}
                                checked={fila?.state === estado}
                                disabled={enviando}
                                onChange={() => onCorregir(evento.id, estado)}
                              />
                              {ETIQUETAS_ESTADO_ASISTENCIA[estado]}
                            </label>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default FilaExpandible
