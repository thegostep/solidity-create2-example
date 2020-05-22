const assert = require("assert");
const ethers = require("ethers");

const {
  abi: factoryAbi,
  bytecode: factoryBytecode
} = require("../artifacts/Create2Deployer.json");

const factoryAddress = "0x4a27c059FD7E383854Ea7DE6Be9c390a795f6eE3";

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
  factoryAddress,
  factoryAbi,
  factoryBytecode,
  buildCreate2Address,
  buildBytecode,
  numberToUint256,
  encodeParam,
  encodeParams,
  isContract
};
