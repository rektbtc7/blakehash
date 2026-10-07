const API_URL = "https://mempool.kilombino.com/api/v1/mining/hashrate/1m";
const REFRESH_INTERVAL = 60000;
const REQUEST_TIMEOUT = 15000;

const hashrateValue = document.getElementById("hashrate-value");
const hashrateUnit = document.getElementById("hashrate-unit");
const status = document.getElementById("status");
const installButton = document.getElementById("installButton");
const instructions = document.getElementById("instructions");

function formatHashrate(hashrate) {
    const units = [
        { unit: "EH/s", value: 1e18 },
        { unit: "PH/s", value: 1e15 },
        { unit: "TH/s", value: 1e12 },
        { unit: "GH/s", value: 1e9 },
        { unit: "MH/s", value: 1e6 },
        { unit: "kH/s", value: 1e3 },
        { unit: "H/s", value: 1 }
    ];

    for (const item of units) {
        if (hashrate >= item.value) {
            return {
                value: (hashrate / item.value).toFixed(2),
                unit: item.unit
            };
        }
    }

    return {
        value: hashrate.toFixed(2),
        unit: "H/s"
    };
}

async function loadHashrate() {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, REQUEST_TIMEOUT);

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (
            !data ||
            typeof data.currentHashrate !== "number" ||
            !Number.isFinite(data.currentHashrate) ||
            data.currentHashrate <= 0
        ) {
            throw new Error("Invalid currentHashrate");
        }

        const formatted = formatHashrate(data.currentHashrate);

        hashrateValue.textContent = formatted.value;
        hashrateUnit.textContent = formatted.unit;
        status.textContent = "Updated just now";

        console.log("Kilombino network hashrate:", data.currentHashrate);

    } catch (error) {
        console.error("Hashrate update failed:", error);

        if (error.name === "AbortError") {
            status.textContent = "Request timed out";
        } else {
            status.textContent = "Unable to update data";
        }

    } finally {
        clearTimeout(timeout);
    }
}

function setupInstallInstructions() {
    if (!installButton || !instructions) {
        return;
    }

    installButton.addEventListener("click", () => {
        const isOpen = instructions.style.display === "block";

        instructions.style.display = isOpen ? "none" : "block";
    });
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    navigator.serviceWorker
        .register("/service-worker.js")
        .then(() => {
            console.log("Blake Hash service worker registered");
        })
        .catch(error => {
            console.error("Service worker registration failed:", error);
        });
}

setupInstallInstructions();
loadHashrate();

setInterval(loadHashrate, REFRESH_INTERVAL);

window.addEventListener("load", registerServiceWorker);
