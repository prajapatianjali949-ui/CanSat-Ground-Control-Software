let running = false;
let interval;

let altitude = 100;
let missionSeconds = 0;
let packetCount = 0;
let packetLoss = 0;
let missionPhase = "PRE-LAUNCH";

let tempData = [];
let altData = [];
let labels = [];

let gpsAvailable = true;
let payloadSeparated = true;
let parachuteActive = false;
let redundantActive = false;

let currentLat = 23.0225;
let currentLon = 72.5714;

/* =========================
   CHARTS
========================= */

const altChart = new Chart(
    document.getElementById("altChart"),
    {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Altitude (m)",
                data: altData,
                borderColor: "cyan",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }
);

const tempChart = new Chart(
    document.getElementById("tempChart"),
    {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: tempData,
                borderColor: "orange",
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    }
);

/* =========================
   LEAFLET MAP
========================= */

const map = L.map("map").setView(
    [currentLat, currentLon],
    15
);

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap"
    }
).addTo(map);

const marker = L.marker(
    [currentLat, currentLon]
).addTo(map);

const pathCoordinates = [
    [currentLat, currentLon]
];

const pathLine = L.polyline(
    pathCoordinates,
    {
        color: "red"
    }
).addTo(map);

/* =========================
   MISSION TIMER
========================= */

function updateMissionTime() {

    missionSeconds++;

    const hours =
        Math.floor(missionSeconds / 3600);

    const minutes =
        Math.floor(
            (missionSeconds % 3600) / 60
        );

    const seconds =
        missionSeconds % 60;

    document.getElementById(
        "missionTime"
    ).innerText =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}

/* =========================
   TELEMETRY
========================= */

function updateTelemetry() {

    const temp =
        (20 + Math.random() * 10).toFixed(2);

    const pressure =
        (1000 + Math.random() * 20).toFixed(2);

    altitude +=
        Math.floor(Math.random() * 5);

    const battery =
        (7 + Math.random()).toFixed(2);

    currentLat +=
        (Math.random() - 0.5) * 0.0005;

    currentLon +=
        (Math.random() - 0.5) * 0.0005;

    const roll =
        Math.floor(Math.random() * 360);

    const pitch =
        Math.floor(Math.random() * 180) - 90;

    const yaw =
        Math.floor(Math.random() * 360);

    packetCount++;

document.getElementById(
"packetCount"
).innerText = packetCount;

if (Math.random() < 0.03) {

    packetLoss++;

}
    document.getElementById("temp").innerText = temp;
    document.getElementById("pressure").innerText = pressure;
    document.getElementById("altitude").innerText = altitude;
    document.getElementById("battery").innerText = battery;

    document.getElementById("lat").innerText =
        currentLat.toFixed(5);

    document.getElementById("lon").innerText =
        currentLon.toFixed(5);

    document.getElementById("roll").innerText = roll;
    document.getElementById("pitch").innerText = pitch;
    document.getElementById("yaw").innerText = yaw;

    marker.setLatLng(
        [currentLat, currentLon]
    );

    pathCoordinates.push(
        [currentLat, currentLon]
    );

    pathLine.setLatLngs(
        pathCoordinates
    );

    const time =
        new Date().toLocaleTimeString();

    labels.push(time);
    tempData.push(temp);
    altData.push(altitude);

    if (labels.length > 20) {

        labels.shift();
        tempData.shift();
        altData.shift();
    }

    altChart.update();
    tempChart.update();

    const log =
        `${time},${temp},${pressure},${altitude},${battery}\n`;

    const logArea =
        document.getElementById("logArea");

    logArea.value += log;

    logArea.scrollTop =
        logArea.scrollHeight;

    updateErrorCode();

document.getElementById(
    "packetLost"
).innerText =
    packetLoss;

document.getElementById(
    "linkQuality"
).innerText =
    Math.max(
        0,
        100 -
        Math.round(
            (packetLoss /
            Math.max(packetCount,1))
            * 100
        )
    );
    updateSystemHealth();
    updateMissionPhase();
    updateLiveClock();
}

/* =========================
   Live Clock
========================= */

function updateLiveClock() {

    document.getElementById(
        "liveClock"
    ).innerText =
        new Date().toLocaleTimeString();
}

/* =========================
   ERROR CODE SYSTEM
========================= */

function updateErrorCode() {

    let code = "0000";

    const randomFault =
        Math.random();

    if (randomFault < 0.80) {

        code = "0000";

    } else if (randomFault < 0.86) {

        code = "1000";

    } else if (randomFault < 0.91) {

        code = "0100";

    } else if (randomFault < 0.96) {

        code = "0010";

    } else {

        code = "0001";
    }

    if (!gpsAvailable)
        code = "0100";

    if (!payloadSeparated)
        code = "0010";

    if (parachuteActive)
        code = "0001";

    const error =
        document.getElementById("errorCode");

    error.innerText = code;

    if (code === "0000") {

        error.style.color = "lime";

    } else {

        error.style.color = "red";
    }
}

/* =========================
   System Health
========================= */

function updateSystemHealth() {

    document.getElementById(
        "gpsHealth"
    ).innerText =
        gpsAvailable ? "OK" : "FAULT";

    document.getElementById(
        "batteryHealth"
    ).innerText =
        "OK";

    document.getElementById(
        "telemetryHealth"
    ).innerText =
        running ? "ACTIVE" : "IDLE";

    document.getElementById(
        "parachuteHealth"
    ).innerText =
        parachuteActive ?
        "DEPLOYED" :
        "READY";
}

/* =========================
   Mission Phase
========================= */

function updateMissionPhase() {

    let phase = "PRE-LAUNCH";

    if (missionSeconds < 15) {

        phase = "LAUNCH";

        document.getElementById(
            "payloadImage"
        ).src = "images/payload1.jpg";

        document.getElementById(
            "imageCaption"
        ).innerText =
            "Launch Vehicle Ignition";
    }

    else if (missionSeconds < 30) {

        phase = "DESCENT";

        document.getElementById(
            "payloadImage"
        ).src = "images/payload2.jpg";

        document.getElementById(
            "imageCaption"
        ).innerText =
            "Parachute Deployment";
    }

    else {

        phase = "LANDED";

        document.getElementById(
            "payloadImage"
        ).src = "images/payload3.jpg";

        document.getElementById(
            "imageCaption"
        ).innerText =
            "Payload Successfully Landed";
    }

    document.getElementById(
        "missionPhase"
    ).innerText = phase;
}

/* =========================
   BUTTONS
========================= */

document.getElementById("startBtn").onclick = () => {

    if (running) return;

    running = true;

    document.getElementById("status").innerText =
        "Telemetry Running";

    interval = setInterval(() => {

        updateTelemetry();
        updateMissionTime();
        updateMissionPhase();

    }, 1000);
};

document.getElementById("stopBtn").onclick = () => {

    running = false;

    clearInterval(interval);

    document.getElementById("status").innerText =
        "Telemetry Stopped";
};

document.getElementById("separateBtn").onclick = () => {

    payloadSeparated = true;

    document.getElementById("status").innerText =
        "Payload Separated Successfully";

    updateErrorCode();
};

document.getElementById("parachuteBtn").onclick = () => {

    parachuteActive = true;

    document.getElementById("status").innerText =
        "Emergency Parachute Activated";

    updateErrorCode();
};

document.getElementById("redundantBtn").onclick = () => {

    redundantActive = true;

    gpsAvailable = true;

    document.getElementById("status").innerText =
        "Redundant System Activated";

    updateErrorCode();
};

document.getElementById("syncBtn").onclick = () => {

    document.getElementById("status").innerText =
        "PC Time Synced : " +
        new Date().toLocaleTimeString();
};

document.getElementById("resetBtn").onclick = () => {

    clearInterval(interval);

    running = false;

    altitude = 100;
    missionSeconds = 0;

    tempData.length = 0;
    altData.length = 0;
    labels.length = 0;

    document.getElementById("logArea").value = "";

    document.getElementById("missionTime").innerText =
        "00:00:00";

    payloadSeparated = true;
    parachuteActive = false;
    redundantActive = false;
    gpsAvailable = true;

    altChart.update();
    tempChart.update();

    document.getElementById("status").innerText =
        "System Reset";

    updateErrorCode();
};

/* =========================
   CSV EXPORT
========================= */

document.getElementById("exportBtn").onclick = () => {

    const csvData =
        "Time,Temperature,Pressure,Altitude,Battery\n" +
        document.getElementById("logArea").value;

    const blob =
        new Blob(
            [csvData],
            { type: "text/csv" }
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "telemetry_log.csv";

    link.click();
};

document.getElementById(
    "reportBtn"
).onclick = () => {

    let report =
`CANSAT MISSION REPORT

Mission Time:
${document.getElementById("missionTime").innerText}

Packets Received:
${packetCount}

Packet Loss:
${packetLoss}

Final Altitude:
${altitude} m

Latitude:
${currentLat.toFixed(5)}

Longitude:
${currentLon.toFixed(5)}

Error Code:
${document.getElementById("errorCode").innerText}
`;

    const blob =
        new Blob(
            [report],
            {type:"text/plain"}
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "mission_report.txt";

    link.click();
};

/* =========================
  EXPORT Mission-report
========================= */

document.getElementById(
    "reportBtn"
).onclick = () => {

    let report =
`CANSAT MISSION REPORT

Mission Time:
${document.getElementById("missionTime").innerText}

Packets Received:
${packetCount}

Packet Loss:
${packetLoss}

Final Altitude:
${altitude} m

Latitude:
${currentLat.toFixed(5)}

Longitude:
${currentLon.toFixed(5)}

Error Code:
${document.getElementById("errorCode").innerText}
`;

    const blob =
        new Blob(
            [report],
            {type:"text/plain"}
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "mission_report.txt";

    link.click();
};

/* =========================
   GRAPH EXPORT
========================= */

document.getElementById("graphBtn").onclick = () => {

    let link1 = document.createElement("a");

    link1.href = altChart.toBase64Image();

    link1.download = "altitude_graph.png";

    link1.click();

    setTimeout(() => {

        let link2 = document.createElement("a");

        link2.href = tempChart.toBase64Image();

        link2.download = "temperature_graph.png";

        link2.click();

    }, 500);

};

/* =========================
   CAMERA
========================= */

document.getElementById("cameraBtn").onclick =
async () => {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: true
            });

        document.getElementById("camera").srcObject =
            stream;

        document.getElementById("status").innerText =
            "Camera Connected";

    } catch (error) {

        alert("Camera access denied.");

        console.error(error);
    }
};

updateErrorCode();
updateSystemHealth();
updateMissionPhase();
updateLiveClock();

setInterval(
    updateLiveClock,
    1000
);