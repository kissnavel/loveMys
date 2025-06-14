import cfg from '../../../../lib/config/config.js'
import getDeviceFp from '../getDeviceFp.js'
import apiTool from './apiTool.js'
import fetch from 'node-fetch'
import md5 from 'md5'

let HttpsProxyAgent = ''
export default class MysApi {
  /**
   * @param uid 游戏uid
   * @param cookie 米游社cookie
   * @param option 其他参数
   * @param option.log 是否显示日志
   * @param game 游戏
   * @param device 设备device_id
   */
  constructor (uid, cookie, game = 'gs', option = {}, device = '') {
    this.uid = uid
    this.cookie = cookie
    this.game = game
    this.server = this.getServer()
    this.apiTool = new apiTool(this.server)
    /** 5分钟缓存 */
    this.cacheCd = 300

    this.device_id = device || this.getGuid()
    this.option = {
      log: true,
      ...option
    }
  }

  /* eslint-disable quotes */
  get device () {
    if (!this._device) this._device = `Yz-${md5(this.uid).substring(0, 5)}`
    return this._device
  }

  getUrl (type, data = {}) {
    let urlMap = this.apiTool.getUrlMap({ ...data, deviceId: this.device_id.toUpperCase() })
    if (!urlMap[type]) return false

    let { url, query = '', body = '', config = '', types = '' } = urlMap[type]

    if (query) url += `?${query}`
    if (body) body = JSON.stringify(body)

    let headers = this.getHeaders(types, query, body)
    // 如果有设备指纹，写入设备指纹
    if (data.deviceFp) {
      headers['x-rpc-device_fp'] = data.deviceFp
      // 兼容喵崽
      this._device_fp = { data: { device_fp: data.deviceFp } }
    }

    // 如果有设备ID，写入设备ID（传入的，这里是绑定设备方法1中的设备ID）
    if (data.deviceId) headers['x-rpc-device_id'] = data.deviceId

    // 如果有绑定设备信息，写入绑定设备信息，否则写入默认设备信息
    if (data?.deviceInfo && data?.modelName && data?.osVersion) {
      const osVersion = data.osVersion
      const modelName = data.modelName
      const deviceBrand = data.deviceInfo?.split('/')[0]
      const deviceDisplay = data.deviceInfo?.split('/')[3]
      try {
        headers['x-rpc-device_name'] = `${deviceBrand} ${modelName}`
        headers['x-rpc-device_model'] = modelName
        headers['x-rpc-csm_source'] = 'myself'
        // 国际服不需要绑定设备，故写入的'User-Agent'为国服
        headers['User-Agent'] = `Mozilla/5.0 (Linux; Android ${osVersion}; ${modelName} Build/${deviceDisplay}; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.73.1`
      } catch (error) {
        logger.error(`[lovemys]设备信息解析失败：${error.message}`)
      }
    } else {
      try {
        headers['x-rpc-device_name'] = 'Sony XQ-BC52'
        headers['x-rpc-device_model'] = 'XQ-BC52'
        headers['x-rpc-csm_source'] = 'myself'
      } catch (error) {
        logger.error(`[lovemys]设备信息解析失败：${error.message}`)
      }
    }

    return { url, headers, body, config, types }
  }

  getServer () {
    const _uid = String(this.uid)
    const isSr = this.game == 'sr'
    const isZzz = this.game == 'zzz'
    if (isZzz) {
      switch (_uid.slice(0, -8)) {
        case '10':
          return 'prod_gf_us'// 美服
        case '15':
          return 'prod_gf_eu'// 欧服
        case '13':
          return 'prod_gf_jp'// 亚服
        case '17':
          return 'prod_gf_sg'// 港澳台服
      }
    } else {
      switch (_uid.slice(0, -8)) {
        case '5':
          return isSr ? 'prod_qd_cn' : 'cn_qd01'// B服
        case '6':
          return isSr ? 'prod_official_usa' : 'os_usa'// 美服
        case '7':
          return isSr ? 'prod_official_euro' : 'os_euro'// 欧服
        case '8':
        case '18':
          return isSr ? 'prod_official_asia' : 'os_asia'// 亚服
        case '9':
          return isSr ? 'prod_official_cht' : 'os_cht'// 港澳台服
      }
    }
    return isWd ? 'cn_prod_gf01' : (isZzz || isSr) ? 'prod_gf_cn' : 'cn_gf01'// 官服
  }

  async getData (type, data = { headers: {} }, cached = false) {
    const uid = this.uid
    const ck = this.cookie
    const game = this.game
    const ltuid = ck.ltuid
    if (ltuid) {
      let bindInfo = await redis.get(`genshin:device_fp:${ltuid}:bind`)
      if (bindInfo) {
        try {
          bindInfo = JSON.parse(bindInfo)
          data = {
            ...data,
            productName: bindInfo?.deviceProduct,
            deviceType: bindInfo?.deviceName,
            modelName: bindInfo?.deviceModel,
            oaid: bindInfo?.oaid,
            osVersion: bindInfo?.androidVersion,
            deviceInfo: bindInfo?.deviceFingerprint,
            board: bindInfo?.deviceBoard
          }
        } catch (error) {
          bindInfo = null
        }
      }
      const { deviceFp } = await getDeviceFp.Fp(uid, ck, game)
      if (deviceFp) {
        data.deviceFp = deviceFp
        data.headers['x-rpc-device_fp'] = deviceFp
      }
      const device_id = await redis.get(`genshin:device_fp:${ltuid}:id`)
      if (device_id) {
        data.deviceId = device_id
        data.headers['x-rpc-device_id'] = device_id
      }
    }
    if (!this._device_fp && !data?.Getfp) {
      this._device_fp = await this.getData('getFp', {
        ...data,
        Getfp: true
      })
    }
    if (type === 'getFp' && !data?.Getfp) return this._device_fp

    let { url, headers, body, config, types } = this.getUrl(type, data)

    if (!url) return false

    let cacheKey = this.cacheKey(type, data)
    let cahce = await redis.get(cacheKey)
    if (cahce) return JSON.parse(cahce)

    if (types !== 'noheader'){
      if (data.headers) {
        headers = { ...headers, ...data.headers }
        delete data.headers
      }

      if (type !== 'getFp' && !headers['x-rpc-device_fp']) {
        headers['x-rpc-device_fp'] = this._device_fp.data?.device_fp
      }
    }

    let param = {
      headers,
      agent: await this.getAgent(),
      timeout: 10000
    }
    if (body) {
      param.method = 'post'
      param.body = body
    } else {
      param.method = 'get'
    }
    let response = {}
    let start = Date.now()

    if (type == 'recognize' || type == 'results') {
      param = {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: config
      }
    }

    try {
      response = await fetch(url, param)
    } catch (error) {
      logger.error(error.toString())
      return false
    }

    if (!response.ok) {
      logger.error(`[米游社接口][${type}][${this.uid}] ${response.status} ${response.statusText}`)
      return false
    }
    if (this.option.log) {
      logger.mark(`[米游社接口][${type}][${this.uid}] ${Date.now() - start}ms`)
    }
    let res = await response.json()

    if (!res) {
      logger.mark('mys接口没有返回')
      return false
    }

    res.api = type

    if (cached) this.cache(res, cacheKey)

    return res
  }

  getHeaders (types = '', query = '', body = '') {
    if (types === 'noheader') return {}

    const cn = {
      app_version: '2.73.1',
      User_Agent: 'Mozilla/5.0 (Linux; Android 13; XQ-BC52 Build/61.2.A.0.472A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBS/2.73.1',
      client_type: '5',
      Origin: 'https://act.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://act.mihoyo.com/'
    }
    const os = {
      app_version: '2.57.1',
      User_Agent: 'Mozilla/5.0 (Linux; Android 13; XQ-BC52 Build/61.2.A.0.472A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/111.0.5563.116 Mobile Safari/537.36 miHoYoBBSOversea/2.57.1',
      client_type: '2',
      Origin: 'https://act.hoyolab.com',
      X_Requested_With: 'com.mihoyo.hoyolab',
      Referer: 'https://act.hoyolab.com/'
    }
    let client
    if (/cn_|_cn/.test(this.server)) {
      client = cn
    } else {
      client = os
    }

    return {
      'x-rpc-app_version': client.app_version,
      'x-rpc-client_type': client.client_type,
      'User-Agent': client.User_Agent,
      Referer: client.Referer,
      Cookie: this.cookie,
      DS: this.getDs(query, body)
    }
  }

  getDs (q = '', b = '') {
    let n = ''
    if (/cn_|_cn/.test(this.server)) {
      n = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9Asafs'
    } else {
      n = 'okr4obncj8bw5a65hbnn5oo6ixjc3l9w'
    }
    let t = Math.round(new Date().getTime() / 1000)
    let r = Math.floor(Math.random() * 900000 + 100000)
    let DS = md5(`salt=${n}&t=${t}&r=${r}&b=${b}&q=${q}`)
    return `${t},${r},${DS}`
  }

  getDs2() {
    let t = Math.round(new Date().getTime() / 1000)
    let r = this.randomString(6)
    let DS = md5(`salt=WGtruoQrwczmsjLOPXzJLnaAYycsLavx&t=${t}&r=${r}`)
    return `${t},${r},${DS}`
  }

  getGuid () {
    function S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }

    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }

  randomString(length = 32) {
    let randomStr = ''
    for (let i = 0; i < length; i++) {
      randomStr += _.sample('abcdefghijklmnopqrstuvwxyz0123456789')
    }
    return randomStr
  }

  cacheKey (type, data) {
    return 'Yz:genshin:mys:cache:' + md5(this.uid + type + JSON.stringify(data))
  }

  async cache (res, cacheKey) {
    if (!res || res.retcode !== 0) return
    redis.setEx(cacheKey, this.cacheCd, JSON.stringify(res))
  }

  async getAgent () {
    let proxyAddress = cfg.bot.proxyAddress
    if (!proxyAddress) return null
    if (proxyAddress === 'http://0.0.0.0:0') return null

    if (/cn_|_cn/.test(this.server)) return null

    if (HttpsProxyAgent === '') {
      HttpsProxyAgent = await import('https-proxy-agent').catch((err) => {
        logger.error(err)
      })

      HttpsProxyAgent = HttpsProxyAgent ? HttpsProxyAgent.HttpsProxyAgent : undefined
    }

    if (HttpsProxyAgent) {
      return new HttpsProxyAgent(proxyAddress)
    }

    return null
  }
}
