import { AitumCC } from 'aitum.js'
import { DeviceType } from 'aitum.js/lib/enums'

async function flashLights(deviceName : string) {
    const lib = AitumCC.get().getAitumJS()
    const elgatoDevices = (await lib.getDevices(DeviceType.ELGATO))

    for (let i = 0; i < elgatoDevices.length; i++) {
        if (elgatoDevices[i].name == deviceName) {
            // Turn light off
            elgatoDevices[i].setState(false)

            // Sleep for 500ms
            await lib.sleep(500)

            // Turn light on
            elgatoDevices[i].setState(true)
            return
        }
    }
}

export default flashLights