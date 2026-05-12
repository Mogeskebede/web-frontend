const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Local fallback URLs for development
const ORDERS_SERVICE_URL =
    process.env.ORDERS_SERVICE_URL || "http://localhost:8000";

const INVENTORY_SERVICE_URL =
    process.env.INVENTORY_SERVICE_URL || "http://localhost:5000";

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Orders Platform</title>

      <style>
          body {
              margin: 0;
              padding: 0;
              font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: linear-gradient(135deg, #4f46e5, #3b82f6);
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #333;
          }

          .card {
              background: #ffffff;
              width: 420px;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.15);
              text-align: center;
              animation: fadeIn 0.8s ease;
          }

          h1 {
              margin-bottom: 10px;
              font-size: 28px;
              color: #1f2937;
          }

          p {
              margin-top: 0;
              margin-bottom: 25px;
              color: #6b7280;
              font-size: 16px;
          }

          button {
              background: #4f46e5;
              color: white;
              border: none;
              padding: 14px 26px;
              font-size: 16px;
              border-radius: 8px;
              cursor: pointer;
              transition: 0.25s ease;
              font-weight: 600;
          }

          button:hover {
              background: #4338ca;
              transform: translateY(-2px);
              box-shadow: 0 6px 15px rgba(0,0,0,0.2);
          }

          footer {
              margin-top: 25px;
              font-size: 13px;
              color: #9ca3af;
          }

          @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
      </style>
  </head>

  <body>
      <div class="card">
          <h1>Orders Platform</h1>
          <p>Create a demo order and test the full microservices workflow.</p>

          <form method="post" action="/demo-order">
              <button type="submit">Create Demo Order</button>
          </form>

          <footer>
              Designed & Developed by <strong>Moges K</strong>
          </footer>
      </div>
  </body>
  </html>
  `);
});

app.post("/demo-order", async(req, res) => {
    try {
        const order = {
            id: "order-" + Date.now(),
            product_id: "p1",
            quantity: 1,
        };

        const response = await axios.post(`${ORDERS_SERVICE_URL}/orders`, order, {
            timeout: 5000,
        });

        res.json({
            message: "Demo order created via frontend",
            backend_response: response.data,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to create order" });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Web frontend listening on port ${port}`);
});