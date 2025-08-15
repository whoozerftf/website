const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const app = express();

app.use(cors());
const WOOCOMMERCE_URL = 'https://checkout.whoozer.xyz/wp-json/wc/v3/products';
const CONSUMER_KEY = "ck_630ab084ec34e953d75e288ddf9c32e0aefc9fcc"; // Ganti dengan API Key WooCommerce Anda
const CONSUMER_SECRET = "cs_31f3896c3c061cf1b39d135fedefe54e06e657f0"; // Ganti dengan API Secret WooCommerce Anda

// Endpoint root untuk info
app.get('/', (req, res) => {
  res.send('WooCommerce Stock API is running');
});

// Endpoint: /api/stock/:productId
app.get('/api/stock/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    console.log('Request masuk untuk produk:', productId);
    // Coba ambil variasi (untuk produk variable)
    const urlVar = `${WOOCOMMERCE_URL}/${productId}/variations?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
    console.log('Fetch URL variasi:', urlVar);
    const responseVar = await fetch(urlVar);
    const dataVar = await responseVar.json();
    console.log('Response WooCommerce (variasi):', dataVar);
    if (Array.isArray(dataVar) && dataVar.length > 0) {
      // Produk variable, ambil stok per size
      const stock = {};
      dataVar.forEach(variation => {
        const sizeAttr = variation.attributes.find(attr => attr.name.toLowerCase() === 'size');
        if (sizeAttr && sizeAttr.option) {
          stock[sizeAttr.option.toUpperCase()] = variation.stock_quantity || 0;
        }
      });
      return res.json(stock);
    } else {
      // Produk simple, ambil stok langsung
      const urlSimple = `${WOOCOMMERCE_URL}/${productId}?consumer_key=${CONSUMER_KEY}&consumer_secret=${CONSUMER_SECRET}`;
      console.log('Fetch URL simple:', urlSimple);
      const responseSimple = await fetch(urlSimple);
      const dataSimple = await responseSimple.json();
      console.log('Response WooCommerce (simple):', dataSimple);
      if (dataSimple && dataSimple.type === 'simple') {
        return res.json({ ALL: dataSimple.stock_quantity || 0 });
      } else {
        return res.status(404).json({ error: 'Produk tidak ditemukan di WooCommerce' });
      }
    }
  } catch (e) {
    console.error('Error saat ambil stok dari WooCommerce:', e);
    res.status(500).json({ error: 'Gagal mengambil stok dari WooCommerce', detail: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('WooCommerce stock API listening on port', PORT);
});