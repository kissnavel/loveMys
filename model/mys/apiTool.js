import Cfg from '../Cfg.js'
import crypto from 'crypto'

export default class apiTool {
  /**
   * @param server 区服
   */
  constructor (server) {
    this.server = server
    this.uuid = crypto.randomUUID()
  }

  getUrlMap = (data = {}) => {
    let host, hostRecord, hostPublicData
    if (/cn_|_cn/.test(this.server)) {
      host = 'https://api-takumi.mihoyo.com/'
      hostRecord = 'https://api-takumi-record.mihoyo.com/'
      hostPublicData = 'https://public-data-api.mihoyo.com/'
    } else {
      host = 'https://sg-public-api.hoyolab.com/'
      hostRecord = 'https://bbs-api-os.hoyolab.com/'
      hostPublicData = 'https://sg-public-data-api.hoyoverse.com/'
    }

    return {
      createGeetest: {
        url: `${host}event/toolcomsrv/risk/createGeetest`,
        query: `is_high=true&app_key=${data.app_key}`
      },
      verifyGeetest: {
        url: `${host}event/toolcomsrv/risk/verifyGeetest`,
        body: {
          geetest_challenge: data.challenge,
          geetest_validate: data.validate,
          geetest_seccode: `${data.validate}|jordan`,
          app_key: data.app_key
        }
      },
      createVerification: {
        url: `${hostRecord}game_record/app/card/wapi/createVerification`,
        query: 'is_high=true'
      },
      verifyVerification: {
        url: `${hostRecord}game_record/app/card/wapi/verifyVerification`,
        body: {
          geetest_challenge: data.challenge,
          geetest_validate: data.validate,
          geetest_seccode: `${data.validate}|jordan`
        }
      },
      recognize: {
        url: `${Cfg.api.api}`,
        config: `${Cfg.api.key}&${Cfg.api.query}&gt=${data.gt}&challenge=${data.challenge}`,
        types: 'noheader'
      },
      results: {
        url: `${Cfg.api.resapi}`,
        config: `${Cfg.api.key}&resultid=${data.resultid}`,
        types: 'noheader'
      },
      /** fp参数用于减少验证码 */
      ...(/cn_|_cn/.test(this.server) ? {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            app_name: 'bbs_cn',
            bbs_device_id: `${this.uuid}`,
            device_fp: '38d7faa51d2b6',
            device_id: '35315696b7071100',
            ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"Xperia 1","productName":"J9110","romRemain":"456","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"J9110","brand":"Sony","hardware":"qcom","deviceType":"J9110","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"96757","appUpdateTimeDiff":1722171241616,"deviceInfo":"Sony\/J9110\/J9110:11\/55.2.A.4.332\/055002A004033203408384484:user\/release-keys","vaid":"${this.uuid}","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"Sony","emulatorStatus":0,"appMemory":"512","osVersion":"11","vendor":"unknown","accelerometer":"-0.084346995x8.73799x4.6301117","sdRemain":96600,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${this.uuid}","debugStatus":1,"ramCapacity":"107433","magnetometer":"-13.9125x-17.8875x-5.4750004","display":"55.2.A.4.332","appInstallTimeDiff":1717065300325,"packageVersion":"2.20.2","gyroscope":"0.017714571x-4.5813544E-4x0.0015271181","batteryStatus":76,"hasKeyboard":0,"board":"msmnile"}`,
            platform: '2',
            seed_id: `${this.uuid}`,
            seed_time: new Date().getTime() + ''
          }
        }
      } : {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            app_name: 'bbs_oversea',
            device_fp: '38d7f2352506c',
            device_id: '35315696b7071100',
            ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"Xperia 1","productName":"J9110","romRemain":"474","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"J9110","brand":"Sony","hardware":"qcom","deviceType":"J9110","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"96715","appUpdateTimeDiff":1722171191009,"deviceInfo":"Sony\/J9110\/J9110:11\/55.2.A.4.332\/055002A004033203408384484:user\/release-keys","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"Sony","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"11","vendor":"unknown","accelerometer":"-0.22372891x-1.5332011x9.802497","sdRemain":96571,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"107433","magnetometer":"3.73125x-10.668751x3.7687502","display":"55.2.A.4.332","appInstallTimeDiff":1716489549794,"packageVersion":"","gyroscope":"0.18386503x-0.006413896x-0.008857286","batteryStatus":77,"hasKeyboard":0,"board":"msmnile"}`,
            hoyolab_device_id: `${this.uuid}`,
            platform: '2',
            seed_id: `${this.uuid}`,
            seed_time: new Date().getTime() + ''
          }
        }
      })
    }
  }
}
