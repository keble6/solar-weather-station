function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTimeString = "" + date + " " + time
}
function leadingZero (num: number) {
    if (num < 10) {
        return "0" + num
    } else {
        return convertToText(num)
    }
}
function setDate (text: string) {
    params = text.substr(2, text.length - 2)
    DS3231.dateTime(
    parseFloat(params.substr(4, 4)),
    parseFloat(params.substr(2, 2)),
    parseFloat(params.substr(0, 2)),
    DS3231.day(),
    DS3231.hour(),
    DS3231.minute(),
    DS3231.second()
    )
}
function setTime (text: string) {
    params = text.substr(2, text.length - 2)
    DS3231.dateTime(
    DS3231.year(),
    DS3231.month(),
    DS3231.date(),
    DS3231.day(),
    parseFloat(params.substr(0, 2)),
    parseFloat(params.substr(2, 2)),
    0
    )
}
radio.onReceivedString(function (receivedString) {
    stringIn = receivedString
    command = stringIn.substr(0, 2)
    // upload()
    // resetReadings()
    // ack = true
    if (command.compare("rt") == 0) {
        serial.writeLine("#readtime")
        readTime()
        radio.sendString("r" + dateTimeString)
    } else if (command.compare("st") == 0) {
        setTime(stringIn)
    } else if (command.compare("sd") == 0) {
        setDate(stringIn)
    } else if (command.compare("up") == 0) {
        serial.writeLine("#upload")
    } else if (command.compare("xx") == 0) {
        serial.writeLine("#delete readings")
    }
})
let VDD = 0
let command = ""
let stringIn = ""
let params = ""
let dateTimeString = ""
let time = ""
let date = ""
let oneMinute = 60000
radio.setGroup(1)
radio.setTransmitPower(7)
serial.writeLine("#starting")
loops.everyInterval(oneMinute, function () {
    if (DS3231.minute() % 1 == 0) {
        readTime()
        VDD = 1023 / pins.analogReadPin(AnalogPin.P0) * 1.26
        VDD = Math.round(VDD * 100) / 100
        serial.writeLine("" + (VDD))
        serial.writeLine(dateTimeString)
    }
})
