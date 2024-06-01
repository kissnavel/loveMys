import Cfg from '../Cfg.js'
import { randomRange } from './mysApi.js'

export default class apiTool {
  /**
   * @param uid 用户uid
   * @param server 区服
   * @param game 游戏
   */
  constructor (server) {
    this.server = server
  }

  getUrlMap = (data = {}) => {
    let host, hostRecord, hostPublicData
    if (['cn_gf01', 'cn_qd01', 'prod_gf_cn', 'prod_qd_cn'].includes(this.server)) {
      host = 'https://api-takumi.mihoyo.com/'
      hostRecord = 'https://api-takumi-record.mihoyo.com/'
      hostPublicData = 'https://public-data-api.mihoyo.com/'
    } else if (/os_|official/.test(this.server)) {
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
      ...(['cn_gf01', 'cn_qd01', 'prod_gf_cn', 'prod_qd_cn'].includes(this.server) ? {
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
            seed_id: data.seed_id,
            device_id: data.deviceId,
            platform: '5',
            seed_time: new Date().getTime() + '',
            ext_fields: `{"userAgent":"Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.55.0","browserScreenSize":"387904","maxTouchPoints":"5","isTouchSupported":"1","browserLanguage":"zh-CN","browserPlat":"Linux aarch64","browserTimeZone":"Asia/Shanghai","webGlRender":"Adreno (TM) 640","webGlVendor":"Qualcomm","numOfPlugins":"0","listOfPlugins":"unknown","screenRatio":"2.625","deviceMemory":"4","hardwareConcurrency":"8","cpuClass":"unknown","ifNotTrack":"unknown","ifAdBlock":"0","hasLiedLanguage":"0","hasLiedResolution":"1","hasLiedOs":"0","hasLiedBrowser":"0","canvas":"${randomRange()}","webDriver":"0","colorDepth":"24","pixelRatio":"2.625","packageName":"unknown","packageVersion":"2.27.0","webgl":"${randomRange()}"}`,
            app_name: 'bbs_oversea',
            device_fp: '38d7f2364db95'
          }
        }
      })
    }
  }
}