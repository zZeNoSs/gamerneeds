import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const generarPDFComprobante = (datosCompra) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50
            });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            const colors = {
                primary: '#272727',
                secondary: '#D65A31',
                text: '#333333',
                lightGray: '#666666',
                white: '#ffffff'
            }
            doc.rect(0, 0, doc.page.width, 150).fill(colors.primary);

            const centerX = doc.page.width / 2;
            doc.fontSize(35);

            doc.fill(colors.white).text('GAMER', centerX - 120, 35);

            doc.fill(colors.secondary).text('NEEDS', centerX + 10, 35);

            doc.fontSize(16).fill(colors.white).text('Factura', centerX - 25, 90);

            doc.moveTo(50, 120).lineTo(doc.page.width - 50, 120).stroke(colors.secondary);

            doc.fill(colors.text).fontSize(14).text('Detalles de la Compra', 50, 180).moveDown();

            const infoY = 220;
            doc.rect(50, infoY, doc.page.width - 100, 160).lineWidth(1).stroke(colors.lightGray);

            doc.fontSize(12).fill(colors.text)
               .text(`Fecha: ${new Date(datosCompra.fecha).toLocaleString('es-ES')}`, 70, infoY + 20)
               .text(`Nº de Pedido:`, 70, infoY + 50)
               .text(`${datosCompra.sessionId}`, 70, infoY + 70, {
                   width: doc.page.width - 140,
                   align: 'left'
               })
               .text(`Cliente: ${datosCompra.usuario.nombre}`, 70, infoY + 100)
               .text(`Email: ${datosCompra.usuario.email}`, 70, infoY + 130);

            const tableTop = 420;
            
            doc.rect(50, tableTop, doc.page.width - 100, 30).fill(colors.primary);

            doc.fill('#ffffff').text('Producto', 70, tableTop + 10).text('Precio', doc.page.width - 150, tableTop + 10);

            let yPos = tableTop + 40;
            datosCompra.items.forEach((item, index) => {
                const isEven = index % 2 === 0;
                if (isEven) {
                    doc.rect(50, yPos - 5, doc.page.width - 100, 30)
                       .fill('#f8f8f8');
                }
                
                doc.fill(colors.text).text(item.nombre, 70, yPos).text(`${item.precio}€`, doc.page.width - 150, yPos);
                
                yPos += 30;
            });

            const totalY = yPos + 20;
            doc.rect(doc.page.width - 200, totalY, 150, 40).fill(colors.primary);

            doc.fill('#ffffff').fontSize(14)
               .text(`Total: ${datosCompra.total}€`, 
                     doc.page.width - 180, 
                     totalY + 12);

            const footerY = doc.page.height - 100;

            doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).stroke(colors.secondary);

            try {
                const logoPath = join(__dirname, '../../assets/logo.png');
                doc.image(logoPath, 
                    (doc.page.width - 50) / 2,
                    footerY + 10,
                    {
                        width: 50,
                        height: 50
                    }
                );
            } catch (error) {
            }

            doc.fontSize(12).fill(colors.text)
               .text('Gracias por confiar en nosotros', {
                   align: 'center',
                   width: doc.page.width,
                   y: footerY + 70
               });

            doc.end();

        } catch (error) {
            reject(error);
        }
    });
};