import Cfg from '../Cfg.js'
import crypto from 'crypto'

export default class apiTool {
  /**
   * @param uid 用户uid
   * @param server 区服
   * @param game 游戏
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
          geetest_challenge: data.eetest_challenge || data.challenge,
          geetest_validate: data.geetest_validate || data.validate,
          geetest_seccode: data.geetest_seccode || `${data.validate}|jordan`
        }
      },
      validate: {
        url: `${Cfg.api.api}`,
        query: `${Cfg.api.token ? `token=${Cfg.api.token}` : ''}${Cfg.api.query || ''}&gt=${data.gt}&challenge=${data.challenge}`,
        types: 'noheader'
      },
      /** fp参数用于减少验证码 */
      ...(/cn_|_cn/.test(this.server) ? {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            seed_id: data.seed_id,
            device_id: data.deviceId,
            platform: '1',
            seed_time: new Date().getTime() + '',
            ext_fields: `{"proxyStatus":"0","accelerometer":"-0.159515x-0.830887x-0.682495","ramCapacity":"3746","IDFV":"${data.deviceId}","gyroscope":"-0.191951x-0.112927x0.632637","isJailBreak":"0","model":"iPhone12,5","ramRemain":"115","chargeStatus":"1","networkType":"WIFI","vendor":"--","osVersion":"17.0.2","batteryStatus":"50","screenSize":"414×896","cpuCores":"6","appMemory":"55","romCapacity":"488153","romRemain":"157348","cpuType":"CPU_TYPE_ARM64","magnetometer":"-84.426331x-89.708435x-37.117889"}`,
            app_name: 'bbs_cn',
            device_fp: '38d7ee834d1e9'
          }
        }
      } : {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            seed_id: `${this.uuid}`,
            device_id: '35315696b7071100',
            hoyolab_device_id: `${this.uuid}`,
            platform: '2',
            seed_time: new Date().getTime() + '',
            ext_fields: `{"proxyStatus":1,"isRoot":1,"romCapacity":"512","deviceName":"Xperia 1","productName":"J9110","romRemain":"483","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"J9110","brand":"Sony","hardware":"qcom","deviceType":"J9110","devId":"REL","serialNumber":"unknown","sdCapacity":107433,"buildTime":"1633631032000","buildUser":"BuildUser","simState":1,"ramRemain":"98076","appUpdateTimeDiff":1716545162858,"deviceInfo":"Sony\/J9110\/J9110:11\/55.2.A.4.332\/055002A004033203408384484:user\/release-keys","buildType":"user","sdkVersion":"30","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"Sony","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"11","vendor":"unknown","accelerometer":"-0.9233304x7.574181x6.472585","sdRemain":97931,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"107433","magnetometer":"-9.075001x-27.300001x-3.3000002","display":"55.2.A.4.332","appInstallTimeDiff":1716489549794,"packageVersion":"","gyroscope":"0.027029991x-0.04459185x0.032222193","batteryStatus":45,"hasKeyboard":0,"board":"msmnile"}`,
            app_name: 'bbs_oversea',
            device_fp: '38d7f2352506c'
          }
        }
      })
    }
  }
}