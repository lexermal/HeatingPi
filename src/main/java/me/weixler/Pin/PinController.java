package me.weixler.Pin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class PinController {
    private static PinController ourInstance = new PinController();

    public static PinController getInstance() {
        return ourInstance;
    }

    private PinController() {
        leds = new HashMap<>();
    }


    private Map<Integer, GpioPin> leds;

    public void setState(int pin, boolean state) {
        GpioPin entry = leds.get(pin);

        if (entry == null) {
            entry = new GpioPin(pin);

        }

        entry.setState(state);

        leds.put(pin, entry);
    }


    public List<GpioPin> getAllLeds() {
        return new ArrayList<>(leds.values());
    }


}
