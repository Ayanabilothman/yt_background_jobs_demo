"use strict";

const { Worker } = require("bullmq");
const { processImage } = require("./image-job");

const connection = { host: "127.0.0.1", port: 6379 };
const QUEUE = "demo3-image";

const worker = new Worker(
  QUEUE,
  async (job) => {
    console.log(`[demo3-worker] processing job ${job.id} (pid ${process.pid})`);
    return processImage({ iterations: job.data.iterations });
  },
  { connection },
);

worker.on("completed", (job, result) =>
  console.log(`[demo3-worker] job ${job.id} done in ${result.ms}ms`),
);
worker.on("failed", (job, err) =>
  console.error(`[demo3-worker] job ${job && job.id} failed: ${err.message}`),
);

console.log(`[demo3-worker] worker running (pid ${process.pid})`);
