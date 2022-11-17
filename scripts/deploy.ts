const { ethers } = require("hardhat");

async function main() {
  const ToTheMoon = await ethers.getContractFactory("ToTheMooon");
  const toTheMoon = await ToTheMoon.deploy();
  await toTheMoon.deployed();

  console.log("toTheMoon.address: ", toTheMoon.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
