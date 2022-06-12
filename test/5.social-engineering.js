const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("Tx.origin", function () {
    let deployer, attacker, user, vulnerableSmallWallet, secureSmallWallet, attackerContract

    beforeEach(async () => {
        [deployer, attacker, user] = await ethers.getSigners()

        const VulnerableSmallWallet = await ethers.getContractFactory('VulnerableSmallWallet')
        vulnerableSmallWallet = await VulnerableSmallWallet.deploy()
        await vulnerableSmallWallet.deployed()
        
        const SecureSmallWallet = await ethers.getContractFactory('SecureSmallWallet')
        secureSmallWallet = await SecureSmallWallet.deploy()
        await secureSmallWallet.deployed()

        await deployer.sendTransaction({ to: vulnerableSmallWallet.address, value: 1000 })
        await deployer.sendTransaction({ to: secureSmallWallet.address, value: 1000 })

        const AttackerContract = await ethers.getContractFactory('Attacker', attacker)
        attackerContract = await AttackerContract.deploy(vulnerableSmallWallet.address)
        await attackerContract.deployed()

    })

    describe("VulnerableSmallWallet", () => {
        it("Should accept deposits", async () => {
            expect(await ethers.provider.getBalance(vulnerableSmallWallet.address)).to.eq(1000)
        })
        it("Should allow owner to execute withdrawAll", async () => {
            const initialUserBalance = await ethers.provider.getBalance(user.address)

            await vulnerableSmallWallet.withdrawAll(user.address)

            expect(await ethers.provider.getBalance(vulnerableSmallWallet.address)).to.eq(0)
            expect(await ethers.provider.getBalance(user.address)).to.eq(initialUserBalance.add(1000))
        })
        it("Should revert if withdrawAll is not called by owner", async () => {
            await expect(vulnerableSmallWallet.connect(attacker).withdrawAll(attacker.address))
                .to.be.revertedWith("Caller not authorized")
        })

        describe("Attack", () => {
            it("Should drain the victim out if vulnerableSmallWallet's owner sends ether to Attacker's contract", async () => {
                const attackerInitialBalance = await ethers.provider.getBalance(attacker.address)
                await deployer.sendTransaction({ to: attackerContract.address, value: 1 })

                expect(await ethers.provider.getBalance(vulnerableSmallWallet.address)).to.eq(0)
                expect(await ethers.provider.getBalance(attacker.address)).to.eq(attackerInitialBalance.add(1000))
                
            })
        })

    })
    describe("SecureSmallWallet", () => {
        describe("Attack", () => {
            it("Should throw error of attacker sends request to secure contract", async () => {
                
                await attackerContract.connect(attacker).update(secureSmallWallet.address)
                await expect(deployer.sendTransaction({ to: attackerContract.address, value: 1 }))
                .to.be.revertedWith("Caller not authorized")


                
            })
        })

    })
});