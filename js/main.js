const decoder = new TextDecoder('utf-8');

let button;
let terminal;

window.onload = function () {
    button = document.getElementById("button");
    terminal = document.getElementById("terminal");
    button.addEventListener('click', connect)
}

function connect() {
    terminalLog("Trying to connect...");
    navigator.bluetooth.requestDevice({
        filters: [{
            services: ["ba59dd58-afe1-4ae0-a151-802a39967e89"]
        }]
    })
        .then(device => {
            terminalLog(`Success! Connected to device ${device.name}.`);
            terminalLog("Connecting to GATT Server...");
            device.addEventListener('gattserverdisconnected', onDisconnected);
            return device.gatt.connect();
        })
        .then(server => {
            terminalLog("Success!");
            return server.getPrimaryService("ba59dd58-afe1-4ae0-a151-802a39967e89");
        })
        .then(service => {
            return service.getCharacteristic("93260fdf-3636-4809-8abc-214217dd419e");
        })
        .then(characteristic => {
            terminalLog("Trying to subscribe to characteristic...");
            return characteristic.startNotifications();
        })
        .then(characteristic => {
            characteristic.addEventListener("characteristicvaluechanged", valueChanged);
            terminalLog("Success! Listening for changes...");
        })
        .catch(error => { terminalLog(error) });
}

function valueChanged(event) {
    const value = event.target.value;
    // terminalLog(value.getUint32(0));
    const valueString = decoder.decode(value);
    terminalLog(valueString);
    terminal.scrollTop = terminal.scrollHeight;
}

function onDisconnected(event) {
    terminalLog(`Device ${event.target.name} disconnected`);
}

function terminalLog(text) {
    terminal.value += text + "\n";
}