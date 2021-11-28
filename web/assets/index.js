const Buffer = buffer.Buffer

const abi = [{"constant":true,"inputs":[],"name":"getNodes","outputs":[{"name":"","type":"address[]"}],"payable":false,"stateMutability":"view","type":"offchain"},{"constant":false,"inputs":[{"name":"requestAddr","type":"string"},{"name":"requestId","type":"uint64"},{"name":"data","type":"string"}],"name":"requestedData","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"walletAddr","type":"address"}],"name":"isNode","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"offchain"},{"constant":false,"inputs":[],"name":"stakeForNode","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"contractAddr","type":"address"}],"name":"fundContract","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"requestAddr","type":"string"}],"name":"request","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"contractAddr","type":"address"}],"name":"getContractBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"offchain"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"inputs":[{"indexed":false,"name":"requestAddr","type":"string"},{"indexed":false,"name":"resultData","type":"string"}],"name":"_vitelinkCallback","type":"message"},{"anonymous":false,"inputs":[{"indexed":false,"name":"requestAddr","type":"string"},{"indexed":false,"name":"requestId","type":"uint64"}],"name":"requested","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"rewardedAddr","type":"address"}],"name":"rewarded","type":"event"}]
const offchaincode = Buffer.from(
    "60806040526004361061005b576000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff168063033feaf91461005d5780631f206ab8146100bd578063d50418801461011b5761005b565b005b610065610175565b6040518080602001828103825283818151815260200191508051906020019060200280838360005b838110156100a95780820151818401525b60208101905061008d565b505050509050019250505060405180910390f35b610101600480360360208110156100d45760006000fd5b81019080803574ffffffffffffffffffffffffffffffffffffffffff16906020019092919050505061020d565b604051808215151515815260200191505060405180910390f35b61015f600480360360208110156101325760006000fd5b81019080803574ffffffffffffffffffffffffffffffffffffffffff16906020019092919050505061026d565b6040518082815260200191505060405180910390f35b606060046000508054806020026020016040519081016040528092919081815260200182805480156101fe57602002820191906000526020600021905b8160009054906101000a900474ffffffffffffffffffffffffffffffffffffffffff1674ffffffffffffffffffffffffffffffffffffffffff16815260200190600101908083116101b2575b5050505050905061020a565b90565b6000600160005060008374ffffffffffffffffffffffffffffffffffffffffff1674ffffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002160009054906101000a900460ff169050610268565b919050565b6000600360005060008374ffffffffffffffffffffffffffffffffffffffffff1674ffffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000216000505490506102be565b91905056fea165627a7a723058203feaaadc8844e6f8735965ac57890c2072ed94e295179b21f4ddf56a449d3d370029"
, "hex").toString("base64")

const contractAddress = "vite_dcf2b004a958b76f4427c7cbdfe2eba758e66da696308ae9cb"

const httpProvider = new $vite_HTTP.HTTP_RPC("https://buidl.vite.net/gvite/http")

window.onload = function () {
  const fundqr = new QRCode("fundQr", {
    width: 240,
    height: 240,
    correctLevel : QRCode.CorrectLevel.L
  })

  const stakeqr = new QRCode("stakeQr", {
    text: `vite:${contractAddress}/stakeForNode`,
    width: 240,
    height: 240,
    correctLevel: QRCode.CorrectLevel.L
  })

  document.getElementById('fundAddress').oninput = function () {
    fundqr.makeCode(`vite:${document.getElementById('fundAddress').value}/fundContract`)
  }

  const onConnect = async () => {
    await new Promise((res) => setTimeout(res, 0))

    const fee = await (async () => {
        const call = $vite_vitejs.abi.encodeFunctionCall(abi, [], "getNodes")
        
        const result = await api.request("contract_callOffChainMethod", {
            address: contractAddress,
            data: Buffer.from(call, "hex").toString("base64"),
            code: offchaincode
        })
        const decoded = $vite_vitejs.abi.decodeParameters(
            abi.find(e => e.name === "getNodes").outputs.map(e => e.type),
            Buffer.from(result, "base64").toString("hex")
        )
        document.getElementById("nodeCount").textContent = `${String(decoded[0]).split(',').length}`
        return parseInt(decoded[0])
    })()

    document.getElementById("contractAddress").innerText = contractAddress
  }

  const api = new $vite_vitejs.ViteAPI(httpProvider, onConnect)
}