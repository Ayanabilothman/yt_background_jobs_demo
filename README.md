# Background job strategies behind Express

Three tiny Express apps that expose **the exact same two endpoints**:

| Method | Path             | What it does                                                                                                                                                                                                                                                                                                                             |
| ------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/process-image` | Runs **real** image processing on the bundled sample image (Jimp: resize → blur → greyscale → contrast → posterize → PNG encode, `iterations` times) as a background job. Optional body `{ "iterations": 30 }` controls how much CPU work the job does (default `1`); send no body at all and it still runs. Responds `202` immediately. |
| `GET`  | `/bing-bong`     | Returns the text `bing bong`. Used to probe whether the event loop is still responsive.                                                                                                                                                                                                                                                  |

| Demo | Folder                           | Port | Background job mechanism                                             |
| ---- | -------------------------------- | ---- | -------------------------------------------------------------------- |
| 1    | `demo1-eventemitter/`            | 4001 | Node `EventEmitter` triggers the job — same process, same event loop |
| 2    | `demo2-bullmq-same-process/`     | 4002 | `BullMQ`, worker created **in the Express process**                  |
| 3    | `demo3-bullmq-separate-process/` | 4003 | `BullMQ`, worker runs as a **separate process** (`worker.js`)        |

## Setup

```bash
npm install
```

(Installs dependencies for all three demos via npm workspaces.)

Demos 2 and 3 need Redis:

```bash
docker run --rm -p 6379:6379 redis:7
```

## Run the demos manually

```bash
npm run start:demo1
npm run start:demo2
npm run start:demo3
# demo 3 also needs its worker, in a separate terminal:
npm run worker:demo3
```

Then fire the requests in [`requests.http`](requests.http). While a `POST /process-image`
is running, hit the matching `GET /bing-bong`:

- **Demo 1 & 2** — `/bing-bong` hangs for the whole job; the CPU-heavy Jimp code
  is running on the same event loop as Express.
- **Demo 3** — `/bing-bong` answers instantly; the work is on another process.

Each process logs its `pid` on startup and when it processes a job. Demo 2 shows
the **same** pid for Express and the worker; Demo 3 shows **two different** pids.

### Takeaway

A queue (BullMQ) gives you durability, retries and visibility — but if the
worker shares the Express process, CPU-bound work still blocks the event loop.
Only moving the worker to its own process (Demo 3), a `worker_thread`, or a
process pool actually keeps the API responsive under load.

# License

Copyright © 2026 Aya Nabil Othman. All rights reserved.

This repository is provided for educational and demonstration purposes only.

You may view, clone, and run the code for personal learning.

You may not copy, redistribute, republish, sublicense, or use this code or substantial portions of it in commercial products, paid courses, tutorials, training programs, workshops, or other paid content without prior written permission.
