import { AitumCC } from 'aitum.js'
import { DeviceType } from 'aitum.js/lib/enums'
import { IntInput } from 'aitum.js/lib/inputs'
import { BooleanInput, StringInput } from 'aitum.js/lib/inputs'
import { ICCActionInputs, ICustomCode } from 'aitum.js/lib/interfaces'

/*********** CONFIG ***********/
// The custom code action name
const name: string = 'Stream MVP'
const STREAM_MVP_GLOBAL_VAR = 'CurrentStreamMVP'
let lastAnnouncement : Date

// The custom code inputs
const inputs: ICCActionInputs = {
  username: new StringInput('Username', { required: true }),
  message: new StringInput('Chat Message', { required: true }),
  doAnnouncement: new BooleanInput('Announce MVP Message?', { required: true }),
  announcementCooldown: new IntInput('Seconds between MVP announcements', { required: true, minValue: 0 })
}

type Params = {
  doAnnouncement: boolean
  username: string
  message: string
  announcementCooldown: number
}

// The code executed.
async function method(params: Params) {
  var mvpUsername = ""
  const lib = AitumCC.get().getAitumJS()
  const twitch = (await lib.getDevices(DeviceType.TWITCH))[0]

  // Get global variables
  const globalVars = await lib.aitum.getGlobalVariables()
  globalVars.forEach((item) => {
    // Find the stream mvp global variable
    if (item.name == STREAM_MVP_GLOBAL_VAR) {
      mvpUsername = item.value as string
    }
  })

  // Ignore if not the MVP
  if (mvpUsername.toLowerCase() !== params.username.toLowerCase()) {
    return
  }

  // Send announcement
  if (params.doAnnouncement) {
    chatAnnouncement(twitch, params, `Stream MVP has spoken: ${params.message}`)
  }
}

/**
 * Send a chat announcement
 * 
 * @param twitch Instance of TwitchDevice
 * @param inputs Inputs from the action
 * @param message Message to announce
 */
async function chatAnnouncement(twitch: any, inputs: Params, message: string) {
    // Enable a cooldown between chat announcements
    if (lastAnnouncement !== undefined && inputs.announcementCooldown > 0) {
      // If last announcement time is less then cooldownSeconds, do not send the announcement
      const secondsSinceLastAnnouncement = (new Date().getTime() - lastAnnouncement.getTime()) / 1000
      if (secondsSinceLastAnnouncement < inputs.announcementCooldown) {
        // console.log(`Skipping announcement due to cooldown. Next announcement eligible in ${inputs.announcementCooldown - secondsSinceLastAnnouncement} seconds`)
        return
      }
    }

    await twitch.announcement(message)
    lastAnnouncement = new Date()
}

/*********** DON'T EDIT BELOW ***********/
export default { name, inputs, method } as ICustomCode