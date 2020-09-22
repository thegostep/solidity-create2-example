import { ethers } from '@nomiclabs/buidler'
import { Signer } from 'ethers'
import { assert } from 'chai'

import {
  deployContract,
  deployFactory,
  getCreate2Address,
  isDeployed,
} from '../src/index'

describe('Happy Path', function () {
  let signer: Signer
  let accountBytecode: string

  before(async () => {
    signer = (await ethers.getSigners())[0]
    accountBytecode = (await ethers.getContractFactory('Account')).bytecode
  })

  it('should deploy factory', async function () {
    await (
      await signer.sendTransaction({
        to: '0x2287Fa6efdEc6d8c3E0f4612ce551dEcf89A357A',
        value: ethers.utils.parseEther('1'),
      })
    ).wait()
    const factoryAddress = await deployFactory(ethers.provider)
    console.log('Factory:', factoryAddress)
  })

  it('should deploy with string salt', async function () {
    const salt = 'hello'

    const computedAddr = getCreate2Address({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ['address'],
      constructorArgs: ['0x303de46de694cc75a2f66da93ac86c6a6eee607e'],
    })

    console.log('Create2Address', computedAddr)
    assert(
      !(await isDeployed(computedAddr, ethers.provider)),
      'contract already deployed at this address',
    )

    const result = await deployContract({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ['address'],
      constructorArgs: ['0x303de46de694cc75a2f66da93ac86c6a6eee607e'],
      signer,
    })

    console.log('ContractAddress', result.address)
    assert(
      await isDeployed(computedAddr, ethers.provider),
      'contract not deployed at this address',
    )
  })

  it('should deploy with number salt', async function () {
    const salt = 1234

    const computedAddr = getCreate2Address({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ['address'],
      constructorArgs: ['0x303de46de694cc75a2f66da93ac86c6a6eee607e'],
    })

    console.log('Create2Address', computedAddr)
    assert(
      !(await isDeployed(computedAddr, ethers.provider)),
      'contract already deployed at this address',
    )

    const result = await deployContract({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ['address'],
      constructorArgs: ['0x303de46de694cc75a2f66da93ac86c6a6eee607e'],
      signer,
    })

    console.log('ContractAddress', result.address)
    assert(
      await isDeployed(computedAddr, ethers.provider),
      'contract not deployed at this address',
    )
  })
})
