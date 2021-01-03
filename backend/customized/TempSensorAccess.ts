import sensor from "ds18b20-raspi";

export default function readTemperature(simulated: boolean) {
    if (simulated) {
        const min = 10;
        const max = 25;
        return Math.random() * (max - min) + min;
    }

    return sensor.readSimpleC();
}
