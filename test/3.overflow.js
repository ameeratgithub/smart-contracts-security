const { expect } = require("chai").use(require('chai-as-promised'));
const { ethers } = require("hardhat");

describe("VulnerableToken", function () {
    let deployer, attacker, user
  
    beforeEach(async () => {
      [deployer, attacker, user] = await ethers.getSigners()
  
      const VulnerableAgreedPrice = await ethers.getContractFactory('VulnerableToken')
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
        await expect(secureAgreedPrice.connect(attacker).updatePrice(1000)).to.be.rejectedWith(`Ownable: caller is not the owner`)
        expect((await vulnerableAgreedPrice.price()).toString()).to.not.eq('1000')
      })
      
    })
  });