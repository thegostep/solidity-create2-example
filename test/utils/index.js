const assert = require("assert");

const {
  abi: factoryAbi,
  bytecode: factoryBytecode
} = require("../../artifacts/Create2Deployer.json");
const {
  abi: accountAbi,
  bytecode: accountBytecode
} = require("../../artifacts/Account.json");

async function deployFactory() {
  const Factory = await ethers.getContractFactory("Create2Deployer");
  const factory = await Factory.deploy();
  return factory.address;
}

async function deployAccount(factoryAddress, salt, recipient) {
  const signer = (await ethers.getSigners())[0];
  const provider = signer.provider;
  const account = await signer.getAddress();
  const nonce = await provider.getTransactionCount(account);

  const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);

  const bytecode = `${accountBytecode}${encodeParam("address", recipient).slice(
    2
  )}`;

  const result = await (await factory.deploy(bytecode, salt)).wait();

  const computedAddr = buildCreate2Address(
    factoryAddress,
    numberToUint256(salt),
    bytecode
  );

  const addr = result.events[0].args.addr.toLowerCase();
  assert.equal(addr, computedAddr);

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  };
}

function buildCreate2Address(creatorAddress, saltHex, byteCode) {
  return `0x${ethers.utils
    .keccak256(
      `0x${["ff", creatorAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map(x => x.replace(/0x/, ""))
        .join("")}`
    )
    .slice(-40)}`.toLowerCase();
}

function numberToUint256(value) {
  const hex = value.toString(16);
  return `0x${"0".repeat(64 - hex.length)}${hex}`;
}

function encodeParam(dataType, data) {
  const abiCoder = ethers.utils.defaultAbiCoder;
  return abiCoder.encode([dataType], [data]);
}

function encodeParams(dataTypes, data) {
  const abiCoder = ethers.utils.defaultAbiCoder;
  return abiCoder.encode(dataTypes, data);
}

async function isContract(address) {
  const code = await ethers.provider.getCode(address);
  return code.slice(2).length > 0;
}

module.exports = {
  deployFactory,
  deployAccount,
  buildCreate2Address,
  numberToUint256,
  encodeParam,
  encodeParams,
  isContract
};
