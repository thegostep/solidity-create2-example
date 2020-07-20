const assert = require("assert");
const ethers = require("ethers");

const factoryAddress = "0x4a27c059FD7E383854Ea7DE6Be9c390a795f6eE3";
const factoryBytecode =
  "0x608060405234801561001057600080fd5b506101b3806100206000396000f3fe608060405234801561001057600080fd5b506004361061002b5760003560e01c80639c4ae2d014610030575b600080fd5b6100f36004803603604081101561004657600080fd5b810190808035906020019064010000000081111561006357600080fd5b82018360208201111561007557600080fd5b8035906020019184600183028401116401000000008311171561009757600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f820116905080830192505050505050509192919290803590602001909291905050506100f5565b005b6000818351602085016000f59050803b61010e57600080fd5b7fb03c53b28e78a88e31607a27e1fa48234dce28d5d9d9ec7b295aeb02e674a1e18183604051808373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020018281526020019250505060405180910390a150505056fea265627a7a72315820d9c09b41b3c6591ba80cae0b1fbcba221c30c329fceb03a0352e0f93fb79893264736f6c63430005110032";
const factoryAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "addr",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "salt",
        type: "uint256",
      },
    ],
    name: "Deployed",
    type: "event",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "bytes",
        name: "code",
        type: "bytes",
      },
      {
        internalType: "uint256",
        name: "salt",
        type: "uint256",
      },
    ],
    name: "deploy",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

function buildBytecode(constructorTypes, constructorArgs, contractBytecode) {
  return `${contractBytecode}${encodeParams(
    constructorTypes,
    constructorArgs
  ).slice(2)}`;
}

function buildCreate2Address(saltHex, byteCode) {
  const factoryAddress = "0x4a27c059FD7E383854Ea7DE6Be9c390a795f6eE3";
  return `0x${ethers.utils
    .keccak256(
      `0x${["ff", factoryAddress, saltHex, ethers.utils.keccak256(byteCode)]
        .map((x) => x.replace(/0x/, ""))
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

const parseEvents = (receipt, interface, eventName) =>
  receipt.logs
    .map((log) => interface.parseLog(log))
    .filter((log) => log.name === eventName);

module.exports = {
  factoryAddress,
  factoryAbi,
  factoryBytecode,
  buildCreate2Address,
  buildBytecode,
  numberToUint256,
  encodeParam,
  encodeParams,
  parseEvents,
  isContract,
};
