const vite = require('@vite/vitejs')
const wsRpc = require('@vite/vitejs-ws').WS_RPC

const conf = require('./config.json')
const requestVm = require('./src/requestVm')

const events = require('events')

const contractService = new events.EventEmitter()
const myAccount = vite.wallet.getWallet(conf.vite.walletMnemonics).deriveAddress(0)

const api = new vite.ViteAPI(new wsRpc(conf.vite.nodeAddress, 6e5, {
  clientConfig: '',
  headers: '',
  protocol: '',
  retryTimes: Infinity,
  retryInterval: 10000
}), async () => {
  const signatures = {}

  for (const f of conf.vite.contractToWatch.abi) {
    if (f.type === 'event') return
    signatures[vite.abi.encodeLogSignature(f)] = f
  }

  await api.subscribe('createVmlogSubscription', {
    addressHeightRange: {
      [conf.vite.contractToWatch.address]: {
        fromHeight: '0',
        toHeight: '0'
      }
    }
    }).then(event => {
    event.on(async (results) => {
      for (const result of results) {
        const f = signatures[result.vmlog.topics[0]]
        if (!f) return

        const decoded = vite.abi.decodeLog(
          f.inputs,
          Buffer.from(result.vmlog.data, 'base64').toString('hex'),
          result.vmlog.topics.slice(1)
        )

        const data = {}
        for (const input of f.inputs) {
          data[input.name] = decoded[input.name]
        }
        contractService.emit(f.name, data)
      }
    })
  })
  console.log('hello')
})

contractService.on('requested', async (data) => {
  console.log('uh')
  requestVm.request(data.requestAddr).then(async webData => {
    if (webData.startsWith('err')) return
    const dataBlock = accountBlock.createAccountBlock('callContract', {
      address: myAccount.address,
      abi: conf.vite.contractToWatch.abi,
      methodName: 'requestedData',
      toAddress: conf.vite.contractToWatch.address,
      params: [ data.requestAddr, webData ]
    }).setProvider(api).setPrivateKey(myAccount.privateKey)

    await dataBlock.autoSetPreviousAccountBlock()
    await dataBlock.sign().send()
  })
})

contractService.on('rewarded', (data) => {
  if (data.rewardedAddr !== myAccount.address) return
  console.log('Rewarded 1 VLNK to your account by consensus.')
})

console.log('Vitelink node v0.7 | Ready!')