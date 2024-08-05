const express = require("express");
const { exec } = require('child_process');
const cors = require('cors');
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
let k6Process = null;

app.listen(PORT, function () {
  console.log(`listening on port ${PORT}`);
});

app.use(cors());
app.use(express.json());

let intervalStarted = false;
const os = require("os");
let avg = 0;
let n = 2;

function cpuAverage() {
  let totalIdle = 0,
    totalTick = 0;
  let cpus = os.cpus();

  for (let i = 0, len = cpus.length; i < len; i++) {
    let cpu = cpus[i];
    for (type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return {
    idle: totalIdle / cpus.length,
    total: totalTick / cpus.length
  };
}

let startTimes = cpuAverage();

function startInterval() {
  setInterval(function () {
    let endTimes = cpuAverage();
    let idleDelta = endTimes.idle - startTimes.idle;
    let totalDelta = endTimes.total - startTimes.total;
    let percentageCPU = 100 - ~~(100 * idleDelta / totalDelta);
    avg = parseFloat((avg + (percentageCPU - avg) / n).toFixed(2));
    console.log(avg + "% CPU Usage.");
    startTimes = endTimes;
  }, 1000);
}

app.post('/start-stress-test', (req, res) => {
  if (k6Process) {
    return res.status(400).json({ message: 'Stress test already running.' });
  }

  const k6ScriptPath = path.join(__dirname, 'stress.js');
  k6Process = exec(`k6 run ${k6ScriptPath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing k6: ${error.message}`);
    }
    console.log(`k6 stdout: ${stdout}`);
    console.error(`k6 stderr: ${stderr}`);
  });

  res.json({ message: 'Stress test started.' });
});

app.post('/stop-stress-test', (req, res) => {
  if (!k6Process) {
    return res.status(400).json({ message: 'No stress test is running.' });
  }

  k6Process.kill('SIGINT');
  k6Process = null;
  res.json({ message: 'Stress test stopped.' });
});

app.get("/api", function (req, res) {
  if (!intervalStarted) {
    startInterval();
    intervalStarted = true;
  }

  res.json({
    message: "ok",
    data: {
      avg
    },
  });
});

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
