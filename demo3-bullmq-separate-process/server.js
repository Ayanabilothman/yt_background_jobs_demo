"use strict";

const express = require("express");
const { Queue } = require("bullmq");

const PORT = 4003;
const connection = { host: "127.0.0.1", port: 6379 };
const QUEUE = "demo3-image";

const app = express();
app.use(express.json());

const queue = new Queue(QUEUE, { connection });

app.post("/process-image", async (req, res) => {
  const iterations = Number(req.body && req.body.iterations) || 1;
  await queue.add("process", { iterations });
  res.status(202).json({ accepted: true });
});

app.get("/bing-bong", (req, res) => {
  res.type("text/plain").send("bing bong");
});

app.listen(PORT, () =>
  console.log(
    `[demo3] express listening on http://localhost:${PORT} (pid ${process.pid})`,
  ),
);
