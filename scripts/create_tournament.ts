const { ethers } = require("hardhat");
const ToTheMoon = require("../src/artifacts/contracts/ToTheMooon.sol/ToTheMooon.json");

async function main() {
  const toTheMoon = new ethers.Contract(
    "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    ToTheMoon.abi,
    ethers.provider.getSigner()
  );

  await toTheMoon.createTournament("Tournament #1", [true, 200, 10, "", 1000]);

  const tId = await toTheMoon.currentTournamentId();

  console.log("tId: ", tId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
