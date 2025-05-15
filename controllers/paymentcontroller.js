const { MercadoPagoConfig, Preference } = require('mercadopago');

// Asegúrate de cargar las variables de entorno al inicio de tu app principal con:
// require('dotenv').config();

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(mp);

const createPreference = async (req, res) => {
  try {
    const { title, unit_price, quantity } = req.body;

    const result = await preference.create({
      body: {
        items: [
          {
            title,
            unit_price: Number(unit_price),
            quantity: Number(quantity),
          }
        ],
        back_urls: {
          success: 'https://www.tuapp.com/success',
          failure: 'https://www.tuapp.com/failure',
          pending: 'https://www.tuapp.com/pending'
        },
        auto_return: 'approved'
      }
    });

    res.status(200).json({ id: result.id });
  } catch (error) {
    console.error('Error al crear preferencia:', error);
    res.status(500).json({ error: 'No se pudo crear la preferencia de pago' });
  }
};

module.exports = {
  createPreference
};
