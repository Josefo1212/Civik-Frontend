import type { jsPDF } from 'jspdf'
import { AVISO_PROVISIONAL, SIN_NOTA } from '../constants'
import type { GrupoPdf } from './armado'
import { nombreArchivoPdf } from './armado'
import {
  COLUMNAS_PDF,
  ETIQUETA_DEFINITIVA,
  ETIQUETA_PROVISIONAL,
  LEYENDA_OVERRIDE,
  tituloDocumento,
} from './constants'

export type OpcionesDocumentoPdf = {
  anioEscolar: number
  lapso: number
  provisional: boolean
  grupos: GrupoPdf[]
}

const MARGEN = 14
const MARGEN_SUPERIOR = 41
const MARGEN_INFERIOR = 18

type JsPdfConAutoTable = {
  lastAutoTable?: { finalY?: number }
}

const notaConMarca = (nota: string | null, esOverride: boolean): string => {
  const texto = nota ?? SIN_NOTA
  return esOverride ? `${texto} *` : texto
}

export const construirDocumentoPdf = async (
  opciones: OpcionesDocumentoPdf,
): Promise<{ doc: jsPDF; nombreArchivo: string }> => {
  const [{ jsPDF: Constructor }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const { anioEscolar, lapso, provisional, grupos } = opciones
  const gruposConFilas = grupos.filter((grupo) => grupo.filas.length > 0)
  const seccionUnica = gruposConFilas.length === 1 ? gruposConFilas[0] : undefined

  const doc = new Constructor({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const anchoPagina = doc.internal.pageSize.getWidth()
  const altoPagina = doc.internal.pageSize.getHeight()

  doc.setProperties({
    title: tituloDocumento(anioEscolar),
    subject: `Notas del lapso ${lapso}`,
    creator: 'Civik',
  })

  const dibujarEncabezado = () => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(20, 25, 35)
    doc.text(doc.splitTextToSize(tituloDocumento(anioEscolar), anchoPagina - MARGEN * 2), MARGEN, 15)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(70, 80, 95)
    const estado = provisional ? ETIQUETA_PROVISIONAL : ETIQUETA_DEFINITIVA
    const alcance =
      seccionUnica === undefined ? '' : ` · Año ${seccionUnica.anio} · Sección ${seccionUnica.seccion}`
    doc.text(`Lapso ${lapso} · ${estado}${alcance}`, MARGEN, 27)

    if (provisional) {
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7.5)
      doc.setTextColor(140, 90, 20)
      doc.text(doc.splitTextToSize(AVISO_PROVISIONAL, anchoPagina - MARGEN * 2), MARGEN, 32)
    }

    doc.setDrawColor(200, 205, 212)
    doc.setLineWidth(0.3)
    doc.line(MARGEN, 37, anchoPagina - MARGEN, 37)
  }

  let y = MARGEN_SUPERIOR

  gruposConFilas.forEach((grupo, indice) => {
    if (indice > 0) {
      y += 4
      if (y > altoPagina - MARGEN_INFERIOR - 30) {
        doc.addPage()
        y = MARGEN_SUPERIOR
      }
    }

    if (gruposConFilas.length > 1) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(30, 40, 55)
      doc.text(grupo.etiqueta, MARGEN, y)
      y += 6
    }

    autoTable(doc, {
      startY: y,
      margin: { top: MARGEN_SUPERIOR, left: MARGEN, right: MARGEN, bottom: MARGEN_INFERIOR },
      head: [[...COLUMNAS_PDF]],
      body: grupo.filas.map((fila) => [
        fila.apellido,
        fila.nombre,
        fila.anio,
        fila.seccion,
        notaConMarca(fila.nota, fila.esOverride),
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 9,
        cellPadding: 2,
        textColor: [30, 40, 55],
        lineColor: [215, 220, 226],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 48 },
        2: { cellWidth: 18, halign: 'center' },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
      },
      didDrawPage: () => {
        dibujarEncabezado()
      },
    })

    const finalY = (doc as unknown as JsPdfConAutoTable).lastAutoTable?.finalY
    y = (finalY ?? y) + 8
  })

  if (gruposConFilas.some((grupo) => grupo.filas.some((fila) => fila.esOverride))) {
    if (y > altoPagina - MARGEN_INFERIOR - 8) {
      doc.addPage()
      y = MARGEN_SUPERIOR
    }
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(90, 100, 115)
    doc.text(LEYENDA_OVERRIDE, MARGEN, y)
  }

  const totalPaginas = doc.getNumberOfPages()
  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {
    doc.setPage(pagina)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(120, 130, 145)
    doc.text(`Página ${pagina} de ${totalPaginas}`, anchoPagina - MARGEN, altoPagina - 8, {
      align: 'right',
    })
  }

  const nombreArchivo = nombreArchivoPdf({
    anioEscolar,
    lapso,
    grupo: seccionUnica === undefined ? undefined : { anio: seccionUnica.anio, seccion: seccionUnica.seccion },
  })

  return { doc, nombreArchivo }
}

export const generarDocumentoPdf = async (opciones: OpcionesDocumentoPdf): Promise<void> => {
  const { doc, nombreArchivo } = await construirDocumentoPdf(opciones)
  doc.save(nombreArchivo)
}
