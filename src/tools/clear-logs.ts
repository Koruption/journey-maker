import { Journey } from "../journey"

(async () => {
    await Journey.utils.Logging.cleanup();
    console.log('[Journey Log]: logs cleared.. ')
})()