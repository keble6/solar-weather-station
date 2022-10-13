let VDD = 0
loops.everyInterval(1000, function () {
    VDD = 1023 / pins.analogReadPin(AnalogPin.P0) * 1.26
    basic.showNumber(VDD)
})
