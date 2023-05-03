import { AitumCC } from 'aitum.js'
import { DeviceType } from 'aitum.js/lib/enums'
import { StringInput } from 'aitum.js/lib/inputs'
import { ICCActionInputs, ICustomCode } from 'aitum.js/lib/interfaces'

/*********** CONFIG ***********/
// The custom code action name
const name: string = 'Set Stream MVP'
const STREAM_MVP_GLOBAL_VAR = 'CurrentStreamMVP'

// The custom code inputs
const inputs: ICCActionInputs = {
  chatInput: new StringInput('Chat Message', { required: true })
}

// The code executed.
async function method(inputs: { [key: string]: string }) {
  var currentMVP = ""
  var currentMVPGlobalVarId = ""

  const lib = AitumCC.get().getAitumJS()
  const twitch = (await lib.getDevices(DeviceType.TWITCH))[0]

  // Validate message starts with !mvp
  if (!inputs.chatInput.match(/^!mvp .+/)) {
    return
  }
  
  // Extract username (removes "!mvp " prefix)
  const mvp = inputs.chatInput.replace(/!mvp @?/, '')

  // Get global variables
  const globalVars = await lib.aitum.getGlobalVariables()
  globalVars.forEach((item) => {
    if (item.name == STREAM_MVP_GLOBAL_VAR) {
      currentMVP = item.value as string
      currentMVPGlobalVarId = item.id
    }
  })

  // Send announcement
  var announcement = `Setting new Stream MVP to @${mvp}.`
  if (currentMVP !== "") {
    announcement += ` Previous Stream MVP was @${currentMVP}.`
  }
  await twitch.announcement(announcement)

  // Remove current MVP's VIP status
  if (currentMVP !== "") {
    await twitch.setVIP(false, currentMVP)
  }

  // Set Stream MVP to VIP status
  await twitch.setVIP(true, mvp)

  // Save new Stream MVP
  await lib.aitum.setGlobalVariable(currentMVPGlobalVarId, mvp)
}

/*********** DON'T EDIT BELOW ***********/
export default { name, inputs, method } as ICustomCode