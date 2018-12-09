package me.weixler.beans;

public class InputState {

    private long mode;
    private long pinid;

    public InputState() {
    }

    public long getPinid() {
        return pinid;
    }

    public void setPinid(long pinid) {
        this.pinid = pinid;
    }

    public long getMode() {
        return mode;
    }

    public void setMode(long mode) {
        this.mode = mode;
    }
}
