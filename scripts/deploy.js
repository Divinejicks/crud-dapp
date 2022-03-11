const hre = require("hardhat");

async function main() {
  const Crud = await hre.ethers.getContractFactory("Crud");
  const crud = await Crud.deploy();

  await crud.deployed();

  console.log("Crud deployed to:", crud.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => { 
  console.error(error);
  process.exitCode = 1;
});
