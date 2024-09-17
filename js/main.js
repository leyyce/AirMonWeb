let button;
let terminal;

window.onload = function () {
    button = document.getElementById("button");
    terminal = document.getElementById("terminal");
    button.addEventListener('click', connect)
}

function connect() {
    terminal_log("Trying to connect...");
    navigator.bluetooth.requestDevice({
        filters: [{
            services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"]
        }]
    })
        .then(device => {
            terminal_log(`Success! Connected to device ${device.name}.`);
            terminal_log("Connecting to GATT Server...");
            return device.gatt.connect();
        })
        .then(server => {
            terminal_log("Success!");
            return server.getPrimaryService("4fafc201-1fb5-459e-8fcc-c5c9c331914b");
        })
        .then(service => {
            return service.getCharacteristic("beb5483e-36e1-4688-b7f5-ea07361b26a8");
        })
        .then(characteristic => {
            terminal_log("Trying to subscribe to characteristic...");
            return characteristic.startNotifications();
        })
        .then(characteristic => {
            characteristic.addEventListener("characteristicvaluechanged", value_changed);
            terminal_log("Success! Listening for changes...");
        })
        .catch(error => { terminal_log(error) });
}

function value_changed(event) {
    const value = event.target.value;
    terminal_log(value.getUint32(0));
    terminal.scrollTop = terminal.scrollHeight;
}

function terminal_log(text) {
    terminal.value += text + "\n";
}