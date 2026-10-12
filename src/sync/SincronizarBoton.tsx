import { useSincronizar } from './useSincronizar'
import { useSyncEstado } from './useSyncEstado'

const SincronizarBoton = () => {
  const { pendientes, sincronizando, conflictos, ultimoError, enLinea } = useSyncEstado()
  const sincronizar = useSincronizar()

  const etiqueta = sincronizando
    ? 'Sincronizando...'
    : pendientes > 0
      ? `Sincronizar (${pendientes})`
      : 'Sincronizar'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <button
        type='button'
        aria-label='sincronizar'
        onClick={() => {
          void sincronizar()
        }}
        disabled={sincronizando || pendientes === 0}
      >
        {etiqueta}
      </button>
      {!enLinea ? (
        <span role='status' style={{ color: '#b45309', fontSize: '0.85rem' }}>
          Sin conexión
        </span>
      ) : null}
      {conflictos > 0 ? (
        <span role='status' style={{ color: '#dc2626', fontSize: '0.85rem' }}>
          {conflictos} en conflicto — refrescá para verlos
        </span>
      ) : null}
      {ultimoError ? (
        <span role='status' style={{ color: '#dc2626', fontSize: '0.85rem' }}>
          {ultimoError}
        </span>
      ) : null}
    </div>
  )
}

export default SincronizarBoton
