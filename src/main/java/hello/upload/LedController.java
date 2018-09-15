package hello.upload;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LedController {
    private static LedController ourInstance = new LedController();

    public static LedController getInstance() {
        return ourInstance;
    }

    private LedController() {
        leds = new HashMap<>();
    }


    private Map<Integer, LedPin> leds;

//    public LexiconEntryController() {
//
//    }

    public void setState(int pin, boolean state) {
        LedPin entry = leds.get(pin);

        if (entry == null) {
            entry = new LedPin(pin);

        }

        entry.setState(state);

        leds.put(pin, entry);
    }


    public List<LedPin> getAllLeds() {
        return new ArrayList<LedPin>(leds.values());
    }


}
