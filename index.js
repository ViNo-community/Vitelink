const vite = require('@vite/vitejs')
const wsRpc = require('@vite/vitejs-ws').WS_RPC

const conf = require('./config.json')
const requestVm = require('./src/request/requestVm')
const { styledLog } = require('./src/node/consoleStyling')
const contractData = require('./src/data')

const events = require('events')

const contractService = new events.EventEmitter()
const myAccount = vite.wallet.getWallet(conf.walletMnemonics).deriveAddress(0)

const api = new vite.ViteAPI(new wsRpc(conf.nodeAddress, 6e5, {
  clientConfig: '',
  headers: '',
  protocol: '',
  retryTimes: Infinity,
  retryInterval: 10000
}), async () => {
  const signatures = {}

  contractData.abi.forEach(f => {
    if (f.type !== 'event') return
    signatures[vite.abi.encodeLogSignature(f)] = f
  })

  await api.subscribe('createVmlogSubscription', {
    addressHeightRange: {
      [contractData.address]: {
        fromHeight: '0',
        toHeight: '0'
      }
    }
    }).then((event) => {
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
    }).catch(err => {
      console.warn(err)
    })
})

contractService.on('requested', async (data) => {
  styledLog(`New VLNK request detected! Address: ${data.requestAddr}.`)
  
  requestVm.request(data.requestAddr).then(async webData => {
    const dataBlock = vite.accountBlock.createAccountBlock('callContract', {
      address: myAccount.address,
      abi: contractData.abi,
      methodName: 'requestedData',
      toAddress: contractData.address,
      params: [ data.requestAddr, data.requestId, webData ]
    }).setProvider(api).setPrivateKey(myAccount.privateKey)

    await dataBlock.autoSetPreviousAccountBlock()
    await dataBlock.sign().send()
  })
})

contractService.on('rewarded', (data) => {
  if (data.rewardedAddr !== myAccount.address) return
  styledLog('Rewarded 1 VLNK to your account by consensus.')
})

styledLog('Vitelink node v0.8 | Ready!')