import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useUsuario } from '../context/UserContext';
import axios from 'axios';

function PDFGenerator({ partData, onClose }) {
  const { usuario } = useUsuario();
  const [logoDataURI, setLogoDataURI] = useState('');
  const [bitacoraContent, setBitacoraContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Cargar el logo
    fetch('/images/logo.png')
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoDataURI(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch(error => console.error('Error cargando logo:', error));

    // Obtener la bitácora con manejo de errores mejorado
    const fetchBitacora = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`http://localhost:3001/bitacora/${partData.parte_id}`);
        console.log('Respuesta del backend:', response.data); // Debug
        
        if (response.data.success) {
          // Verifica si hay datos y si es un array
          if (Array.isArray(response.data.data) && response.data.data.length > 0) {
            const reportes = response.data.data.map(entry => {
              // Asegúrate de que cada entrada tenga el campo 'reporte'
              return entry.reporte || '(Sin contenido)';
            });
            setBitacoraContent(reportes.join('\n\n---\n\n'));
          } else {
            setBitacoraContent('No hay registros de bitácora para este parte');
          }
        } else {
          setError('La respuesta del servidor no fue exitosa');
        }
      } catch (error) {
        console.error('Error obteniendo bitácora:', error);
        setError('Error al cargar la bitácora');
        setBitacoraContent('No se pudo cargar la bitácora');
      } finally {
        setLoading(false);
      }
    };

    fetchBitacora();
  }, [partData.parte_id]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = 20;
  
    // Logo
    if (logoDataURI) {
      doc.addImage(logoDataURI, 'PNG', margin, 10, 30, 30);
      yPosition = 45;
    }
  
    // Encabezados
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Bomberos Santa María de Punilla', pageWidth / 2, yPosition, { align: 'center' });
    doc.setFontSize(16);
    yPosition += 10;
    doc.text('Reporte de Emergencia', pageWidth / 2, yPosition, { align: 'center' });
    
    // Tabla de datos
    doc.autoTable({
      startY: yPosition + 15,
      margin: { left: margin, right: margin },
      head: [['Dato', 'Valor']],
      body: [
        ['N° de Parte', partData.numero_parte],
        ['Fecha', partData.fecha],
        ['Denunciante', `${partData.nombre_denunciante} ${partData.apellido_denunciante}`],
        ['Documento', partData.documento_denunciante],
        ['Dirección', partData.direccion],
        ['Tipo de Asistencia', partData.tipo_asistencia],
        ['Información Inicial', partData.parte_escrito],
      ],
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: 'middle'
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 'auto' },
        1: { cellWidth: 'wrap' }
      }
    });
    // Bitácora con manejo de páginas múltiples
    if (bitacoraContent) {
      let finalY = doc.lastAutoTable.finalY + 15;
      
      // Verificar si necesito nueva página
      if (finalY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        finalY = 20;
      }
  
      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text('Bitácora de la Emergencia', margin, finalY);
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      
      // Dividir el texto y manejar páginas
      const splitText = doc.splitTextToSize(bitacoraContent, pageWidth - (margin * 2));
      let remainingText = splitText;
      let pageCount = 0;
      const maxPageCount = 10; // Límite de seguridad
      
      while (remainingText.length > 0 && pageCount < maxPageCount) {
        pageCount++;
        const textHeight = doc.getTextDimensions(remainingText, {
          maxWidth: pageWidth - (margin * 2)
        }).h;
        
        // Calcular espacio disponible en la página actual
        const spaceLeft = doc.internal.pageSize.getHeight() - finalY - 30;
        const canFit = Math.floor(spaceLeft / doc.internal.getLineHeight());
        
        if (canFit <= 0) {
          doc.addPage();
          finalY = 20;
          continue;
        }
        
        const textToPrint = remainingText.slice(0, canFit);
        remainingText = remainingText.slice(canFit);
        
        doc.text(textToPrint, margin, finalY + 10);
        finalY = doc.previousAutoTable.finalY || finalY + (textToPrint.length * doc.internal.getLineHeight());
        
        if (remainingText.length > 0) {
          doc.addPage();
          finalY = 20;
        }
      }
    }
  
    // Firma en la última página
    const lastPageHeight = doc.internal.pageSize.getHeight();
    let signatureY = lastPageHeight - 40;
    
    // Si no hay espacio, agregamos nueva página para la firma
    if (signatureY < 50) {
      doc.addPage();
      signatureY = 20;
    }
    
    doc.setDrawColor(150, 150, 150);
    doc.line(pageWidth - 80, signatureY, pageWidth - 20, signatureY);
    doc.setFontSize(12);
    doc.text(partData.jefe_dotacion, pageWidth - 50, signatureY + 10, { align: 'center' });
    doc.text('Jefe de Dotación', pageWidth - 50, signatureY + 20, { align: 'center' });
  
    // Pie de página
    const footerText = `Generado por ${usuario?.nombreCompleto || 'Sistema'} el ${new Date().toLocaleDateString()}`;
    doc.setFontSize(9);
    doc.text(footerText, margin, doc.internal.pageSize.getHeight() - 10);
  
    doc.save(`Reporte_Emergencia_${partData.numero_parte}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Generar Reporte PDF</h3>
        <p>Se generará el reporte para el parte N°: {partData.numero_parte}</p>
        <div className="modal-buttons">
          <button onClick={generatePDF} className="confirm-btn">Generar PDF</button>
          <button onClick={onClose} className="cancel-btn">Cancelar</button>
        </div>
      </div>
    </div>
  );
}

export default PDFGenerator;