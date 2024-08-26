import Cfg from './model/Cfg.js'
import _ from 'lodash'

// 支持锅巴
export function supportGuoba() {
  let groupList = Array.from(Bot.gl.values())
  groupList = groupList.map(item => item = { label: `${item.bot_id || Bot.uin}-${item.group_name}-${item.group_id}`, value: `${item.bot_id || Bot.uin}:${item.group_id}` })
  return {
    // 插件信息，将会显示在前端页面
    // 如果你的插件没有在插件库里，那么需要填上补充信息
    // 如果存在的话，那么填不填就无所谓了，填了就以你的信息为准
    pluginInfo: {
      name: 'loveMys',
      title: 'loveMys-plugin',
      author: '@kissnavel',
      authorLink: 'https://github.com/kissnavel',
      link: 'https://github.com/kissnavel/loveMys',
      isV3: true,
      isV2: false,
      description: 'loveMys',
      // 显示图标，此为个性化配置
      // 图标可在 https://icon-sets.iconify.design 这里进行搜索
      icon: 'bx:atom',
      // 图标颜色，例：#FF0000 或 rgb(255, 0, 0)
      iconColor: 'rgb(241,212,152)',
      // 如果想要显示成图片，也可以填写图标路径（绝对路径）
      // iconPath: path.join(_paths.pluginRoot, 'resources/images/icon.png'),
    },
    // 配置项信息
    configInfo: {
      // 配置项 schemas
      schemas: [
        {
          component: 'Divider',
          label: 'api设置'
        },
        {
          field: 'api.api',
          label: '使用的api',
          bottomHelpMessage: 'www.rrocr.com、www.ttocr.com',
          component: 'Input',
          componentProps: {
            placeholder: '例：https://api.example.com/geetest',
          },
        },
        {
          field: 'api.resapi',
          label: '使用的resapi',
          bottomHelpMessage: 'rrocr不填，ttocr必填',
          component: 'Input',
          componentProps: {
            placeholder: '例：https://api.example.com/results',
          },
        },
        {
          field: 'api.key',
          label: 'api、resapi需要的key',
          bottomHelpMessage: 'rrocr、ttocr',
          component: 'Input',
          componentProps: {
            placeholder: '例：appkey=***',
          },
        },
        {
          field: 'api.query',
          label: 'api需要的其他参数',
          bottomHelpMessage: '除“key、gt、challenge”以外的',
          component: 'Input',
          componentProps: {
            placeholder: '例: referer=***',
          },
        },
        {
          component: 'Divider',
          label: 'GT-Manual设置'
        },
        {
          field: 'api.startApi',
          label: '开启或关闭手动api',
          bottomHelpMessage: '使用他人的手动api或者不想使用手动请关闭',
          component: 'Switch',
        },
        {
          field: 'api.Host',
          label: '手动域名或ip',
          bottomHelpMessage: '你的手动域名或ip',
          component: 'Input',
          componentProps: {
            placeholder: '例: http://127.0.0.1',
          },
        },
        {
          field: 'api.Port',
          label: '手动端口',
          bottomHelpMessage: '你的手动端口',
          component: 'InputNumber',
          componentProps: {
            min: 0,
            placeholder: '例: 3000',
          },
        },
        {
          field: 'api.verifyAddr',
          label: '手动api',
          bottomHelpMessage: '使用他人的手动api请修改(使用自己的api请保持端口一致)',
          component: 'Input',
          componentProps: {
            placeholder: '例: http://127.0.0.1:3000/GTest/register',
          },
        },
        {
          field: 'api.GtestType',
          label: '类型',
          bottomHelpMessage: '0:仅手动；1:仅自动；2:自动失败换手动',
          component: 'InputNumber',
          required: true,
          componentProps: {
            max: 2,
            placeholder: '请输入类型',
          },
        }
      ],
      // 获取配置数据方法（用于前端填充显示数据）
      getConfigData() {
        return {
          api: Cfg.getConfig('api')
        }
      },
      // 设置配置的方法（前端点确定后调用的方法）
      setConfigData(data, { Result }) {
        for (const key in data) {
          let split = key.split('.')
          let config = Cfg.getConfig(split[0])
          if (_.isEqual(config[split[1]], data[key])) continue
          config[split[1]] = data[key]
          Cfg.setConfig(split[0], config)
        }
        return Result.ok({}, '保存成功~')
      },
    },
  }
}
