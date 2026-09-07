const API_URL = "https://mempool.guide/api/v1/mining/hashrate/1m";

const hashrateValue = document.getElementById("hashrate-value");
const hashrateUnit = document.getElementById("hashrate-unit");
const status = document.getElementById("status");

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
        value: "0.00",
        unit: "H/s"
    };
}

async function loadHashrate() {
    try {
        status.textContent = "Loading...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        if (
            typeof data.currentHashrate !== "number" ||
            !Number.isFinite(data.currentHashrate)
        ) {
            throw new Error("Invalid hashrate data");
        }

        const formatted = formatHashrate(data.currentHashrate);

        hashrateValue.textContent = formatted.value;
        hashrateUnit.textContent = formatted.unit;
        status.textContent = "Updated just now";
    } catch (error) {
        console.error("Unable to load network hashrate:", error);

        hashrateValue.textContent = "--";
        hashrateUnit.textContent = "PH/s";
        status.textContent = "Unable to load data";
    }
}

loadHashrate();
