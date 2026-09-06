"use strict";

const express = require("express");
const { EventEmitter } = require("events");
const { processImage } = require("./image-job");

const PORT = 4001;
const app = express();
app.use(express.json());

const jobBus = new EventEmitter();

jobBus.on("process-image", async ({ iterations }) => {
  await new Promise((resolve) => setImmediate(resolve));
  console.log(
    `[demo1] worker processing job (iterations=${iterations}, pid ${process.pid})`,
  );
  try {
    // heavy calculation
    const { ms } = await processImage({ iterations });
    console.log(`[demo1] job done in ${ms}ms`);
  } catch (err) {
    console.error(`[demo1] job failed: ${err.message}`);
  }
});

app.post("/process-image", (req, res) => {
  const iterations = Number(req.body.iterations) || 30;
  jobBus.emit("process-image", { iterations });
  res.status(202).json({ accepted: true });
});

app.get("/bing-bong", (req, res) => {
  res.type("text/plain").send("bing bong");
});

app.listen(PORT, () =>
  console.log(
    `[demo1] express listening on http://localhost:${PORT} (pid ${process.pid})`,
  ),
);
