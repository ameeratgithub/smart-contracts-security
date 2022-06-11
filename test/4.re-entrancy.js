const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("Re-entrancy vulnerability in smart contracts", function () {
    let deployer, attacker, user, vulnerableSavingsAccount, secureSavingsAccount, badInvestor
    let guardedSavingsAccount

    beforeEach(async () => {
        [deployer, attacker, user] = await ethers.getSigners()

        const VulnerableSavingsAccount = await ethers.getContractFactory('VulnerableSavingsAccount')
        vulnerableSavingsAccount = await VulnerableSavingsAccount.deploy()
        await vulnerableSavingsAccount.deployed()

        await vulnerableSavingsAccount.deposit({ value: ethers.utils.parseEther("100") })
        await vulnerableSavingsAccount.connect(user).deposit({ value: ethers.utils.parseEther("50") })

        const BadInvestor = await ethers.getContractFactory('BadInvestor', attacker)
        badInvestor = await BadInvestor.deploy(vulnerableSavingsAccount.address)
        await badInvestor.deployed()


        const SecureSavingsAccount = await ethers.getContractFactory('SecureSavingsAccount')
        secureSavingsAccount = await SecureSavingsAccount.deploy()
        await secureSavingsAccount.deployed()

        await secureSavingsAccount.deposit({ value: ethers.utils.parseEther("100") })
        await secureSavingsAccount.connect(user).deposit({ value: ethers.utils.parseEther("50") })
        
        const GuardedSavingsAccount = await ethers.getContractFactory('GuardedSavingsAccount')
        guardedSavingsAccount = await GuardedSavingsAccount.deploy()
        await guardedSavingsAccount.deployed()

        await guardedSavingsAccount.deposit({ value: ethers.utils.parseEther("100") })
        await guardedSavingsAccount.connect(user).deposit({ value: ethers.utils.parseEther("50") })


    })

    describe('Vulnerable Saving Account', () => {
        describe("Deposit and withdraw from EOA", () => {
            it('should accept deposits', async () => {
                const deployerBalance = await vulnerableSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(ethers.utils.parseEther("100"))

                const userBalance = await vulnerableSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })

            it('Should be possible to withdraw', async () => {
                await vulnerableSavingsAccount.withdraw()

                const deployerBalance = await vulnerableSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(0)

                const userBalance = await vulnerableSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })
        })
        describe("Bad Investor", () => {
            it('should be possible for an attacker to withdraw all ETH', async () => {

                console.log("")
                console.log("*** Before Attack ***")
                console.log(`VulnerableSavingsAccount's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(vulnerableSavingsAccount.address))}`)
                console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)
                
                await badInvestor.attack({value:ethers.utils.parseEther("10")})

                console.log("")
                console.log("*** After Attack ***")
                console.log(`VulnerableSavingsAccount's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(vulnerableSavingsAccount.address))}`)
                console.log(`Attackers's balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`)

                expect(await ethers.provider.getBalance(vulnerableSavingsAccount.address)).to.eq(0)
            })
        })

    })
    describe('Secure Saving Account', () => {

        describe("Deposit and withdraw from EOA", () => {
            it('should accept deposits', async () => {
                const deployerBalance = await secureSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(ethers.utils.parseEther("100"))

                const userBalance = await secureSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })

            it('Should be possible to withdraw', async () => {
                await secureSavingsAccount.withdraw()

                const deployerBalance = await secureSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(0)

                const userBalance = await secureSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })
        })
        describe("Bad Investor", () => {
            it('should be not be possible for an attacker to withdraw all ETH', async () => {
                await badInvestor.updateSavingsAccount(secureSavingsAccount.address)
                await expect(
                    badInvestor.attack({value:ethers.utils.parseEther("10")})
                ).to.be.revertedWith("Unable to send value")
            })
        })

    })
    describe('Guarded Saving Account', () => {

        describe("Deposit and withdraw from EOA", () => {
            it('should accept deposits', async () => {
                const deployerBalance = await guardedSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(ethers.utils.parseEther("100"))

                const userBalance = await guardedSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })

            it('Should be possible to withdraw', async () => {
                await guardedSavingsAccount.withdraw()

                const deployerBalance = await guardedSavingsAccount.balanceOf(deployer.address)
                expect(deployerBalance).to.eq(0)

                const userBalance = await guardedSavingsAccount.balanceOf(user.address)
                expect(userBalance).to.eq(ethers.utils.parseEther("50"))
            })
        })
        describe("Bad Investor", () => {
            it('should be not be possible for an attacker to withdraw all ETH', async () => {
                await badInvestor.updateSavingsAccount(guardedSavingsAccount.address)
                await expect(
                    badInvestor.attack({value:ethers.utils.parseEther("10")})
                ).to.be.revertedWith("Unable to send value")
            })
        })

    })
});