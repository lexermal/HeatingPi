package me.weixler.controller;

import com.pi4j.io.gpio.*;

import java.util.HashMap;

public class PinController {
    private long activePin = 1;
    private final GpioController gpio = GpioFactory.getInstance();
    private HashMap<Long, GpioPinDigitalOutput> leds = new HashMap<>();

    private static PinController i = new PinController();

    public static PinController getInstance(long pin) {
        i.activePin = pin;

        i.leds.put(i.activePin, i.gpio.provisionDigitalOutputPin(i.getPin(pin)));

        return i;
    }

    public void setMode(boolean state) {
        leds.get(activePin).setState(state);
    }

    public boolean getMode() {
        return leds.get(activePin).getState().isHigh();
    }

    public boolean getDefaultMode() {
        return leds.get(activePin).getShutdownOptions().getState().isHigh();
    }

    public void setDefaultMode(boolean mode) {
        if (mode) {
            leds.get(activePin).setShutdownOptions(true, PinState.HIGH, PinPullResistance.PULL_UP);
        } else {
            leds.get(activePin).setShutdownOptions(true, PinState.LOW, PinPullResistance.OFF);
        }
    }

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
