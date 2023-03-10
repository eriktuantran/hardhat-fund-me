const { network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    if (developmentChains.includes(network.name)) {
        log(
            "Local development chain detected, deploying mock pricefeed contracts"
        )
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
        })
        log("Mock pricefeed deployed")
        log("-----------------------")
    }
}

module.exports.tags = ["all", "mocks"]
