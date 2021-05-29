// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat")
const {singletons,constants} = require("@openzeppelin/test-helpers");

async function main() {
  const [creator] = await hre.ethers.getSigners();

  // initialize Azimuth and Ecliptic locally
  const PollsFactory = await hre.ethers.getContractFactory("PollsWrapper", creator);
  const ClaimsFactory = await hre.ethers.getContractFactory("ClaimsWrapper", creator);
  const AzimuthFactory = await hre.ethers.getContractFactory("AzimuthWrapper", creator);
  const EclipticFactory = await hre.ethers.getContractFactory("EclipticWrapper", creator);

  const Azimuth = await AzimuthFactory.deploy();
  const Polls = await PollsFactory.deploy(432000, 432000);
  const Claims = await ClaimsFactory.deploy(Azimuth.address);

  const Ecliptic = await EclipticFactory.deploy(constants.ZERO_ADDRESS, Azimuth.address, Polls.address, Claims.address);

  await Azimuth.transferOwnership(Ecliptic.address);
  await Polls.transferOwnership(Ecliptic.address);

  // now deploy our contracts
  const TreasuryFactory = await hre.ethers.getContractFactory("Treasury", creator);
  const StarTokenFactory = await hre.ethers.getContractFactory("StarToken", creator);
  await singletons.ERC1820Registry(creator.address);

  const Treasury = await TreasuryFactory.deploy(Azimuth.address);
  const tokenAddress = await Treasury.startoken();

  const Token = StarTokenFactory.attach(tokenAddress);

  console.log(creator.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
