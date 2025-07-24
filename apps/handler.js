import plugin from '../../../lib/plugins/plugin.js'
import LoveMys from '../model/loveMys.js'
import Cfg from '../model/Cfg.js'

let loveMys = new LoveMys()

export class loveMysHandler extends plugin {
  constructor() {
    super({
      name: 'mys请求错误处理',
      priority: 1,
      namespace: 'loveMys',
      handler: [{
        key: 'mys.req.err',
        fn: 'mysReqErrHandler'
      }]
    })
  }

  /**
   * @param {{uid, cookie, game, option?: {log?, devicefp?}, device?}} args.mysApi
   * @param args.OnlyGtest 是否仅调用过码
   */
  async mysReqErrHandler(e, args, reject) {
    let { mysApi, res } = args

    // 仅调用过码(供其他插件使用)
    if (args.OnlyGtest) return await loveMys.geetest(e, mysApi, res?.retcode)

    if (![1034, 10035].includes(Number(res.retcode))) {
      // 处理1034, 10035情况
      return reject()
    }

    let apiCfg = Cfg.api
    let apiCheck
    if (apiCfg.type == 0) {
      apiCheck = !apiCfg.api
    } else if (apiCfg.type == 1) {
      apiCheck = !apiCfg.api && !apiCfg.resapi && !apiCfg.key && !apiCfg.query
    } else if (apiCfg.type == 2) {
      apiCheck = !apiCfg.api && !apiCfg.resapi && !apiCfg.key && !apiCfg.query && !apiCfg.resquery
    }
    if ([1, 2].includes(apiCfg.GtestType) && apiCheck) {
      return reject('loveMys: 未正确填写配置文件[api.yaml]')
    }

    // 本体过码
    return await loveMys.getvali(e, mysApi, args.type, args.data)
  }
}
