import { Lightning, Launch, PlatformSettings, AppData } from '@lightningjs/sdk'
import MemoryGame from './App.js'

export default function (
  appSettings: Lightning.Application.Options,
  platformSettings: PlatformSettings,
  appData: AppData,
) {
  return Launch(MemoryGame, appSettings, platformSettings, appData)
}
