const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("Overflow in smart contracts", function () {
    let deployer, attacker, user, vulnerableToken, secureToken

    beforeEach(async () => {
        [deployer, attacker, user] = await ethers.getSigners()

        const VulnerableToken = await ethers.getContractFactory('VulnerableToken')
        vulnerableToken = await VulnerableToken.deploy(1000)
        await vulnerableToken.deployed()

          const SecureToken = await ethers.getContractFactory('SecureToken')
          secureToken = await SecureToken.deploy(1000)
          await secureToken.deployed()


    })

    describe('VulnerableToken', () => {
        it('should allow a user to transfer amounts smaller than or equal to its balance', async () => {
            await vulnerableToken.transfer(user.address, 1)
            expect(await vulnerableToken.balanceOf(user.address)).to.eq(1)
            expect(await vulnerableToken.balanceOf(deployer.address)).to.eq(
                (await vulnerableToken.totalSupply()) - 1
            )
        })

        /**
         * @desc - It should revert in secure contract, but as this contract is vulnerable, it won't revert
         * @notice - Attacker is transfering more tokens than he has
         */

        it('Should not revert if the attacker tries to transfer an amount greater than its balance', async () => {
            await vulnerableToken.transfer(attacker.address, 10)

            await expect(vulnerableToken.connect(attacker).transfer(user.address, 11))
                .to.not.be.revertedWith("Not enough tokens")
        })

        /**
         * @desc - It would cause overflow because attacker is transfering more than his balance
         * @dev - In a uint256 overflow, 10-11 would be equal to 2^256 - 1
         * @dev - MaxUint256 is equal to 2^256 - 1
         */
        it('Should overflow if an attacker transfers an amount greater than its balance', async () => {
            await vulnerableToken.transfer(attacker.address, 10)

            const initialAttackerBalance = await vulnerableToken.balanceOf(attacker.address)
            console.log(`Initial attacker balance: ${initialAttackerBalance.toString()} tokens`)
            
            await vulnerableToken.connect(attacker).transfer(user.address, 11)

            const finalAttackerBalance = await vulnerableToken.balanceOf(attacker.address)
            console.log(`Final attacker balance: ${finalAttackerBalance.toString()} tokens`)

            expect(await vulnerableToken.balanceOf(attacker.address)).to.eq(ethers.constants.MaxUint256)
        })

    })
    describe('Secure Token', () => {
        /**
         * 
         * @desc - It should revert in secure contract
         * @notice - Attacker is transfering more tokens than he has
         * @
         */

         it('Should revert if the attacker tries to transfer an amount greater than its balance', async () => {
            await secureToken.transfer(attacker.address, 10)

            await expect(secureToken.connect(attacker).transfer(user.address, 11))
                .to.be.revertedWith("Not enough tokens")
        })

    })
});