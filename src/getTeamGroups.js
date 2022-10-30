// Shuffle algorithm is the Fisher-Yates
const shuffle = (array) => {
  var currentIndex = array.length,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
};

const getTeamGroups = (allplayers, restrictions, isEnableRandom) => {
  // check for an even number of players
  if (allplayers.length % 2 === 1) {
    console.log("Ahtung! An odd number of players!");
    return [];
  }

  // shuffle the list for pseudo-randomness of the results, put it into Set
  let players = new Set();

  if (isEnableRandom) {
    players = new Set(shuffle([...allplayers]));
  } else {
    players = new Set([...allplayers]);
  }

  // we will put pairs with results here
  const result = [];

  // first process the list of constraints
  for (const key of Object.keys(restrictions)) {
    const currentPlayer = key;
    const currentPlayerRestrictions = restrictions[key];
    let isFoundPair = false;

    for (const player of players) {
      if (!players.has(currentPlayer)) {
        // skip if player with exceptions has already found a pair
        isFoundPair = true;
        break;
      }

      if (
        currentPlayer === player || // player can't play with itself
        currentPlayerRestrictions.includes(player) // player can't play with its exceptions
      ) {
        continue;
      }

      // drop the appropriate group into the results and cut them out from the original array
      result.push([currentPlayer, player]);
      players.delete(currentPlayer);
      players.delete(player);
      isFoundPair = true;
      break;
    }

    if (!isFoundPair) players.delete(currentPlayer); // if the exception did not find a match, we also remove it from the array
  }

  // now you need to scatter the remaining players without restrictions
  while (players.size >= 2) {
    let count = 0;
    let firstPlayer;

    for (const player of players) {
      // take the first player ...
      if (count === 0) {
        firstPlayer = player;
        count++;
        continue;
      }

      // ... and the next one from the list, we put it into the group, cut them out from the original array
      result.push([firstPlayer, player]);
      players.delete(firstPlayer);
      players.delete(player);
      break;
    }
  }

  if (isEnableRandom) {
    return shuffle(result);
  }

  return result;
};

exports.getTeamGroups = getTeamGroups;
