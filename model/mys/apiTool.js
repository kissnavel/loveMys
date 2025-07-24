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
    const productName = data?.productName || 'XQ-BC52_EEA'
    const deviceType = data?.deviceType || 'XQ-BC52'
    const modelName = data?.modelName || 'XQ-BC52'
    const oaid = data?.oaid || this.uuid
    const osVersion = data?.osVersion || '13'
    const deviceInfo = data?.deviceInfo || 'Sony/XQ-BC52_EEA/XQ-BC52:13/61.2.A.0.472A/061002A0000472A0046651803:user/release-keys'
    const board = data?.board || 'lahaina'
    const deviceBrand = deviceInfo.split('/')[0]
    const deviceDisplay = deviceInfo.split('/')[3]
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
          geetest_challenge: data.challenge || data.geetest_challenge,
          geetest_validate: data.validate || data.geetest_validate,
          geetest_seccode: `${data.validate || data.geetest_validate}|jordan`,
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
          geetest_challenge: data.challenge || data.geetest_challenge,
          geetest_validate: data.validate || data.geetest_validate,
          geetest_seccode: `${data.validate || data.geetest_validate}|jordan`
        }
      },
      test_nine: {
        url: `${Cfg.api.api}`,
        query: `gt=${data.gt}&challenge=${data.challenge}`
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
      in: {
        url: `${Cfg.api.api}`,
        query: `${Cfg.api.key}&${Cfg.api.query}&gt=${data.gt}&challenge=${data.challenge}`
      },
      res: {
        url: `${Cfg.api.resapi}`,
        query: `${Cfg.api.key}&${Cfg.api.resquery}&id=${data.request}`
      },
      /** fp参数用于减少验证码 */
      ...(/cn_|_cn/.test(this.server) ? {
        getFp: {
          url: `${hostPublicData}device-fp/api/getFp`,
          body: {
            app_name: 'bbs_cn',
            bbs_device_id: `${this.uuid}`,
            device_fp: '38d805c20d53d',
            device_id: 'cc57c40f763ae4cc',
            ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"768","deviceName":"${modelName}","productName":"${productName}","romRemain":"727","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"aaid":"${this.uuid}","model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":224845,"buildTime":"1692775759000","buildUser":"BuildUser","simState":1,"ramRemain":"218344","appUpdateTimeDiff":1740498108042,"deviceInfo":"${deviceInfo}","vaid":"${this.uuid}","buildType":"user","sdkVersion":"33","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"768","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-1.588236x6.8404818x6.999604","sdRemain":218214,"buildTags":"release-keys","packageName":"com.mihoyo.hyperion","networkType":"WiFi","oaid":"${oaid}","debugStatus":1,"ramCapacity":"224845","magnetometer":"-47.04375x51.3375x137.96251","display":"${deviceDisplay}","appInstallTimeDiff":1740498108042,"packageVersion":"2.35.0","gyroscope":"-0.22601996x-0.09453133x0.09040799","batteryStatus":88,"hasKeyboard":0,"board":"${board}"}`,
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
            device_fp: '38d7f4c72b736',
            device_id: 'cc57c40f763ae4cc',
            ext_fields: `{"proxyStatus":1,"isRoot":0,"romCapacity":"768","deviceName":"${modelName}","productName":"${productName}","romRemain":"737","hostname":"BuildHost","screenSize":"1096x2434","isTablet":0,"model":"${modelName}","brand":"${deviceBrand}","hardware":"qcom","deviceType":"${deviceType}","devId":"REL","serialNumber":"unknown","sdCapacity":224845,"buildTime":"1692775759000","buildUser":"BuildUser","simState":1,"ramRemain":"218355","appUpdateTimeDiff":1740498134990,"deviceInfo":"${deviceInfo}","buildType":"user","sdkVersion":"33","ui_mode":"UI_MODE_TYPE_NORMAL","isMockLocation":0,"cpuType":"arm64-v8a","isAirMode":0,"ringMode":2,"app_set_id":"${this.uuid}","chargeStatus":1,"manufacturer":"${deviceBrand}","emulatorStatus":0,"appMemory":"768","adid":"${this.uuid}","osVersion":"${osVersion}","vendor":"unknown","accelerometer":"-0.6436693x5.510072x8.106883","sdRemain":218227,"buildTags":"release-keys","packageName":"com.mihoyo.hoyolab","networkType":"WiFi","debugStatus":1,"ramCapacity":"224845","magnetometer":"-46.143753x52.350002x141.54376","display":"${deviceDisplay}","appInstallTimeDiff":1740498134990,"packageVersion":"2.35.0","gyroscope":"0.21242823x0.11484258x-0.09850194","batteryStatus":88,"hasKeyboard":0,"board":"${board}"}`,
            hoyolab_device_id: `${this.uuid}`,
            platform: '2',
            seed_id: `${this.uuid}`,
            seed_time: new Date().getTime() + ''
          }
        }
      }),
      deviceLogin: {
        url: 'https://bbs-api.miyoushe.com/apihub/api/deviceLogin',
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
        url: 'https://bbs-api.miyoushe.com/apihub/api/saveDevice',
        body: {
          app_version: '2.73.1',
          device_id: data.deviceId,
          device_name: `${deviceBrand}${modelName}`,
          os_version: '33',
          platform: 'Android',
          registration_id: this.generateSeed(19)
        }
      }
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
