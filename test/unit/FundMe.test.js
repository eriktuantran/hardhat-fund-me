const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert } = require("chai")
describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        //fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async () => {
        it("set the agregator address correctly", async () => {
            //console.log("mockV3Aggregator.address", mockV3Aggregator.address)
            // response = await fundMe.priceFeed()
            // console.log("response", response)
            // assert.equal(response, mockV3Aggregator.address)
        })
    })
})
