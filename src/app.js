const express = require("express");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ORDERS_SERVICE_URL =
    process.env.ORDERS_SERVICE_URL || "http://orders-service:8000";

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
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .container {
            width: 100%;
            max-width: 500px;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.2);
            text-align: center;
        }

        .logo {
            font-size: 64px;
            margin-bottom: 20px;
        }

        h1 {
            color: #111827;
            margin-bottom: 12px;
            font-size: 36px;
        }

        p {
            color: #6b7280;
            margin-bottom: 30px;
            font-size: 16px;
            line-height: 1.6;
        }

        .card {
            background: #f9fafb;
            border-radius: 14px;
            padding: 24px;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
        }

        .card h2 {
            color: #1f2937;
            margin-bottom: 10px;
        }

        .status {
            display: inline-block;
            padding: 8px 14px;
            background: #dcfce7;
            color: #166534;
            border-radius: 999px;
            font-weight: bold;
            margin-top: 10px;
        }

        button {
            width: 100%;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            color: white;
            border: none;
            padding: 16px;
            font-size: 18px;
            font-weight: bold;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.25s ease;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(37,99,235,0.35);
        }

        .footer {
            margin-top: 25px;
            color: #9ca3af;
            font-size: 14px;
        }

        .tech-stack {
            margin-top: 25px;
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }

        .badge {
            background: #eef2ff;
            color: #4338ca;
            padding: 8px 12px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <div class="container">

        <div class="logo">🚀</div>

        <h1>Orders Platform</h1>

        <p>
            Modern cloud-native microservices application running on Kubernetes & AWS EKS.
        </p>

        <div class="card">
            <h2>Create Demo Order</h2>
            <p>
                Click the button below to test the complete workflow:
                Frontend → Orders API → Inventory API
            </p>

            <div class="status">
                System Healthy
            </div>
        </div>

        <form method="POST" action="/demo-order">
            <button type="submit">
                Create Demo Order
            </button>
        </form>

        <div class="tech-stack">
            <div class="badge">Node.js</div>
            <div class="badge">FastAPI</div>
            <div class="badge">Flask</div>
            <div class="badge">Docker</div>
            <div class="badge">Kubernetes</div>
            <div class="badge">AWS EKS</div>
        </div>

        <div class="footer">
            Designed & Developed by Moges K
        </div>

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

        const response = await axios.post(
            `${ORDERS_SERVICE_URL}/orders`,
            order, {
                timeout: 5000,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Order Created</title>
</head>
<body style="font-family:Arial;background:#10b981;color:white;text-align:center;padding-top:100px;">
    <h1>Order Created Successfully</h1>

    <pre style="background:white;color:black;padding:20px;border-radius:10px;display:inline-block;text-align:left;">
${JSON.stringify(response.data, null, 2)}
    </pre>

    <br/><br/>
    <a href="/" style="color:white;">Back Home</a>
</body>
</html>
        `);

    } catch (err) {
        const errorDetails =
            (err.response && err.response.data) || err.message;
        console.error("ORDER ERROR:", errorDetails);

        res.status(500).send(`
<!DOCTYPE html>
<html>
<head>
    <title>Order Failed</title>
</head>
<body style="font-family:Arial;background:#ef4444;color:white;text-align:center;padding-top:100px;">
    <h1>Failed To Create Order</h1>

    <pre style="background:white;color:black;padding:20px;border-radius:10px;display:inline-block;text-align:left;">
${JSON.stringify(err.response?.data || err.message, null, 2)}
    </pre>

    <br/><br/>
    <a href="/" style="color:white;">Back Home</a>
</body>
</html>
        `);
    }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Frontend running on port ${port}`);
});