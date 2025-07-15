import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Retell AI Backend Server is running!",
    timestamp: new Date().toISOString(),
    env_check: process.env.RETELL_API_KEY ? "API key found" : "API key missing",
  });
});

// Create web call endpoint using direct API call
app.post("/create-web-call", async (req, res) => {
  try {
    console.log("Creating web call...");

    // Direct API call to Retell instead of using SDK
    const response = await fetch(
      "https://api.retellai.com/v2/create-web-call",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: "agent_9a6541b488b85e0ffce404b353",
          ...req.body,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Retell API error: ${response.status} ${response.statusText}`
      );
    }

    const webCallResponse = await response.json();

    console.log("Web call created successfully:", webCallResponse.call_id);

    // Return the access token and call details
    res.json({
      success: true,
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id,
    });
  } catch (error) {
    console.error("Error creating web call:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create web call",
    });
  }
});

app.options("*", cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
