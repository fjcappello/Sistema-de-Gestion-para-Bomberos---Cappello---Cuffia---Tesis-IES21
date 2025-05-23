import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useUsuario } from "../context/UserContext";
import axios from "axios";

function PDFGenerator({ partData, onClose }) {
  const { usuario } = useUsuario();
  const [logoDataURI, setLogoDataURI] = useState("");
  const [bitacoraContent, setBitacoraContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar logo
    fetch("/images/logo.png")
      .then((response) => response.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => setLogoDataURI(reader.result);
        reader.readAsDataURL(blob);
      });

    // Obtener bitácora
    const fetchBitacora = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:3001/bitacora/${partData.parte_id}`
        );
        if (response.data.success && response.data.data) {
          const reportes = response.data.data.map((entry) => entry.reporte);
          setBitacoraContent(reportes.join("\n\n---\n\n"));
        }
      } catch (error) {
        console.error("Error obteniendo bitácora:", error);
        setBitacoraContent("No se pudo cargar la bitácora");
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
    const logoHeight = 30;
    const logoWidth = 30;
    const headerY = 25; // Posición vertical base para alineación

    // Logo - Centrado verticalmente con texto
    if (logoDataURI) {
      const logoY = headerY - logoHeight / 2 + 5;
      doc.addImage(logoDataURI, "PNG", margin, logoY, logoWidth, logoHeight);
    }

    // Encabezados alineados con logo
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    const titleY = headerY + 5;
    doc.text("Bomberos Santa María de Punilla", pageWidth / 2, titleY, {
      align: "center",
    });

    doc.setFontSize(16);
    const subtitleY = headerY + 15;
    doc.text("Reporte de Emergencia", pageWidth / 2, subtitleY, {
      align: "center",
    });

    // Tabla de datos
    doc.autoTable({
      startY: subtitleY + 20,
      margin: { left: margin, right: margin },
      head: [["Dato", "Valor"]],
      body: [
        ["N° de Parte", partData.numero_parte],
        ["Fecha", partData.fecha],
        [
          "Denunciante",
          `${partData.nombre_denunciante} ${partData.apellido_denunciante}`,
        ],
        ["Documento", partData.documento_denunciante],
        ["Dirección", partData.direccion],
        ["Tipo de Asistencia", partData.tipo_asistencia],
      ],
      styles: {
        cellPadding: 5,
        fontSize: 10,
        valign: "middle",
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: "auto" },
        1: { cellWidth: "wrap" },
      },
    });

    // Bitácora con manejo multipágina
    if (bitacoraContent) {
      let currentY = doc.lastAutoTable.finalY + 15;

      // Verificar espacio para el título
      if (currentY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(14);
      doc.setTextColor(30, 30, 30);
      doc.text("Bitácora de la Emergencia", margin, currentY);
      currentY += 10;

      // Configuración de texto
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      const lineHeight = 7;
      const maxWidth = pageWidth - margin * 2;
      const lines = doc.splitTextToSize(bitacoraContent, maxWidth);

      // Imprimir línea por línea con control de páginas
      for (let i = 0; i < lines.length; i++) {
        if (currentY > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          currentY = 20;
        }
        doc.text(lines[i], margin, currentY);
        currentY += lineHeight;
      }
    }

    // Firma en nueva página si es necesario
    let signatureY = doc.lastAutoTable.finalY + (bitacoraContent ? 50 : 30);
    if (signatureY > doc.internal.pageSize.getHeight() - 30) {
      doc.addPage();
      signatureY = 20;
    }

    doc.setDrawColor(150, 150, 150);
    doc.line(pageWidth - 80, signatureY, pageWidth - 20, signatureY);
    doc.setFontSize(12);
    doc.text(partData.jefe_dotacion, pageWidth - 50, signatureY + 10, {
      align: "center",
    });
    doc.text("Jefe de Dotación", pageWidth - 50, signatureY + 20, {
      align: "center",
    });

    // Pie de página
    const footerText = `Generado por ${
      usuario?.nombreCompleto || "Sistema"
    } el ${new Date().toLocaleDateString()}`;
    doc.setFontSize(9);
    doc.text(footerText, margin, doc.internal.pageSize.getHeight() - 10);

    doc.save(`Reporte_Emergencia_${partData.numero_parte}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Generar Reporte PDF</h3>
        <p className="pdf-generator-info">
          Se generará el reporte para el parte N°: {partData.numero_parte}
        </p>
        {loading && <p className="loading-message">Cargando reporte...</p>}
        {bitacoraContent && (
          <div className="bitacora-preview">
            <h4>Previsualización del Reporte:</h4>
            <div className="bitacora-content">
              {bitacoraContent ? (
                bitacoraContent
              ) : (
                <p className="text-muted">
                  No hay contenido para previsualizar
                </p>
              )}
            </div>
          </div>
        )}
        <div className="modal-buttons">
          <button
            onClick={generatePDF}
            className="confirm-btn"
            disabled={loading}
          >
            {loading ? "Generando PDF..." : "Generar PDF"}
          </button>
          <button onClick={onClose} className="cancel-btn">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PDFGenerator;
