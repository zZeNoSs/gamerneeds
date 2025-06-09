import mailjet from '../config/mailjet.js';

export const enviarEmailBienvenida = async (nombre, email) => {
  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "elzenyt906@gmail.com",
            Name: "Gamers Needs"
          },
          To: [
            {
              Email: email,
              Name: nombre
            }
          ],
          Subject: "¡Bienvenido a Gamers Needs!",
          HTMLPart: `
            <div style="background-color: #272727; padding: 20px; color: white; font-family: Arial, sans-serif;">
              <h1 style="color: #FF4C1A;">¡Bienvenido a Gamers Needs, ${nombre}!</h1>
              <p>¡Gracias por unirte a nuestra comunidad de gamers!</p>
              <p>En Gamers Needs encontrarás:</p>
              <ul style="list-style: none; padding: 0;">
                <li style="margin: 10px 0;">🎮 Los mejores juegos al mejor precio</li>
                <li style="margin: 10px 0;">🏆 Una comunidad activa de jugadores</li>
                <li style="margin: 10px 0;">⚡ Activación instantánea de juegos</li>
              </ul>
              <div style="margin-top: 20px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #FF4C1A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Visitar la tienda
                </a>
              </div>
            </div>
          `
        }
      ]
    });
    return result;
  } catch (error) {
    throw error;
  }
};

export const enviarEmailContacto = async (nombre, emailCliente, asunto, descripcion) => {
  try {
    const result = await mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: "elzenyt906@gmail.com",
            Name: "Gamers Needs - Contacto"
          },
          To: [
            {
              Email: "elzenyt906@gmail.com",
              Name: "Soporte Gamers Needs"
            }
          ],
          Subject: `[CONTACTO] ${asunto}`,
          HTMLPart: `
            <div style="background-color: #f8f9fa; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #FF4C1A; margin-top: 0;">Nuevo mensaje de contacto</h2>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Información del cliente:</h3>
                  <p style="margin: 5px 0;"><strong>Nombre:</strong> ${nombre}</p>
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${emailCliente}</p>
                  <p style="margin: 5px 0;"><strong>Asunto:</strong> ${asunto}</p>
                </div>
                
                <div style="background-color: #fff; padding: 15px; border-left: 4px solid #FF4C1A; margin: 15px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">Mensaje:</h3>
                  <p style="white-space: pre-wrap; line-height: 1.6; color: #555;">${descripcion}</p>
                </div>
                
                <div style="margin-top: 20px; padding: 10px; background-color: #e9ecef; border-radius: 5px; font-size: 12px; color: #666;">
                  <p style="margin: 0;">Este mensaje fue enviado desde el formulario de contacto de Gamers Needs.</p>
                  <p style="margin: 0;">Fecha: ${new Date().toLocaleString('es-ES')}</p>
                </div>
              </div>
            </div>`,
          ReplyTo: {
            Email: emailCliente,
            Name: nombre
          }
        },
        {
          From: {
            Email: "elzenyt906@gmail.com",
            Name: "Gamers Needs"
          },
          To: [
            {
              Email: emailCliente,
              Name: nombre
            }
          ],
          Subject: `Hemos recibido tu mensaje: ${asunto}`,
          HTMLPart: `
            <div style="background-color: #272727; padding: 20px; color: white; font-family: Arial, sans-serif;">
              <h1 style="color: #FF4C1A;">¡Gracias por contactarnos, ${nombre}!</h1>
              <p>Hemos recibido tu mensaje con el asunto: <strong>"${asunto}"</strong></p>
              <p>Nuestro equipo de soporte lo revisará y te responderemos lo antes posible.</p>
              
              <div style="background-color: #333; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #FF4C1A; margin-top: 0;">Tu mensaje:</h3>
                <p style="white-space: pre-wrap; line-height: 1.6;">${descripcion}</p>
              </div>
              
              <p>Tiempo estimado de respuesta: 24-48 horas.</p>
              
              <div style="margin-top: 20px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}" 
                   style="background-color: #FF4C1A; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Volver a la tienda
                </a>
              </div>
            </div>`
        }
      ]
    });
    return result;
  } catch (error) {
    throw error;
  }
};