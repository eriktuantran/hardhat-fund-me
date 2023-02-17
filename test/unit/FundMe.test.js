const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
describe("FundMe", async () => {
    let fundMe
    let deployer
    let mockV3Aggregator
    const sendValue = ethers.utils.parseEther("2.5") // 1 ETH
    beforeEach(async () => {
        // const accounts = await ethers.getSigners()
        // deployer = accounts[0]
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
            "MockV3Aggregator",
            deployer
        )
    })
    describe("constructor", async () => {
        it("set the agregator address correctly", async () => {
            console.log("mockV3Aggregator.address", mockV3Aggregator.address)
            response = await fundMe.s_priceFeed()
            console.log("response", response)
            assert.equal(response, mockV3Aggregator.address)
        })
    })
    describe("Get owner", async () => {
        it("Get the owner", async () => {
            const owner = await fundMe.getOwner()
            assert.equal(owner, deployer)
        })
    })
    describe("fund", async () => {
        it("Fail if the amount is less than 50", async () => {
            await expect(fundMe.fund({ value: 10 })).to.be.revertedWith(
                "You need to spend more ETH!"
            )
        })
        it("Success if the amount is more than 50", async () => {
            await fundMe.fund({ value: sendValue })
            const balance = await fundMe.getAddressToAmountFunded(deployer)
            console.log("balance", balance.toString())
            assert.equal(balance.toString(), sendValue.toString())
        })
        it("Add funds to the addressToAmountFunded mapping", async () => {
            await fundMe.fund({ value: sendValue })
            const funder = await fundMe.getFunder(0)
            console.log("funder", funder)
            assert.equal(funder, deployer)
        })
    })
    describe("Get pricefeed version", async () => {
        it("Get the pricefeed version", async () => {
            const priceFeed = await fundMe.s_priceFeed()
            const version = await fundMe.getVersion()
            assert.equal(version.toString(), "0")
        })
    })
    describe("withdraw", async () => {
        beforeEach(async () => {
            await fundMe.fund({ value: sendValue })
        })

        it("Withraw eth from a single founder", async () => {
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            console.log(
                `startingFundmeBalance  , ${startingFundmeBalance.toString()} \nstartingDeployerBalance, ${startingDeployerBalance.toString()}`
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundmeBalance.toString(), 0)
            assert.equal(
                startingFundmeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Cheaper withdraw eth from a single founder", async () => {
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )
            console.log(
                `startingFundmeBalance  , ${startingFundmeBalance.toString()} \nstartingDeployerBalance, ${startingDeployerBalance.toString()}`
            )

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundmeBalance.toString(), 0)
            assert.equal(
                startingFundmeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )
        })

        it("Allow owner to withdraw eth from multiple funder", async () => {
            const accounts = await ethers.getSigners()
            for (i = 1; i < 10; i++) {
                await fundMe.connect(accounts[i]).fund({ value: sendValue })
            }
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundmeBalance.toString(), 0)
            assert.equal(
                startingFundmeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // Make sure the funders are reset
            await expect(fundMe.getFunder(0)).to.be.reverted

            // Make sure funder map is reset to 0
            for (i = 1; i < 10; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("Cheaper withdraw eth from multiple funder", async () => {
            const accounts = await ethers.getSigners()
            for (i = 1; i < 10; i++) {
                await fundMe.connect(accounts[i]).fund({ value: sendValue })
            }
            const startingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const startingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()

            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundmeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )

            const endingDeployerBalance = await fundMe.provider.getBalance(
                deployer
            )

            assert.equal(endingFundmeBalance.toString(), 0)
            assert.equal(
                startingFundmeBalance.add(startingDeployerBalance).toString(),
                endingDeployerBalance.add(gasCost).toString()
            )

            // Make sure the funders are reset
            await expect(fundMe.getFunder(0)).to.be.reverted

            // Make sure funder map is reset to 0
            for (i = 1; i < 10; i++) {
                assert.equal(
                    await fundMe.getAddressToAmountFunded(accounts[i].address),
                    0
                )
            }
        })

        it("Allow only owner to withdraw eth", async () => {
            const accounts = await ethers.getSigners()
            const attackerContract = await fundMe.connect(accounts[1])
            //const testtrx = await attackerContract.withdraw()

            await expect(
                attackerContract.withdraw()
            ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")

            // const accounts = await ethers.getSigners()
            // const fundMeConnectedContract = await fundMe.connect(accounts[1])
            // await expect(fundMeConnectedContract.withdraw()).to.be.reverted
        })
    })
})
