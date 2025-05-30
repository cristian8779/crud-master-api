const generarPlantillaResetPassword = (nombre, token) => {
  const url = `http://20.251.145.196:5000/reset-password.html?token=${token}`;
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Restablecer contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border-top: 8px solid #BE0C0C; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);"
            >
              <tr>
                <td align="center" style="padding: 32px 24px 16px;">
                  <div style="width: 64px; height: 64px;">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="#BE0C0C" viewBox="0 0 24 24" width="64" height="64">
                      <path d="M12 1a5 5 0 0 0-5 5v4H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5zm-3 5a3 3 0 0 1 6 0v4H9V6zm3 7a2 2 0 0 1 1 3.732V19a1 1 0 0 1-2 0v-2.268A2 2 0 0 1 12 13z"/>
                    </svg>
                  </div>
                  <h2 style="font-size: 22px; color: #222222; margin: 16px 0 8px; font-weight: 600;">
                    Hola, ${nombre}
                  </h2>
                  <p style="font-size: 16px; color: #555555; margin: 0;">
                    Recibimos una solicitud para restablecer tu contraseña.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="left" style="padding: 0 32px 24px; font-size: 15px; color: #333333; line-height: 1.6;">
                  <p>
                    Haz clic en el botón a continuación para establecer una nueva contraseña. Este enlace expirará en
                    <strong>10 minutos</strong> por motivos de seguridad.
                  </p>
                  <div style="text-align: center; margin-top: 30px;">
                    <a
                      href="${url}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        background-color: #BE0C0C;
                        color: #ffffff;
                        padding: 14px 28px;
                        border-radius: 8px;
                        text-decoration: none;
                        font-weight: bold;
                        display: inline-block;
                        font-size: 16px;
                      "
                    >
                      Restablecer contraseña
                    </a>
                  </div>
                  <p style="margin-top: 24px;">
                    Si tú no solicitaste este cambio, simplemente ignora este correo. Tu contraseña actual seguirá siendo válida.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="font-size: 12px; color: #999999; padding: 20px 32px;">
                  © ${new Date().getFullYear()} Soportee. Todos los derechos reservados.
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = generarPlantillaResetPassword;
