import fs from "fs";
import rpio from "rpio";
import Log from "../utils/Logger";
import { Pin } from "./handler/PinHandler";
import { GPIO_PINS } from "./CustomConfig";

export default class PinAccess {
    private log = Log.getInstance();
    private static instance: PinAccess;
    private initializedPins = [] as number[];

    public static getInstance() {
        if (!this.instance) {
            this.instance = new this();

            this.initPins();
        }
        return this.instance;
    }

    public static getPins(): Pin[] {
        return GPIO_PINS.map((goio, index) => ({
            name: `Pin ${index + 1}`,
            gpioPin: goio,
            id: index + 1,
            activeByDefault: false,
            active: false
        }));
    }

    private initPin(pin: Pin) {
        try {
            rpio.open(pin.gpioPin, rpio.OUTPUT, pin.activeByDefault ? rpio.HIGH : rpio.LOW);
            this.initializedPins.push(pin.gpioPin);
        } catch (e) {
            this.log.error(`Could not initialize pin ${pin.id} because ${e.message}`);
        }
    }

    public setState(pinNr: number, state: boolean) {
        const pin = PinAccess.getPins().filter((value) => value.id === Number(pinNr))[0];

        rpio.write(pin.gpioPin, state ? rpio.LOW : rpio.HIGH);
        this.log.info(`Set state of pin ${pin.id} to ${Number(!state)}.`);
    }

    public static isRaspi(): boolean {
        const PI_MODEL_NO = [
            "BCM2708",
            "BCM2709",
            "BCM2710",
            "BCM2835", // Raspberry Pi 1 and Zero
            "BCM2836", // Raspberry Pi 2
            "BCM2837", // Raspberry Pi 3 (and later Raspberry Pi 2)
            "BCM2837B0", // Raspberry Pi 3B+ and 3A+
            "BCM2711" // Raspberry Pi 4B
        ];
        let cpuInfo;

        try {
            cpuInfo = fs.readFileSync("/proc/cpuinfo", { encoding: "utf8" });
        } catch (e) {
            return false;
        }

        const model = cpuInfo
            .split("\n")
            .map((line) => line.replace(/\t/g, ""))
            .filter(({ length }) => length > 0)
            .map((line) => line.split(":"))
            .map((pair) => pair.map((entry) => entry.trim()))
            .filter((pair) => pair[0] === "Hardware");

        if (!model || model.length === 0) {
            return false;
        }

        return PI_MODEL_NO.includes(model[0][1]);
    }

    private static initPins() {
        let options: any;
        if (!PinAccess.isRaspi()) {
            options = { mock: "raspi-b" } as any;
            this.instance.log.warn("The gpio access is simulated.");
        }
        rpio.init(options);

        this.getPins().forEach((pin) => this.instance.initPin(pin));
        this.instance.log.info("Initialized all pins.");
    }
}
