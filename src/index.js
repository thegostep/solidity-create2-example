const assert = require("assert");
const ethers = require("ethers");

const {
  factoryAbi,
  factoryBytecode,
  factoryAddress,
  buildCreate2Address,
  buildBytecode,
  parseLogs,
  numberToUint256
} = require("./utils");

/**
 * Deploy contract using create2.
 *
 * Deploy an arbitrary contract using a create2 factory. Can be used with an ethers provider on any network.
 *
 * @param {Object} args
 * @param {String} args.salt                Salt used to calculate deterministic create2 address.
 * @param {String} args.contractBytecode    Compiled bytecode of the contract.
 * @param {Object} args.signer              Ethers.js signer of the account from which to deploy the contract.
 * @param {Array}  [args.constructorTypes]  Array of solidity types of the contract constructor.
 * @param {Array}  [args.constructorArgs]   Array of arguments of the contract constructor.
 *
 * @return {Object} Returns object with `txHash`, `address` and `receipt` from the deployed contract.
 */
async function deployContract({
  salt,
  contractBytecode,
  signer,
  constructorTypes = [],
  constructorArgs = []
}) {
  const factory = new ethers.Contract(factoryAddress, factoryAbi, signer);

  const bytecode = buildBytecode(
    constructorTypes,
    constructorArgs,
    contractBytecode
  );

  const result = await (await factory.deploy(bytecode, salt)).wait();

  const computedAddr = buildCreate2Address(numberToUint256(salt), bytecode);

  const logs = parseLogs(result, factory, 'Deployed')

  const addr = logs[0].addr.toLowerCase();
  assert.equal(addr, computedAddr);

  return {
    txHash: result.transactionHash,
    address: addr,
    receipt: result
  };
}

/**
 * Calculate create2 address of a contract.
 *
 * Calculates deterministic create2 address locally.
 *
 * @param {Object} args
 * @param {String} args.salt                Salt used to calculate deterministic create2 address.
 * @param {String} args.contractBytecode    Compiled bytecode of the contract.
 * @param {Array}  [args.constructorTypes]  Array of solidity types of the contract constructor.
 * @param {Array}  [args.constructorArgs]   Array of arguments of the contract constructor.
 *
 * @return {String} Returns the address of the create2 contract.
 */
function getCreate2Address({
  salt,
  contractBytecode,
  constructorTypes = [],
  constructorArgs = []
}) {
  const bytecode = buildBytecode(
    constructorTypes,
    constructorArgs,
    contractBytecode
  );
  return buildCreate2Address(numberToUint256(salt), bytecode);
}

/**
 * Determine if a given contract is deployed.
 *
 * Determines if a given contract is deployed at the address provided.
 *
 * @param {String} address  Address to query.
 * @param {Object} provider Ethers.js provider.
 *
 * @return {Boolean} Returns true if address is a deployed contract.
 */
async function isDeployed(address, provider) {
  const code = await provider.getCode(address);
  return code.slice(2).length > 0;
}

/**
 * Deploy create2 factory for local development.
 *
 * Deploys the create2 factory locally for development purposes. Requires funding address `0x2287Fa6efdEc6d8c3E0f4612ce551dEcf89A357A` with eth to perform deployment.
 *
 * @param {Object} provider Ethers.js provider.
 *
 * @return {String} Returns the address of the create2 factory.
 */
async function deployFactory(provider) {
  const key =
    "0x563905A5FBF71C05A44BE9240E62DBD777D69A2E20D702AA584841AF7C04E939";
  const signer = new ethers.Wallet(key, provider);
  const Factory = new ethers.ContractFactory(
    factoryAbi,
    factoryBytecode,
    signer
  );
  const factory = await Factory.deploy();
  assert.equal(factory.address, factoryAddress);
  return factory.address;
}

module.exports = {
  ethers,
  deployContract,
  deployFactory,
  getCreate2Address,
  isDeployed
};
