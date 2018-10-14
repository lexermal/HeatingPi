package me.weixler.controller;

import com.pi4j.io.gpio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;

public class PinController {

    private HashMap<Integer, GpioPinDigitalOutput> leds = new HashMap<>();
    private int activePin;
    private Logger log = LoggerFactory.getLogger(this.getClass());
    final GpioController gpio = GpioFactory.getInstance();


    private static PinController ourInstance = new PinController();

    public static PinController getInstance(int pin) {
        ourInstance.activePin = pin;
        ourInstance.createPin(pin);
        return ourInstance;
    }


    private void createPin(int pinnumber) {

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
        return false; //TODO
    }

    public void setDefaultState(boolean state) {
        //TODO
    }

    private Pin getPin(int pinnumber) {
        pinnumber = pinConversion(pinnumber);
        Pin[] pins = RaspiPin.allPins();

        for (int i = 0; i < pins.length; i++) {
            if (pins[i].getAddress() == pinnumber) {
                return pins[i];
            }
        }

        return null;
    }

    public int pinConversion(int number) {
        return new int[]{13, 12, 3, 2, 0, 7, 9, 8}[number - 1];
    }


}
