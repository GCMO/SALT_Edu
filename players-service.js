function PlayersService(playersClient, bioClient) {
  this.playersClient = playersClient;
  this.bioClient = bioClient;
}

function parseEid(url) {
  return url.replace(/\/$/, '')
    .split('/')
    .slice(-1)[0];
}

function parsePerson(data) {
  return {
    name: data.name,
    eid: parseEid(data.url),
  };
}

function parseDetails(data) {
  return {
    name: data.name,
    gender: data.gender,
  };
}

function pageNumber(p) {
  if (p) {
    return p.split('=')[1];
  }
  return -1;
}

function getTeam(playersClient, url, callback) {
  playersClient.getTeamFor(url, callback);
}

PlayersService.prototype.all = function _(callback) {
  this.playersClient.fetchAll((all) => {
    const results = all.results.map((r) => parsePerson(r));

    callback({
      count: all.count,
      next: all.next ? all.next.split('=')[1] : null,
      prev: pageNumber(all.prev),
      results,
    });
  });
};

// This Class collects the data id, team, bio of each player
// and returns it in the playerService callback.
PlayersService.prototype.get = function _(id, callback) {
  this.playersClient.getPlayer(id, (data) => {
    const person = parseDetails(data);

    this.bioClient.getBioFor(data.name, (bio) => {
      person.bio = bio;
    });

    getTeam(this.playersClient, data.homeworld, (team) => {
      person.team = team.name;

      callback(person);
    });
  });
};

// the following export is creating a new instance of the class
// PlayerService. The whole file is a Class. BioClient is a new
// param we are forwarding/instance.
// eslint-disable-next-line
module.exports.create = (remotePlayersClient, BioClient) => new PlayersService(remotePlayersClient, BioClient);
