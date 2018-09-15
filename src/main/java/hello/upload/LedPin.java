package hello.upload;

import com.pi4j.io.gpio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LedPin {

    private String name;
    private GpioPinDigitalOutput led;
    private Logger log = LoggerFactory.getLogger(this.getClass());

    public LedPin(int pinnumber) {
        final GpioController gpio = GpioFactory.getInstance();

        Pin pin = getPin(pinnumber);

        led = gpio.provisionDigitalOutputPin(pin);
        name = led.getName();

        log.info("the Led GPIO " + pinnumber + " is selected");

    }

    public void blink() {

        led.setState(false);
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        led.setState(true);


        for (int i = 0; i < 5; i++) {
            try {
                Thread.sleep(500);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

    public void setState(boolean state) {
        led.setState(state);
    }


    public boolean getState() {
        return led.getState().isHigh();
    }

    public void setDefaultState(boolean state) {
        //TODO
    }

    public String getName() {
        return name;
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
