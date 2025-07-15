require("dotenv").config({ override: true, debug: true });
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/llm", require("./routes/llm"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend live at ${PORT}`));
