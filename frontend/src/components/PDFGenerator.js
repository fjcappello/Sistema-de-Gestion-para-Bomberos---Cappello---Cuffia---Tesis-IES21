import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function PDFGenerator({ partData, onClose, loggedUser }) {
  const [logoDataURI, setLogoDataURI] = useState('');

  useEffect(() => {
    fetch('/images/logo.png')
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoDataURI(reader.result);
        reader.readAsDataURL(blob);
      })
      .catch((error) => console.error('Error al cargar el logo:', error));
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    if (logoDataURI) {
      const logoWidth = 30;
      const logoHeight = 30;
      doc.addImage(logoDataURI, 'PNG', 10, 10, logoWidth, logoHeight);
    }


    doc.setFontSize(18);
    const title = 'Bomberos Santa Maria de Punilla';
    doc.text(title, pageWidth / 2, 20, { align: 'center' });

    const subtitle = 'Reporte de Emergencia';
    doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });

    // Grilla
    doc.autoTable({
      startY: 40,
      margin: { left: 10, right: 10 },
      theme: 'striped',
      head: [['', '']],
      body: [
        ['ID Parte', partData.numero_parte],
        ['Fecha', partData.fecha],
        ['Denunciante', `${partData.nombre_denunciante} ${partData.apellido_denunciante}`],
        ['Documento', partData.documento_denunciante],
        ['Dirección', partData.direccion],
        ['Tipo de Asistencia', partData.tipo_asistencia],
        ['Información Adicional', partData.parte_escrito],
      ],
    });

 // Firma del jefe
 const signaturePosY = doc.previousAutoTable.finalY + 20;
 doc.line(pageWidth - 80, signaturePosY + 5, pageWidth - 10, signaturePosY + 5); 
 doc.setFontSize(12);
 doc.text(partData.jefe_dotacion, pageWidth - 45, signaturePosY + 15, { align: 'center' });
 doc.text('Jefe de Dotación', pageWidth - 45, signaturePosY + 25, { align: 'center' });


    const printDate = new Date().toLocaleString();
    const footerText = `Impreso el: ${printDate}`;
    doc.setFontSize(10);
    doc.text(footerText, 10, doc.internal.pageSize.getHeight() - 10);

    doc.save(`Reporte_Parte_${partData.parte_id}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Generar PDF</h3>
        <p>Generar el PDF para el parte ID: {partData.parte_id}?</p>
        <button onClick={generatePDF} className="generate-pdf-btn">Generar PDF</button>
        <button onClick={onClose} className="close-modal-btn">Cerrar</button>
      </div>
    </div>
  );
}

export default PDFGenerator;