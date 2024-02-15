import { TransactionReceipt } from '@ethersproject/providers'
import assert from 'assert'
import { Provider, Signer, ethers } from 'ethers'

import {
  buildBytecode,
  buildCreate2Address,
  factoryAbi,
  factoryAddress,
  factoryBytecode,
  parseEvents,
  saltToHex,
} from './utils'

/**
 * Deploy contract using create2.
 *
 * Deploy an arbitrary contract using a create2 factory. Can be used with an ethers provider on any network.
 *
 */
export async function deployContract({
  salt,
  contractBytecode,
  constructorTypes = [] as string[],
  constructorArgs = [] as any[],
  signer,
}: {
  salt: string | number
  contractBytecode: string
  constructorTypes?: string[]
  constructorArgs?: any[]
  signer: Signer
}) {
  const saltHex = saltToHex(salt)

  const factory = new ethers.Contract(factoryAddress, factoryAbi, signer)

  const bytecode = buildBytecode(
    constructorTypes,
    constructorArgs,
    contractBytecode,
  )

  const result = await (await factory.deploy(bytecode, saltHex)).wait()

  const computedAddr = buildCreate2Address(saltHex, bytecode)

  const logs = parseEvents(result, factory.interface, 'Deployed')

  const addr = logs[0]?.args.addr.toLowerCase()
  assert.strictEqual(addr, computedAddr)

  return {
    txHash: result.transactionHash as string,
    address: addr as string,
    receipt: result as TransactionReceipt,
  }
}

/**
 * Calculate create2 address of a contract.
 *
 * Calculates deterministic create2 address locally.
 *
 */
export function getCreate2Address({
  salt,
  contractBytecode,
  constructorTypes = [] as string[],
  constructorArgs = [] as any[],
}: {
  salt: string | number
  contractBytecode: string
  constructorTypes?: string[]
  constructorArgs?: any[]
}) {
  return buildCreate2Address(
    saltToHex(salt),
    buildBytecode(constructorTypes, constructorArgs, contractBytecode),
  )
}

/**
 * Determine if a given contract is deployed.
 *
 * Determines if a given contract is deployed at the address provided.
 *
 */
export async function isDeployed(address: string, provider: Provider) {
  const code = await provider.getCode(address)
  return code.slice(2).length > 0
}

/**
 * Deploy create2 factory for local development.
 *
 * Deploys the create2 factory locally for development purposes. Requires funding address `0x2287Fa6efdEc6d8c3E0f4612ce551dEcf89A357A` with eth to perform deployment.
 *
 */
export async function deployFactory(provider: Provider) {
  const key =
    '0x563905A5FBF71C05A44BE9240E62DBD777D69A2E20D702AA584841AF7C04E939'
  const signer = new ethers.Wallet(key, provider)
  const Factory = new ethers.ContractFactory(
    factoryAbi,
    factoryBytecode,
    signer,
  )
  const factory = await Factory.deploy()
  const address = await factory.getAddress()
  assert.strictEqual(address, factoryAddress)
  return address
}
