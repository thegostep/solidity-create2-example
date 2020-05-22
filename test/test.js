
const {
  deployContract,
  deployFactory,
  getCreate2Address,
  isDeployed
} = require("../src/index");

const {
  abi: accountAbi,
  bytecode: accountBytecode
} = require("../artifacts/Account.json");

describe("CreateDeployer", function() {
  it("Happy Path", async function() {
    const signer = (await ethers.getSigners())[0];
    await (
      await signer.sendTransaction({
        to: "0x2287Fa6efdEc6d8c3E0f4612ce551dEcf89A357A",
        value: ethers.utils.parseEther("1")
      })
    ).wait();
    const factoryAddress = await deployFactory(ethers.provider);
    console.log(factoryAddress);

    const salt = 1;

    const computedAddr = getCreate2Address({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ["address"],
      constructorArgs: ["0x303de46de694cc75a2f66da93ac86c6a6eee607e"]
    });

    console.log(computedAddr);
    console.log(await isDeployed(computedAddr, ethers.provider));

    const result = await deployContract({
      salt,
      contractBytecode: accountBytecode,
      constructorTypes: ["address"],
      constructorArgs: ["0x303de46de694cc75a2f66da93ac86c6a6eee607e"],
      signer
    });

    console.log(result.txHash);
    console.log(result.address);

    console.log(await isDeployed(computedAddr, ethers.provider));
  });
});
