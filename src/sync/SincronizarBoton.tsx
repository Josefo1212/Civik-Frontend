import Badge from '../components/ui/Badge/Badge'
import Button from '../components/ui/Button/Button'
import { useSincronizar } from './useSincronizar'
import { useSyncEstado } from './useSyncEstado'
import styles from './SincronizarBoton.module.css'

const SincronizarBoton = () => {
  const { pendientes, sincronizando, conflictos, ultimoError, enLinea } = useSyncEstado()
  const sincronizar = useSincronizar()

  const etiqueta = sincronizando
    ? 'Sincronizando...'
    : pendientes > 0
      ? `Sincronizar (${pendientes})`
      : 'Sincronizar'

  return (
    <div className={styles.grupo}>
      <Button
        variante="secondary"
        tamano="sm"
        aria-label="sincronizar"
        cargando={sincronizando}
        disabled={pendientes === 0}
        onClick={() => {
          void sincronizar()
        }}
      >
        {etiqueta}
      </Button>
      {!enLinea ? <Badge variante="neutral">Sin conexión</Badge> : null}
      {conflictos > 0 ? (
        <Badge variante="danger">{conflictos} en conflicto — refrescá para verlos</Badge>
      ) : null}
      {ultimoError ? <Badge variante="danger">{ultimoError}</Badge> : null}
    </div>
  )
}

export default SincronizarBoton
