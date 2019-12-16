import Mobile from './mobile'
import WebAudio from './web_audio'
import Swf from './swf'

const adapters = [Mobile, WebAudio, Swf]

export const findAdapter = (adapterName = '') => {
  const byName = (candidate) => candidate.name === adapterName
  const bySupport = (candidate) => candidate.isSupported()
  const query = adapterName ? byName : bySupport
  return adapters.find(query)
}
