/***
 * Clash Verge Rev / Mihomo Party 优化脚本
 * 原作者: dahaha-365 (YaNet)
 * Github：https://github.com/dahaha-365/YaNet
 */

function stringToArray(val) {
  if (Array.isArray(val)) return val
  if (typeof val !== 'string') return []
  return val
    .split(';')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

// --- 1. 静态配置区域 ---

const _skipIps =
  '10.0.0.0/8;100.64.0.0/10;127.0.0.0/8;169.254.0.0/16;172.16.0.0/12;192.168.0.0/16;198.18.0.0/16;FC00::/7;FE80::/10;::1/128'

// DNS 配置
const _chinaDohDns = 'https://doh.pub/dns-query;https://dns.alidns.com/dns-query'
const _foreignDohDns =
  'https://dns.google/dns-query;https://dns.adguard-dns.com/dns-query'
const _chinaIpDns = '119.29.29.29;223.5.5.5'
const _foreignIpDns = "8.8.8.8;94.140.14.14"

/**
 * 整个脚本的总开关，在Mihomo Party使用的话，请保持为true
 * true = 启用
 * false = 禁用
 */
const args =
  typeof $arguments !== 'undefined'
    ? $arguments
    : {
        enable: true,
        ruleSet: 'all',
        regionSet: 'all',
        excludeHighPercentage: true,
        globalRatioLimit: 2,
        skipIps: _skipIps,
        defaultDNS: _chinaIpDns,
        directDNS: _chinaIpDns,
        chinaDNS: _chinaDohDns,
        foreignDNS: _foreignDohDns,
        mode: 'default',
        ipv6: false,
        logLevel: 'error',
      }

/**
 * 如果是直接在软件中粘贴脚本的，就手动修改下面这几个变量实现自定义配置
 */
let {
  enable = args.enable || true,
  ruleSet = args.ruleSet || 'all', // 支持 'all' 或 'openai,youtube,ads' 这种格式
  regionSet = args.regionSet || 'all', // 匹配 regionDefinitions.name 前两个字母 (严格大小写)
  excludeHighPercentage = args.excludeHighPercentage || true,
  globalRatioLimit = args.globalRatioLimit || 2,
  skipIps = args.skipIps || _skipIps,
  defaultDNS = args.defaultDNS || _chinaIpDns,
  directDNS = args.directDNS || _chinaIpDns,
  chinaDNS = args.chinaDNS || _chinaDohDns,
  foreignDNS = args.foreignDNS || _foreignDohDns,
  mode = args.mode || '',
  ipv6 = args.ipv6 || false,
  logLevel = args.logLevel || 'error',
} = args

/**
 * 模式配置
 */
if (['securest', 'secure', 'default', 'fast', 'fastest'].includes(mode)) {
  switch (mode) {
    case 'securest':
      defaultDNS = _foreignIpDns
      directDNS = _foreignDohDns
      break;
    case 'secure':
      defaultDNS = _foreignIpDns
      directDNS = _chinaDohDns
      chinaDNS = _chinaDohDns
      foreignDNS = _foreignDohDns
      break;
    case 'fast':
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaIpDns
      foreignDNS = _chinaDohDns
      break;
    case 'fastest':
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaIpDns
      foreignDNS = _chinaIpDns
      break;
    default:
      defaultDNS = _chinaIpDns
      directDNS = _chinaIpDns
      chinaDNS = _chinaDohDns
      foreignDNS = _chinaDohDns
      break;
  }
}

skipIps = stringToArray(skipIps)
defaultDNS = stringToArray(defaultDNS)
directDNS = stringToArray(directDNS)
chinaDNS = stringToArray(chinaDNS)
foreignDNS = stringToArray(foreignDNS)

/**
 * 分流规则配置，会自动生成对应的策略组
 * 设置的时候可遵循“最小，可用”原则，把自己不需要的规则全禁用掉，提高效率
 * true = 启用
 * false = 禁用
 */
let ruleOptions = {
  apple: true, // 苹果服务
  microsoft: true, // 微软服务
  emby: true, //Emby影视服
  google: true, // 谷歌服务
  openai: true, // Ai和GPT
  spotify: true, // Spotify
  youtube: true, // YouTube
  bahamut: true, // 巴哈姆特/动画疯
  netflix: true, // Netflix网飞
  tiktok: true, // 国际版抖音
  disney: true, // 迪士尼
  pixiv: true, // Pixiv
  hbo: true, // HBO
  mediaHMT: false,//港澳台媒体
  bilibili: true, //哔哩哔哩
  tvb: true, // TVB
  hulu: true, // Hulu
  primevideo: true, // 亚马逊prime video
  telegram: true, // Telegram通讯软件
  line: true, // Line通讯软件
  whatsapp: true, // Whatsapp
  github: true, //Github
  games: true, // 游戏策略组
  japan: true, // 日本网站策略组
  //tracker: true, // 网络分析和跟踪服务
  ads: true, // 常见的网络广告
}

if (ruleSet === 'all') {
  Object.keys(ruleOptions).forEach(key => ruleOptions[key] = true);
} else if (typeof ruleSet === 'string') {
  const enabledKeys = ruleSet.split(';').map(s => s.trim());
  enabledKeys.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(ruleOptions, key)) {
      ruleOptions[key] = true;
    }
  });
}

// 初始规则
const rules = [
  'RULE-SET,applications,Download',
  'PROCESS-NAME-REGEX,(?i).*Oray.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*Sunlogin.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*AweSun.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*NodeBaby.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*Node Baby.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*nblink.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*vpn.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*vnc.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*tvnserver.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*节点小宝.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*AnyDesk.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*ToDesk.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*RustDesk.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*TeamViewer.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*Zerotier.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*Tailscaled.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*phddns.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*ngrok.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*frpc.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*frps.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*natapp.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*cloudflared.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*xmqtunnel.*,Direct',
  'PROCESS-NAME-REGEX,(?i).*Navicat.*,Direct',
  'DOMAIN-SUFFIX,iepose.com,Direct',
  'DOMAIN-SUFFIX,iepose.cn,Direct',
  'DOMAIN-SUFFIX,nblink.cc,Direct',
  'DOMAIN-SUFFIX,ionewu.com,Direct',
  'DOMAIN-SUFFIX,vicp.net,Direct',
]

// 地区定义 (Icons 更新为 GitHub Raw)
const allRegionDefinitions = [
  {
    name: 'HK',
    regex: /港|🇭🇰|hk|hongkong|hong kong/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hong_Kong.png',
  },
  {
    name: 'US',
    regex: /(?!.*aus)(?=.*(美|🇺🇸|us(?!t)|usa|american|united states)).*/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_States.png',
  },
  {
    name: 'JP',
    regex: /日本|🇯🇵|jp|japan/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Japan.png',
  },
  {
    name: 'KR',
    regex: /韩|🇰🇷|kr|korea/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Korea.png',
  },
  {
    name: 'SG',
    regex: /新加坡|🇸🇬|sg|singapore/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Singapore.png',
  },
  {
    name: 'CN',
    regex: /中国|🇨🇳|cn|china/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China_Map.png',
  },
  {
    name: 'TW',
    regex: /台湾|台灣|🇹🇼|tw|taiwan|tai wan/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/China.png',
  },
  {
    name: 'GB',
    regex: /英|🇬🇧|uk|united kingdom|great britain/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/United_Kingdom.png',
  },
  {
    name: 'DE',
    regex: /德国|🇩🇪|de|germany/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Germany.png',
  },
  {
    name: 'MY',
    regex: /马来|🇲🇾|my|malaysia/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Malaysia.png',
  },
  {
    name: 'TK',
    regex: /土耳其|🇹🇷|tk|turkey/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Turkey.png',
  },
  {
    name: 'CA',
    regex: /加拿大|🇨🇦|ca|canada/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Canada.png',
  },
  {
    name: 'AU',
    regex: /澳大利亚|🇦🇺|au|australia|sydney/i,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Australia.png',
  },
]

let regionDefinitions = []
if (regionSet === 'all') {
  regionDefinitions = allRegionDefinitions
} else {
  const enabledRegions = regionSet.split(';').map(s => s.trim())
  regionDefinitions = allRegionDefinitions.filter(r => {
    const prefix = r.name.substring(0, 2) // 获取前两个字母
    return enabledRegions.includes(prefix)
  })
}

const dnsConfig = {
  enable: true,
  listen: '0.0.0.0:53',
  ipv6: ipv6,
  'log-level': logLevel,
  'prefer-h3': true,
  'use-hosts': true,
  'use-system-hosts': true,
  // 'respect-rules': true,
  'enhanced-mode': 'fake-ip',
  'fake-ip-range': '198.18.0.0/16',
  'fake-ip-filter-mode': 'whitelist',
  'fake-ip-filter': [
    'geosite:gfw',
    'geosite:jetbrains-ai',
    'geosite:category-ai-!cn',
    'geosite:category-ai-chat-!cn',
    'geosite:category-games-!cn',
    'geosite:google@!cn',
    'geosite:telegram',
    'geosite:facebook',
    'geosite:google',
    'geosite:amazon',
    'geosite:category-bank-jp',
    'geosite:category-bank-cn@!cn',
  ],
  nameserver: chinaDNS,
  'default-nameserver': defaultDNS,
  'direct-nameserver': directDNS,
  // fallback: foreignDNS,
  // 'fallback-filter': {
  //   geoip: true,
  //   'geoip-code': 'CN',
  // },
  'proxy-server-nameserver': chinaDNS,
  'nameserver-policy': {
    'geosite:private': 'system',
    'geosite:tld-cn,cn,steam@cn,category-games@cn,microsoft@cn,apple@cn,category-game-platforms-download@cn,category-public-tracker':
      chinaDNS,
    'geosite:gfw,jetbrains-ai,category-ai-!cn,category-ai-chat-!cn': foreignDNS,
    // 'geosite:telegram': foreignDNS,
  },
}

// 通用配置
const ruleProviderCommon = {
  type: 'http',
  format: 'yaml',
  interval: 86400,
}
const groupBaseOption = {
  interval: 300,
  timeout: 3000,
  url: 'https://www.gstatic.com/generate_204',
  lazy: true,
  'max-failed-times': 3,
  hidden: false,
}

// 预定义 Rule Providers
const ruleProviders = {
  applications: {
    ...ruleProviderCommon,
    behavior: 'classical',
    format: 'text',
    url: 'https://github.com/DustinWin/ruleset_geodata/raw/mihomo-ruleset/applications.list',
    path: './ruleset/DustinWin/applications.list',
  },
}

// 倍率正则预编译
const multiplierRegex =
  /(?<=[xX✕✖⨉倍率])([1-9]+(\.\d+)*|0{1}\.\d+)(?=[xX✕✖⨉倍率])*/i

// --- 2. 服务规则数据结构 ---
// Icons 更新为 GitHub Raw
const serviceConfigs = [
   {
    key: 'emby',
    name: 'Emby',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Infuse.png',
    url: 'https://emby.media/',
    rules: [
      "RULE-SET,embyproxy,Emby",
      "DOMAIN-KEYWORD,emby,Emby"
    ],
    providers: [
      {
        key: 'embyproxy',
        url: 'https://raw.githubusercontent.com/bautistaclay/ios/master/Rules/Emby.list',
        path: './ruleset/bautistaclay/Emby.list',
        format: 'text',
        behavior: 'classical',
      }
    ],
  },
  {
    key: 'openai',
    name: 'AI',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Siri.png',
    url: 'https://chat.openai.com/cdn-cgi/trace',
    rules: [
      'GEOSITE,jetbrains-ai,AI',
      'GEOSITE,category-ai-!cn,AI',
      'GEOSITE,category-ai-chat-!cn,AI',
      'DOMAIN-SUFFIX,meta.ai,AI',
      'DOMAIN-SUFFIX,meta.com,AI',
      'PROCESS-NAME-REGEX,(?i).*Antigravity.*,AI',
      'PROCESS-NAME-REGEX,(?i).*language_server_.*,AI',
    ],
  },
  {
    key: 'youtube',
    name: 'YouTube',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/YouTube.png',
    url: 'https://www.youtube.com/s/desktop/494dd881/img/favicon.ico',
    rules: ['GEOSITE,youtube,YouTube'],
  },
  {
    key: 'mediaHMT',
    name: 'MediaHMT',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TVB.png',
    url: 'https://viu.tv/',
    rules: [
      'GEOSITE,tvb,MediaHMT',
      'GEOSITE,hkt,MediaHMT',
      'GEOSITE,hkbn,MediaHMT',
      'GEOSITE,hkopentv,MediaHMT',
      'GEOSITE,hkedcity,MediaHMT',
      'GEOSITE,hkgolden,MediaHMT',
      'GEOSITE,hketgroup,MediaHMT',
      'RULE-SET,hk-media,MediaHMT',
      'RULE-SET,tw-media,MediaHMT',
    ],
    providers: [
      {
        key: 'hk-media',
        url: 'https://ruleset.skk.moe/Clash/non_ip/stream_hk.txt',
        path: './ruleset/ruleset.skk.moe/stream_hk.txt',
        format: 'text',
        behavior: 'classical',
      },
      {
        key: 'tw-media',
        url: 'https://ruleset.skk.moe/Clash/non_ip/stream_tw.txt',
        path: './ruleset/ruleset.skk.moe/stream_tw.txt',
        format: 'text',
        behavior: 'classical',
      },
    ],
  },
  {
    key: 'biliintl',
    name: 'Bili',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/bilibili_3.png',
    url: 'https://www.bilibili.tv/',
    rules: ['GEOSITE,biliintl,Bili'],
  },
  {
    key: 'bahamut',
    name: 'Bahamut',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Bahamut.png',
    url: 'https://ani.gamer.com.tw/ajax/getdeviceid.php',
    rules: ['GEOSITE,bahamut,Bahamut'],
  },
  {
    key: 'disney',
    name: 'Disney+',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Disney+.png',
    url: 'https://disney.api.edge.bamgrid.com/devices',
    rules: ['GEOSITE,disney,Disney+'],
  },
  {
    key: 'netflix',
    name: 'NETFLIX',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Netflix.png',
    url: 'https://api.fast.com/netflix/speedtest/v2?https=true',
    rules: ['GEOSITE,netflix,NETFLIX'],
  },
  {
    key: 'tiktok',
    name: 'Tiktok',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/TikTok.png',
    url: 'https://www.tiktok.com/',
    rules: ['GEOSITE,tiktok,Tiktok'],
  },
  {
    key: 'spotify',
    name: 'Spotify',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Spotify.png',
    url: 'https://spclient.wg.spotify.com/signup/public/v1/account',
    rules: ['GEOSITE,spotify,Spotify'],
  },
  {
    key: 'pixiv',
    name: 'Pixiv',
    icon: 'https://play-lh.googleusercontent.com/8pFuLOHF62ADcN0ISUAyEueA5G8IF49mX_6Az6pQNtokNVHxIVbS1L2NM62H-k02rLM=w240-h480-rw',
    url: 'http://spclient.wg.spotify.com/signup/public/v1/account',
    rules: ['GEOSITE,pixiv,Pixiv'],
  },
  {
    key: 'hbo',
    name: 'HBO',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/HBO.png',
    url: 'https://www.hbo.com/favicon.ico',
    rules: ['GEOSITE,hbo,HBO'],
  },
  {
    key: 'primevideo',
    name: 'Prime Video',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Prime_Video.png',
    url: 'https://m.media-amazon.com/images/G/01/digital/video/web/logo-min-remaster.png',
    rules: ['GEOSITE,primevideo,Prime Video'],
  },
  {
    key: 'hulu',
    name: 'Hulu',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Hulu.png',
    url: 'https://auth.hulu.com/v4/web/password/authenticate',
    rules: ['GEOSITE,hulu,Hulu'],
  },
  {
    key: 'telegram',
    name: 'Telegram',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Telegram.png',
    url: 'https://www.telegram.org/img/website_icon.svg',
    rules: ['GEOIP,telegram,Telegram'],
  },
  {
    key: 'whatsapp',
    name: 'WhatsApp',
    icon: 'https://static.whatsapp.net/rsrc.php/v3/yP/r/rYZqPCBaG70.png',
    url: 'https://web.whatsapp.com/data/manifest.json',
    rules: ['GEOSITE,whatsapp,WhatsApp'],
  },
  {
    key: 'line',
    name: 'Line',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Line.png',
    url: 'https://line.me/page-data/app-data.json',
    rules: ['GEOSITE,line,Line'],
  },
  {
    key: 'games',
    name: 'Game',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Game.png',
    rules: [
      'GEOSITE,category-games@cn,China',
      'GEOSITE,category-games,Game',
    ],
  },
  {
    key: 'ads',
    name: 'Ads',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Advertising.png',
    rules: [
      'GEOSITE,category-ads-all,Ads',
      'RULE-SET,adblockmihomo,Ads',
    ],
    providers: [
      {
        key: 'adblockmihomo',
        url: 'https://github.com/217heidai/adblockfilters/raw/main/rules/adblockmihomo.mrs',
        path: './ruleset/adblockfilters/adblockmihomo.mrs',
        format: 'mrs',
        behavior: 'domain',
      },
    ],
    reject: true,
  },
  {
    key: 'apple',
    name: 'Apple',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Apple_2.png',
    url: 'https://www.apple.com/library/test/success.html',
    rules: ['GEOSITE,apple-cn,Apple'],
  },
  {
    key: 'google',
    name: 'Google',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Google_Search.png',
    url: 'https://www.google.com/generate_204',
    rules: ['GEOSITE,google,Google'],
  },
  {
    key: 'github',
    name: 'Github',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/GitHub.png',
    url: 'https://github.com/robots.txt',
    rules: ['GEOSITE,github,Github'],
  },
  {
    key: 'microsoft',
    name: 'Microsoft',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Microsoft.png',
    url: 'https://www.msftconnecttest.com/connecttest.txt',
    rules: ['GEOSITE,microsoft@cn,China', 'GEOSITE,microsoft,Microsoft'],
  },
  {
    key: 'japan',
    name: 'JapanWeb',
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/JP.png',
    url: 'https://r.r10s.jp/com/img/home/logo/touch.png',
    rules: [
      'RULE-SET,category-bank-jp,JapanWeb',
      'GEOIP,jp,JapanWeb,no-resolve',
    ],
    providers: [
      {
        key: 'category-bank-jp',
        url: 'https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-bank-jp.mrs',
        path: './ruleset/MetaCubeX/category-bank-jp.mrs',
        format: 'mrs',
        behavior: 'domain',
      },
    ],
  },
]

// --- 3. 主入口 ---

function main(config) {
  if (!enable) return config

  const proxies = config?.proxies || []
  
  // === 新增：节点过滤功能 ===
  // 定义需要过滤的关键词
  const filterKeywords = [
    '官网', 'portal', '超时', '重启', 'WIFI', 
    '订阅', '售后', 'www', '流量', '重置', 
    '套餐', '到期', 'URLTest', 'Selector'
  ];

  // 创建过滤后的新节点数组，不修改原proxies
  const filteredProxies = [];
  for (let i = 0; i < proxies.length; i++) {
    const proxy = proxies[i];
    const name = proxy.name;
    
    // 检查是否包含过滤关键词
    let shouldFilter = false;
    for (const keyword of filterKeywords) {
      if (name.includes(keyword)) {
        shouldFilter = true;
        break;
      }
    }
    
    if (!shouldFilter) {
      filteredProxies.push(proxy);
    }
    // 过滤掉的节点不加入新数组
  }
  
  // 获取原始节点的名称列表（用于Proxy组）
  const allProxyNames = proxies.map(proxy => proxy.name)
  
  // 获取过滤后节点的名称列表（用于Automatic/LoadBalance/Fallback组）
  const filteredProxyNames = filteredProxies.map(proxy => proxy.name)
  
  // 使用过滤后的节点数组进行地区分类
  const proxyCount = filteredProxies.length;
  // === 节点过滤功能结束 ===

  const proxyProviderCount =
    typeof config?.['proxy-providers'] === 'object'
      ? Object.keys(config['proxy-providers']).length
      : 0

  if (proxyCount === 0 && proxyProviderCount === 0) {
    throw new Error('配置文件中未找到任何代理')
  }

  // 3.1 覆盖基础配置
  config['allow-lan'] = true
  config['bind-address'] = '*'
  config['mode'] = 'rule'
  config['ipv6'] = ipv6
  config['external-controller'] = '0.0.0.0:1906'
  config['mixed-port'] = 7890
  config['redir-port'] = 7891
  config['tproxy-port'] = 7892
  config['external-ui'] = 'ui'
  config['external-ui-url'] =
    'https://github.com/Zephyruso/zashboard/releases/latest/download/dist.zip'
  config['dns'] = dnsConfig
  config['profile'] = {
    'store-selected': true,
    'store-fake-ip': true,
  }
  config['unified-delay'] = true
  config['tcp-concurrent'] = true
  config['keep-alive-interval'] = 1800
  config['find-process-mode'] = 'strict'
  config['geodata-mode'] = false
  config['geodata-loader'] = 'memconservative'
  config['geo-auto-update'] = true
  config['geo-update-interval'] = 24

  config['sniffer'] = {
    enable: true,
    'force-dns-mapping': true,
    'parse-pure-ip': false,
    'override-destination': true,
    sniff: {
      TLS: {
        ports: [443, 8443],
      },
      HTTP: {
        ports: [80, '8080-8880'],
      },
      QUIC: {
        ports: [443, 8443],
      },
    },
    'skip-src-address': skipIps,
    'skip-dst-address': skipIps,
    'force-domain': [
      '+.google.com',
      '+.googleapis.com',
      '+.googleusercontent.com',
      '+.youtube.com',
      '+.facebook.com',
      '+.messenger.com',
      '+.fbcdn.net',
      'fbcdn-a.akamaihd.net',
    ],
    'skip-domain': ['Mijia Cloud', '+.oray.com'],
  }

  config['ntp'] = {
    enable: true,
    'write-to-system': false,
    server: 'cn.ntp.org.cn',
  }
  config['tun'] = {
    enable: true,
    stack: 'mixed',
    device: 'utun1999',
    'auto-route': true,
    'auto-redirect': true,
    'auto-detect-interface': true,
    'strict-route': true,
    mtu: 1500,
    gso: true,
    'gso-max-size': 65536,
    'exclude-interface': ['NodeBabyLink'],
    'route-exclude-address': skipIps.filter((ip) => ip !== '198.18.0.0/16'),
    'dns-hijack': ['any:53', 'tcp://any:53'],
  }
  config['geox-url'] = {
    geoip:
      'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat',
    geosite:
      'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat',
    mmdb: 'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip.metadb',
    asn: 'https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/GeoLite2-ASN.mmdb',
  }

  config.proxies.push({
    name: 'Direct',
    type: 'direct',
    udp: true,
  })

  config.proxies.push({
    name: 'Reject',
    type: 'reject',
    udp: true,
  })

  // 3.2 高效代理分类 (单次遍历) - 使用 filteredProxies 为地区组和其他组服务
  const regionGroups = {}
  regionDefinitions.forEach(
    (r) =>
      (regionGroups[r.name] = {
        ...r,
        proxies: [],
      })
  )
  const otherProxies = []

  for (let i = 0; i < proxyCount; i++) {
    const proxy = filteredProxies[i]
    const name = proxy.name
    let matched = false

    // 检查倍率
    if (excludeHighPercentage) {
      const match = multiplierRegex.exec(name)
      if (match && parseFloat(match[1]) > globalRatioLimit) {
        continue
      }
    }

    // 尝试匹配地区
    for (const region of regionDefinitions) {
      if (region.regex.test(name)) {
        regionGroups[region.name].proxies.push(name)
        matched = true
        break
      }
    }

    if (!matched) {
      otherProxies.push(name)
    }
  }

  const generatedRegionGroups = []
  regionDefinitions.forEach((r) => {
    const groupData = regionGroups[r.name]
    if (groupData.proxies.length > 0) {
      generatedRegionGroups.push({
        ...groupBaseOption,
        name: r.name,
        type: 'url-test',
        tolerance: 50,
        icon: r.icon,
        proxies: groupData.proxies,
      })
    }
  })

  const regionGroupNames = generatedRegionGroups.map((g) => g.name)

  if (otherProxies.length > 0) {
    generatedRegionGroups.push({
      ...groupBaseOption,
      name: 'Other',
      type: 'select',
      proxies: otherProxies,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/World_Map.png',
    })
  }

  // 3.3 构建功能策略组
  const functionalGroups = []

  functionalGroups.push(
  {
    //手动选择
    ...groupBaseOption,
    name: 'Proxy',
    type: 'select',
    // Proxy组使用所有原始节点（不过滤）
    proxies: allProxyNames,
    icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Proxy.png',
  },
  {
    //策略选择
    ...groupBaseOption,
    name: "Group Select",
    type: "select",
    proxies: ["Automatic","LoadBalance","Fallback"],
    icon: "https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Back.png",
  },
  {
    //区域选择
    ...groupBaseOption,
    name: "Area Select",
    type: "select",
    proxies: [...regionGroupNames],
    icon: "https://raw.githubusercontent.com/fmz200/wool_scripts/main/icons/apps/quanqiu(1).png",
  })

  serviceConfigs.forEach((svc) => {
    if (ruleOptions[svc.key]) {
      rules.push(...svc.rules)

      if (Array.isArray(svc.providers)) {
        svc.providers.forEach((p) => {
          ruleProviders[p.key] = {
            ...ruleProviderCommon,
            behavior: p.behavior,
            format: p.format,
            url: p.url,
            path: p.path,
          }
        })
      }

      let groupProxies
      if (svc.reject) {
        groupProxies = ['Reject', 'Direct', 'Proxy']
      } else if (svc.key === 'biliintl' || svc.key === 'bahamut') {
        groupProxies = ['Direct', 'Proxy', "Group Select","Area Select", ...regionGroupNames]
      } else {
        groupProxies = [ "Group Select", "Area Select",  'Proxy','Direct',...regionGroupNames]
      }

      functionalGroups.push({
        ...groupBaseOption,
        name: svc.name,
        type: 'select',
        proxies: groupProxies,
        url: svc.url,
        icon: svc.icon,
      })
    }
  })

  // 3.4 添加通用兜底策略组
  rules.push(
    'GEOSITE,private,Direct',
    'GEOSITE,category-public-tracker,Direct',
    'GEOSITE,category-game-platforms-download@cn,Direct',
    'GEOIP,private,Direct,no-resolve',
    'GEOSITE,cn,China',
    'GEOIP,cn,China,no-resolve',
    'MATCH,Final'
  )

  functionalGroups.push(
    {
      ...groupBaseOption,
      name: 'Download',
      type: 'select',
      proxies: ['Direct', 'Proxy', "Group Select","Area Select", ...regionGroupNames],
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/Available.png',
    },
    {
      ...groupBaseOption,
      name: 'Global',
      type: 'select',
      proxies: [ "Group Select", "Area Select",  'Proxy','Direct',...regionGroupNames],
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/Streaming.png',
    },
    {
      ...groupBaseOption,
      name: 'China',
      type: 'select',
      proxies: ['Direct', 'Proxy', "Group Select","Area Select", ...regionGroupNames],
      url: 'https://wifi.vivo.com.cn/generate_204',
      icon: 'https://raw.githubusercontent.com/Orz-3/mini/master/Color/StreamingCN.png',
    },
    {
      ...groupBaseOption,
      name: 'Final',
      type: 'select',
      proxies: [ "Group Select", "Area Select",  'Proxy','Direct',...regionGroupNames],
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Final.png',
    }
  )

  // 创建需要移到Final之后的策略组
  const movedGroups = [
    {
      //延迟最低
      ...groupBaseOption,
      name: "Automatic",
      type: "url-test",
      // Automatic组使用过滤后的节点
      proxies: filteredProxyNames,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Download.png',
    },
    {
      //负载均衡
      ...groupBaseOption,
      name: "LoadBalance",
      type: "load-balance",
      // LoadBalance组使用过滤后的节点
      proxies: filteredProxyNames,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/SSID.png',
    },
    {
      //资源调度
      ...groupBaseOption,
      name: "Fallback",
      type: "fallback",
      // Fallback组使用过滤后的节点
      proxies: filteredProxyNames,
      icon: 'https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/Stack.png',
    }
  ]

  // 3.5 组装最终结果
  // 顺序：functionalGroups -> movedGroups -> generatedRegionGroups
  config['proxy-groups'] = [...functionalGroups, ...movedGroups, ...generatedRegionGroups]

  config['rules'] = rules
  config['rule-providers'] = ruleProviders

  return config
}