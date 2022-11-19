const { ethers } = require("hardhat");
const Tournament = require("../src/artifacts/contracts/Tournament.sol/Tournament.json");

async function main() {
  const ToTheMoon = await ethers.getContractFactory("ToTheMooon");
  const toTheMoon = await ToTheMoon.deploy();
  await toTheMoon.deployed();

  console.log("toTheMoon.address: ", toTheMoon.address);

  await toTheMoon.createTournament("Tournament #1", [false, 200, 10, "", 1000]);

  const tId = await toTheMoon.currentTournamentId();

  const tAtId = await toTheMoon.tournaments(tId);

  const tournament = new ethers.Contract(
    tAtId.contractAddress,
    Tournament.abi,
    ethers.provider
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
