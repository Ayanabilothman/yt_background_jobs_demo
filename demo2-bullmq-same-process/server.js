"use strict";

const express = require("express");
const { Queue, Worker } = require("bullmq");
const { processImage } = require("./image-job");

const PORT = 4002;
const connection = { host: "127.0.0.1", port: 6379 };
const QUEUE = "demo2-image";

const app = express();
app.use(express.json());

const queue = new Queue(QUEUE, { connection });

const worker = new Worker(
  QUEUE,
  async (job) => {
    console.log(`[demo2] worker processing job ${job.id} (pid ${process.pid})`);
    return processImage({ iterations: job.data.iterations });
  },
  { connection },
);

worker.on("completed", (job, result) =>
  console.log(`[demo2] job ${job.id} done in ${result.ms}ms`),
);
worker.on("failed", (job, err) =>
  console.error(`[demo2] job ${job && job.id} failed: ${err.message}`),
);

app.post("/process-image", async (req, res) => {
  const iterations = Number(req.body.iterations) || 30;
  await queue.add("process", { iterations });
  res.status(202).json({ accepted: true });
});

app.get("/bing-bong", (req, res) => {
  res.type("text/plain").send("bing bong");
});

app.listen(PORT, () =>
  console.log(
    `[demo2] express + worker in ONE process on http://localhost:${PORT} (pid ${process.pid})`,
  ),
);
