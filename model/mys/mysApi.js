import cfg from '../../../../lib/config/config.js'
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
    this.server = this.getServer(this.uid, this.game)
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

    let { url, query = '', body = '', types = '' } = urlMap[type]

    if (query) url += `?${query}`
    if (body) body = JSON.stringify(body)

    let headers = this.getHeaders(types, query, body)

    return { url, headers, body, types }
  }

  getServer () {
    const _uid = String(this.uid)
    const isSr = this.game == 'sr'
    const isZzz = this.game == 'zzz'
    switch (_uid.slice(0, -8)) {
      case '1':
      case '2':
      case '3':
        return isSr ? 'prod_gf_cn' : 'cn_gf01'// 官服
      case '5':
        return isSr ? 'prod_qd_cn' : 'cn_qd01'// B服
      case '6':
      case '10':
        return isZzz ? 'prod_gf_us' : isSr ? 'prod_official_usa' : 'os_usa'// 美服
      case '7':
      case '15':
        return isZzz ? 'prod_gf_eu' : isSr ? 'prod_official_euro' : 'os_euro'// 欧服
      case '8':
      case '13':
      case '18':
        return isZzz ? 'prod_gf_jp' : isSr ? 'prod_official_asia' : 'os_asia'// 亚服
      case '9':
      case '17':
        return isZzz ? 'prod_gf_sg' : isSr ? 'prod_official_cht' : 'os_cht'// 港澳台服
    }
    return (isZzz || isSr) ? 'prod_gf_cn' : 'cn_gf01'// 官服
  }

  async getData (type, data = {}, cached = false) {
    if (!this._device_fp && !data?.Getfp) {
      this._device_fp = await this.getData('getFp', {
        Getfp: true
      })
    }
    if (type === 'getFp' && !data?.Getfp) return this._device_fp

    let { url, headers, body, types } = this.getUrl(type, data)

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
      User_Agent: 'Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBS/2.73.1',
      client_type: '5',
      Origin: 'https://act.mihoyo.com',
      X_Requested_With: 'com.mihoyo.hyperion',
      Referer: 'https://act.mihoyo.com/'
    }
    const os = {
      app_version: '2.57.1',
      User_Agent: 'Mozilla/5.0 (Linux; Android 11; J9110 Build/55.2.A.4.332; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 miHoYoBBSOversea/2.57.1',
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

  getGuid () {
    function S4 () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }

    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
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