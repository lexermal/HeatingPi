package me.weixler.controller;

import com.pi4j.io.gpio.*;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;

public class PinController {
    private long activePin = 1;
    private Logger logger = LoggerFactory.getLogger(this.getClass());
    private final GpioController gpio = GpioFactory.getInstance();
    private HashMap<Long, GpioPinDigitalOutput> leds = new HashMap<>();

    private static PinController i = new PinController();

    public static PinController getInstance(long pin) {
        i.activePin = pin;

        if (!i.leds.containsKey(pin)) {
            i.leds.put(i.activePin, i.gpio.provisionDigitalOutputPin(i.getPin(pin)));
        }

        return i;
    }

    public void setMode(boolean state) {
        logger.info("Set mode of pin " + activePin + " to " + (!state ? "on" : "off"));
        leds.get(activePin).setState(!state); //segation because up is off und down is on
    }

    public boolean getMode() {
        boolean mode = !leds.get(activePin).getState().isHigh(); //because is high is off on the controller
        logger.info("Mode of pin " + activePin + " is " + (mode ? "on" : "off"));
        return mode;
    }

    public void setShutdownMode(boolean mode) {
        logger.info("Set shutdown mode of pin " + activePin + " to " + (mode ? "on" : "off"));
        if (mode) {
            leds.get(activePin).setShutdownOptions(true, PinState.HIGH, PinPullResistance.PULL_UP);
        } else {
            leds.get(activePin).setShutdownOptions(true, PinState.LOW, PinPullResistance.OFF);
        }
    }

    @Nullable
    private Pin getPin(long pinnumber) {
        pinnumber = pinConversion(pinnumber);
        Pin[] pins = RaspiPin.allPins();

        for (Pin pin : pins) {
            if (pin.getAddress() == pinnumber) {
                return pin;
            }
        }
        return null;
    }

    private int pinConversion(long number) {
        return new int[]{13, 12, 3, 2, 0, 7, 9, 8}[(int) (number - 1)];
    }


}
