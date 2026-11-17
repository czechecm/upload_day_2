import { createApp } from 'vue'
import { initEloBaseServices, ixService, logger } from '@elo/elo-base-lib'
import { LockC, EditInfoC } from '@elo/ix-client-typescript'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './jsLocales/all_locales'
import App from './App.vue'

// Initialize the elo base services
try {
  await initEloBaseServices() // perform redirect to ELO login if not authenticated.

  // --- example call to ix: checkout root repository folder.
  const sord = await ixService.callIxEndpoint('checkoutSord', {
    objId: '1',
    editInfoZ: EditInfoC.mbSord,
    lockZ: LockC.NO,
  })
  logger.info('-----Checked out sord:', sord.sord!.name)
  // ---

  createApp(App).use(ElementPlus).mount('#app') // <- mount the app after initialization is complete
} catch (error) {
  logger.error('Failed to initialize ELO Base Lib:', error)
}
