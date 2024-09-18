const serviceUuid = "ba59dd58-afe1-4ae0-a151-802a39967e89";
const bme680CharacteristicUuid = "93260fdf-3636-4809-8abc-214217dd419e";
const ccs811CharacteristicUuid = "99603130-0509-4dd7-af3a-bfff45cc1467";
const sgp30CharacteristicUuid = "6dccd7a8-3452-4802-9555-0e020f0d8047";
const decoder = new TextDecoder('utf-8');

let button;

window.onload = function () {
    button = document.getElementById("connect");
    button.addEventListener('click', connect)
}

async function connect() {
    try {
        console.log("Requesting device...");
        const device = await navigator.bluetooth.requestDevice({
            filters: [{
                services: [serviceUuid]
            }]
        });
        console.log('Connecting to GATT Server...');
        device.addEventListener('gattserverdisconnected', onDisconnected);
        const server = await device.gatt.connect();
        console.log('Getting Service...');
        const service = await server.getPrimaryService(serviceUuid);
        console.log('Getting BME680 Characteristic...');
        const bme680Characteristic = await service.getCharacteristic(bme680CharacteristicUuid);
        console.log('Getting CCS811 Characteristic...');
        const ccs811Characteristic = await service.getCharacteristic(ccs811CharacteristicUuid);
        console.log('Getting SGP30 Characteristic...');
        const sgp30Characteristic = await service.getCharacteristic(sgp30CharacteristicUuid);
        await bme680Characteristic.startNotifications();
        await ccs811Characteristic.startNotifications();
        await sgp30Characteristic.startNotifications();
        document.getElementById("connection_status").innerText = "Connected";
        bme680Characteristic.addEventListener("characteristicvaluechanged", bme680ValueChanged);
        ccs811Characteristic.addEventListener("characteristicvaluechanged", ccs811ValueChanged);
        sgp30Characteristic.addEventListener("characteristicvaluechanged", sgp30ValueChanged);
        console.log("Success! Listening for changes...");
    } catch (error) { console.log(error); }
}

function bme680ValueChanged(event) {
    const value = event.target.value;
    const valueString = decoder.decode(value);
    const tokens = valueString.split(";")
    console.log(valueString);
    if (tokens.length > 1) {
        document.getElementById("bme680_iaq").innerText = tokens[0];
        document.getElementById("bme680_iaq_accuracy").innerText = accuracyNumToString(parseInt(tokens[1]));
        document.getElementById("bme680_co2_equivalent").innerText = tokens[2] + "ppm";
        document.getElementById("bme680_breath_voc_equivalent").innerText = tokens[3] + "ppm";
        document.getElementById("bme680_run_in_Status").innerText = ["Ongoing", "Finished"][parseInt(tokens[4])];
        document.getElementById("bme680_temperature").innerText = tokens[5] + "°C";
        document.getElementById("bme680_humidity").innerText = tokens[6] + "%";
    } else {
        document.getElementById("bme680_iaq").innerText = tokens[0];
        document.getElementById("bme680_iaq_accuracy").innerText = tokens[0];
        document.getElementById("bme680_co2_equivalent").innerText = tokens[0];
        document.getElementById("bme680_breath_voc_equivalent").innerText = tokens[0];
        document.getElementById("bme680_run_in_Status").innerText = tokens[0];
        document.getElementById("bme680_temperature").innerText = tokens[0];
        document.getElementById("bme680_humidity").innerText = tokens[0];
    }
}

function ccs811ValueChanged(event) {
    const value = event.target.value;
    const valueString = decoder.decode(value);
    const tokens = valueString.split(";")
    console.log(valueString);
    if (tokens.length > 1) {
        document.getElementById("ccs811_eco2").innerText = tokens[0] + "ppm";
        document.getElementById("ccs881_tvoc").innerText = tokens[1] + "ppb";
    } else {
        document.getElementById("ccs811_eco2").innerText = tokens[0];
        document.getElementById("ccs881_tvoc").innerText = tokens[0];
    }
}

function sgp30ValueChanged(event) {
    const value = event.target.value;
    const valueString = decoder.decode(value);
    const tokens = valueString.split(";")
    console.log(valueString);
    if (tokens.length > 1) {
        document.getElementById("sgp30_eco2").innerText = tokens[0] + "ppm";
        document.getElementById("sgp30_tvoc").innerText = tokens[1] + "ppb";
    } else {
        document.getElementById("sgp30_eco2").innerText = tokens[0];
        document.getElementById("sgp30_tvoc").innerText = tokens[0];
    }
}

function onDisconnected(event) {
    document.getElementById("connection_status").innerText = "Disconnected";
    console.log(`Device ${event.target.name} disconnected`);
}

function accuracyNumToString(num) {
    switch (num) {
        case 0: return "none";
        case 1: return "low";
        case 2: return "average";
        default: return "high";
    }
}