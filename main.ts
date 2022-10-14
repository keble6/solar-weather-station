function readTime () {
    date = "" + leadingZero(DS3231.date()) + "/" + leadingZero(DS3231.month()) + "/" + DS3231.year()
    time = "" + leadingZero(DS3231.hour()) + ":" + leadingZero(DS3231.minute())
    dateTimeString = "" + date + " " + time
}
function resetReadings () {
    count = 0
    dateTimeReadings = []
    Readings = []
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
function upload () {
    serial.writeValue("count", count)
    if (count > 0) {
        for (let index = 0; index <= count - 1; index++) {
            radio.sendString("" + dateTimeReadings[index] + ",")
            basic.pause(sendDelay)
            radio.sendString("" + (Readings[index]))
            basic.pause(sendDelay)
        }
    }
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
function makeWeatherReadings () {
    BME280.PowerOn()
    basic.pause(1000)
    PTH = "" + BME280.pressure(BME280_P.hPa) + "," + BME280.temperature(BME280_T.T_C) + "," + BME280.humidity()
    serial.writeLine(PTH)
    BME280.PowerOff()
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
        radio.sendString(dateTimeString)
    } else if (command.compare("st") == 0) {
        setTime(stringIn)
    } else if (command.compare("sd") == 0) {
        setDate(stringIn)
    } else if (command.compare("up") == 0) {
        serial.writeLine("#upload")
        upload()
    } else if (command.compare("xx") == 0) {
        serial.writeLine("#delete readings")
        resetReadings()
    }
})
let VDD = 0
let command = ""
let stringIn = ""
let PTH = ""
let params = ""
let Readings: string[] = []
let dateTimeReadings: string[] = []
let count = 0
let dateTimeString = ""
let time = ""
let date = ""
let sendDelay = 0
sendDelay = 100
let oneMinute = 60000
resetReadings()
radio.setGroup(1)
radio.setTransmitPower(7)
serial.writeLine("#starting")
loops.everyInterval(oneMinute, function () {
    if (DS3231.minute() % 30 == 0) {
        readTime()
        dateTimeReadings.push(dateTimeString)
        VDD = 1023 / pins.analogReadPin(AnalogPin.P0) * 1.26
        VDD = Math.round(VDD * 100) / 100
        makeWeatherReadings()
        Readings.push("" + VDD + "," + PTH)
        count += 1
        serial.writeLine("" + (VDD))
        serial.writeLine(dateTimeString)
    }
})
