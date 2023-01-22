const { ethers } = require("hardhat");
const Tournament = require("../src/artifacts/contracts/Tournament.sol/Tournament.json");

async function main() {
  const ToTheMoon = await ethers.getContractFactory("ToTheMooon");
  const toTheMoon = await ToTheMoon.deploy();
  await toTheMoon.deployed();

  console.log("contractAddress: ", toTheMoon.address);

  const acccounts = await ethers.getSigners();

  await toTheMoon.createTournament("Tournament #1", [false, 200, 10, "", 0]);

  const tId = await toTheMoon.currentTournamentId();

  const tAtId = await toTheMoon.tournaments(tId);

  console.log("Tournament created: ", tAtId.contractAddress);

  for (let i = 0; i < 1; i++) {
    const tournament = new ethers.Contract(
      tAtId.contractAddress,
      Tournament.abi,
      ethers.provider.getSigner(i)
    );

    await tournament.joinTournament({
      value: await tournament.joiningFees(),
      from: acccounts[i].address,
    });

    const info = await tournament.getRewardInfo();
    const playersJoined = info[2].toNumber();

    console.log("playersJoined: ", playersJoined);
  }

  // signedTournaments.map(async (signedTournament, i) => {
  //   console.log("signedTournaments: ", signedTournament.name());
  //   await signedTournament.joinTournament({
  //     value: await signedTournament.joiningFees(),
  //     from: acccounts[i].address,
  //   });
  //   return { signedTournament };
  // });

  // const tx = await tournament.joinTournament({
  // value: await tournament.joiningFees(),
  // from: acccounts[1].address,
  // });

  // await tournament.joinTournament({
  //   value: await tournament.joiningFees(),
  //   from: ac1,
  // });
  //

  console.log("joined tournament");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
