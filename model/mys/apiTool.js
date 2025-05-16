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
    const productName = data?.productName ?? 'XQ-AT52'
    const deviceType = data?.deviceType ?? 'XQ-AT52'
    const modelName = data?.modelName ?? 'XQ-AT52'
    const oaid = data?.oaid ?? this.uuid
    const osVersion = data?.osVersion ?? '12'
    const deviceInfo = data?.deviceInfo ?? 'Sony/XQ-AT52/XQ-AT52:12/58.2.A.7.93/058002A007009304241360111:user/release-keys'
    const board = data?.board ?? 'kona'
    const deviceBrand = deviceInfo.split('/')[0]
    const deviceDisplay = deviceInfo.split('/')[3]
    let Bbs_api = 'https://bbs-api.miyoushe.com/'
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
      deviceLogin: {
        url: `${Bbs_api}apihub/api/deviceLogin`,
        body: {
          app_version: '2.73.1',
          device_id: data.deviceId,
          device_name: `${deviceBrand}${modelName}`,
          os_version: '33',
          platform: 'Android',
          registration_id: this.generateSeed(19)
        }
      },
      saveDevice: {
        url: `${Bbs_api}apihub/api/saveDevice`,
        body: {
          app_version: '2.73.1',
          device_id: data.deviceId,
          device_name: `${deviceBrand}${modelName}`,
          os_version: '33',
          platform: 'Android',
          registration_id: this.generateSeed(19)
        }
      },
      /** fp参数用于减少验证码 */
      ...(/cn_|_cn/.test(this.server) ? {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            app_name: 'bbs_cn',
            bbs_device_id: `${this.uuid}`,
            device_fp: '38d802d62e7fb',
            device_id: 'd927172613ac7594',
            ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"489","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":228442,"buildTime":"1653304778000","buildUser":"BuildUser","simState":1,"ramRemain":"221267","appUpdateTimeDiff":1736258293874,"deviceInfo":"${deviceInfo}","vaid":"${this.uuid}","buildType":"user","sdkVersion":"31","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"0.24616162x0.44117668x9.934102","sdRemain":221125,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${oaid}","debugStatus":1,"ramCapacity":"228442","magnetometer":"-0.93750006x26.456251x-42.693752","display":"${deviceDisplay}","appInstallTimeDiff":1736258293874,"packageVersion":"2.33.0","gyroscope":"4.5813544E-4x-0.0x-7.635591E-4","batteryStatus":66,"hasKeyboard":0,"board":"${board}"}`,
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
            device_fp: '38d7f469c1319',
            device_id: 'd927172613ac7594',
            ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"512","deviceName":"${modelName}","productName":"${productName}","romRemain":"474","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":228442,"buildTime":"1653304778000","buildUser":"BuildUser","simState":1,"ramRemain":"221344","appUpdateTimeDiff":1736258244054,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"31","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"512","adid":"${this.uuid}","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-1.6262221x3.1136606x9.471091","sdRemain":221216,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"228442","magnetometer":"-17.1x-6.6937504x-25.85625","display":"${deviceDisplay}","appInstallTimeDiff":1736258244054,"packageVersion":"2.33.0","gyroscope":"-0.18203248x-0.3193204x0.060321167","batteryStatus":66,"hasKeyboard":0,"board":"${board}"}`,
            hoyolab_device_id: `${this.uuid}`,
            platform: '2',
            seed_id: `${this.uuid}`,
            seed_time: new Date().getTime() + ''
          }
        }
      })
    }
  }

  generateSeed(length = 16) {
    const characters = '0123456789abcdef'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)]
    }
    return result
  }
}
