package me.weixler.controller;

import com.pi4j.io.gpio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;

public class PinController {

    private HashMap<Long, GpioPinDigitalOutput> leds = new HashMap<>();
    private long activePin;
    private Logger log = LoggerFactory.getLogger(this.getClass());
    final GpioController gpio = GpioFactory.getInstance();


    private static PinController ourInstance = new PinController();

    public static PinController getInstance(long pin) {
        ourInstance.activePin = pin;
        ourInstance.createPin(pin);
        return ourInstance;
    }

    private void createPin(long pinnumber) {

        Pin pin = getPin(pinnumber);

        leds.put(activePin, gpio.provisionDigitalOutputPin(pin));

        log.info("the Led GPIO " + pinnumber + " is selected");

    }

    public void setState(boolean state) {
        leds.get(activePin).setState(state);
    }

    public boolean getState() {
        return leds.get(activePin).getState().isHigh();
    }

    public boolean getDefaultState() {
        return leds.get(activePin).getShutdownOptions().getState().isHigh();
    }

    public void setDefaultState(boolean state) {
        if (state) {
            leds.get(activePin).setShutdownOptions(true, PinState.HIGH, PinPullResistance.PULL_UP);
        } else {
            leds.get(activePin).setShutdownOptions(true, PinState.LOW, PinPullResistance.OFF);
        }
    }

    private Pin getPin(long pinnumber) {
        pinnumber = pinConversion(pinnumber);
        Pin[] pins = RaspiPin.allPins();

        for (int i = 0; i < pins.length; i++) {
            if (pins[i].getAddress() == pinnumber) {
                return pins[i];
            }
        }
        return null;
    }

    public int pinConversion(long number) {
        return new int[]{13, 12, 3, 2, 0, 7, 9, 8}[(int) (number - 1)];
    }


}
