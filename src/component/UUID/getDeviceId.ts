
import { v4 as uuid } from 'uuid'

const DEVICE_ID_KEY = 'app-name-device-id'

export const getDeviceId = () => {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY) || ""
    if(!deviceId){
        deviceId = uuid()
        localStorage.setItem(DEVICE_ID_KEY, deviceId)
    }
    return deviceId
}