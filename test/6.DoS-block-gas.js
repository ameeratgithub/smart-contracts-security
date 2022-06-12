const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("DoS Block Gas Limit", function () {
    let deployer, attacker, user, vulnerableAuction, safeAuction

    beforeEach(async () => {
        [deployer, attacker, user] = await ethers.getSigners()

        const VulnerableAuction = await ethers.getContractFactory('VulnerableAuction')
        vulnerableAuction = await VulnerableAuction.deploy()
        await vulnerableAuction.deployed()

        const SafeAuction = await ethers.getContractFactory('SafeAuction')
        safeAuction = await SafeAuction.deploy()
        await safeAuction.deployed()

        await vulnerableAuction.bid({ value: 100 })
        await safeAuction.bid({ value: 100 })
        
    })

    describe("VulnerableAuction", () => {
        describe("if bid is lower than current", () => {
            it("Should NOT accept bids lower than current", async () => {
                await expect(vulnerableAuction.connect(user).bid({ value: 50 }))
                    .to.be.revertedWith("Bid not high enough")
            })
        })
        describe("if bid is higher than current Bid", () => {
            it("Should accept bid and update highest bid", async () => {
                await vulnerableAuction.connect(user).bid({ value: 150 })
                await expect(await vulnerableAuction.highestBid()).to.eq(150)
            })
            it("Should make msg.sender currentLeader", async () => {
                await vulnerableAuction.connect(user).bid({ value: 150 })
                await expect(await vulnerableAuction.currentLeader()).to.eq(user.address)
            })
            it("Should add previous leader and highestBid to refunds ", async () => {
                await vulnerableAuction.connect(user).bid({ value: 150 })
                const [addr, amount] = await vulnerableAuction.refunds(0)

                expect(addr).to.eq(deployer.address)
                expect(amount).to.eq(100)
            })
        })
        describe("When calling refundAll()", () => {
            it("should refund the bidders who didn't win", async () => {
                await vulnerableAuction.connect(user).bid({ value: 150 })
                await vulnerableAuction.bid({ value: 200 })

                const userBalanceBefore = await ethers.provider.getBalance(user.address)
                await vulnerableAuction.refundAll()
                const userBalanceAfter = await ethers.provider.getBalance(user.address)

                expect(userBalanceAfter).to.eq(userBalanceBefore.add(150))

            })
            it("should reject if the amount of computation hits the block gas limit", async () => {

                for (let i = 0; i < 1500; i++) {
                    await vulnerableAuction.connect(attacker).bid({ value: 150 + i })
                }

                await expect(vulnerableAuction.refundAll()).to.be.rejectedWith("Transaction ran out of gas")

            })

        })
    })
    describe("SafeAuction", () => {
        describe("Pull over push solution", () => {
            it("should be able to be refunded for small amount of bids", async () => {
                await safeAuction.connect(user).bid({ value: ethers.utils.parseEther("1") })

                await safeAuction.bid({ value: ethers.utils.parseEther("2") })

                const userBalanceBefore = await ethers.provider.getBalance(user.address)

                await safeAuction.connect(user).withdrawRefund()

                const userBalanceAfter = await ethers.provider.getBalance(user.address)

                expect(userBalanceAfter).to.be.gt(userBalanceBefore)
            })
            it("should be able to be refunded for a very large number of bids", async () => {
                for (let i = 0; i < 1500; i++) {
                    await safeAuction.connect(attacker).bid({ value: ethers.utils.parseEther("0.0001") + i })
                }

                const attackerBalanceBefore = await ethers.provider.getBalance(attacker.address)

                await safeAuction.connect(attacker).withdrawRefund()

                const attackerBalanceAfter = await ethers.provider.getBalance(attacker.address)

                expect(attackerBalanceAfter).to.be.gt(attackerBalanceBefore)
            })

        })
    })
});