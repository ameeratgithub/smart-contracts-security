const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("Access Control", function () {
  let deployer, attacker, newOwner, vulnerableAgreedPrice, secureAgreedPrice

  beforeEach(async () => {
    [deployer, attacker, newOwner] = await ethers.getSigners()

    const VulnerableAgreedPrice = await ethers.getContractFactory('VulnerableAgreedPrice')
    vulnerableAgreedPrice = await VulnerableAgreedPrice.deploy(100)
    await vulnerableAgreedPrice.deployed()

    const SecureAgreedPrice = await ethers.getContractFactory('SecureAgreedPrice')
    secureAgreedPrice = await SecureAgreedPrice.deploy(100)
    await secureAgreedPrice.deployed()


  })

  describe('Vulnerable Agreed Price', () => {
    it('should set value while deploying', async () => {
      expect((await vulnerableAgreedPrice.price()).toString()).to.eq('100')
    })
    it('should change value when attacker attacks', async () => {
      await vulnerableAgreedPrice.connect(attacker).updatePrice(1000)
      expect((await vulnerableAgreedPrice.price()).toString()).to.eq('1000')
    })
  })
  describe('Secure Agreed Price', () => {
    it('should set value while deploying', async () => {
      expect((await secureAgreedPrice.price()).toString()).to.eq('100')
    })
    it('checks if deployer is the owner ', async () => {
      expect(await secureAgreedPrice.owner()).to.eq(deployer.address)
    })
    it('should change value when owner changes', async () => {
      await secureAgreedPrice.updatePrice(1000)
      expect((await secureAgreedPrice.price()).toString()).to.eq('1000')
    })
    it('should not change the value when attacker attacks', async () => {
      await expect(secureAgreedPrice.connect(attacker).updatePrice(1000)).to.be.rejectedWith(`You're not authorized`)
      expect((await vulnerableAgreedPrice.price()).toString()).to.not.eq('1000')
    })

    it('should be possible for the owner to change ownership', async () => {
      await secureAgreedPrice.changeOwner(newOwner.address)
      expect(await secureAgreedPrice.owner()).to.eq(newOwner.address)
    })
    it('should change value when new owner changes', async () => {
      await secureAgreedPrice.changeOwner(newOwner.address)
      await secureAgreedPrice.connect(newOwner).updatePrice(1000)
      expect((await secureAgreedPrice.price()).toString()).to.eq('1000')
    })
    it('should change value when owner changes', async () => {
      await expect(secureAgreedPrice.connect(attacker).changeOwner(attacker.address))
        .to.be.rejectedWith(`You're not authorized`)
      expect(await secureAgreedPrice.owner()).to.eq(deployer.address)
    })
  })
});
