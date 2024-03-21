const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");

function Player(id, name, jersey, position) {
  this.id = id;
  this.name = name;
  this.jersey = jersey;
  this.position = position;
  this.visible = true;
  this.matches = function (searchFor) {
    return (
      this.name.toLowerCase().includes(searchFor) ||
      this.position.toLowerCase().includes(searchFor) ||
      this.team.toLowerCase().includes(searchFor)
    );
  };
}

async function fetchPlayers() {
  return await (await fetch("http://localhost:3000/getAll")).json();
}

let players = await fetchPlayers();
console.log(players);

searchPlayer.addEventListener("input", function () {
  const searchFor = searchPlayer.value.toLowerCase();
  for (let i = 0; i < players.length; i++) {
    // TODO add a matches function
    if (players[i].matches(searchFor)) {
      players[i].visible = true;
    } else {
      players[i].visible = false;
    }
  }
  updateTable();
});

const createTableTdOrTh = function (elementType, innerText) {
  let element = document.createElement(elementType);
  element.textContent = innerText;
  return element;
};

const playerName = document.getElementById("playerName");
const jersey = document.getElementById("jersey");
const position = document.getElementById("position");

let editingPlayer = null;

const onClickPlayer = function (event) {
  const htmlElementetSomViHarKlickatPa = event.target;
  console.log(htmlElementetSomViHarKlickatPa.dataset.stefansplayerid);
  const player = players.data.find(
    (p) => p.id == htmlElementetSomViHarKlickatPa.dataset.stefansplayerid
  );
  playerName.value = player.name;
  jersey.value = player.jersey;
  position.value = player.position;
  editingPlayer = player;

  MicroModal.show("modal-1");
};

closeDialog.addEventListener("click", async (ev) => {
  ev.preventDefault();
  let url = "";
  let method = "";
  console.log(url);
  var o = {
    name: playerName.value,
    jersey: jersey.value,
    position: position.value,
  };

  if (editingPlayer != null) {
    o.id = editingPlayer.id;
    url = "http://localhost:3000/updatePlayer/" + o.id;
    method = "PUT";
  } else {
    url = "http://localhost:3000/addNew";
    method = "POST";
  }

  let response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: method,
    body: JSON.stringify(o),
  });

  let json = await response.json();

  players = await fetchPlayers();
  updateTable();
  MicroModal.close("modal-1");
});

btnAdd.addEventListener("click", () => {
  playerName.value = "";
  jersey.value = 0;
  position.value = "";
  editingPlayer = null;

  MicroModal.show("modal-1");
});

const updateTable = function () {
  allPlayersTBody.innerHTML = "";

  players.data.forEach((player) => {
    if (player.visible == false) {
      return;
    }
    let tr = document.createElement("tr");

    tr.appendChild(createTableTdOrTh("th", player.name));
    tr.appendChild(createTableTdOrTh("td", player.jersey));
    tr.appendChild(createTableTdOrTh("td", player.position));

    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.textContent = "EDIT";
    btn.dataset.stefansplayerid = player.id;
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    allPlayersTBody.appendChild(tr);
  });
  for (let i = 0; i < players.length; i++) {
    // hrmmm you do foreach if you'd like, much nicer!
    if (players[i].visible == false) {
      continue;
    }
    let tr = document.createElement("tr");

    tr.appendChild(createTableTdOrTh("th", players[i].name));
    tr.appendChild(createTableTdOrTh("td", players[i].jersey));
    tr.appendChild(createTableTdOrTh("td", players[i].position));
    tr.appendChild(createTableTdOrTh("td", players[i].team));

    let td = document.createElement("td");
    let btn = document.createElement("button");
    btn.textContent = "EDIT";
    btn.dataset.stefansplayerid = players[i].id;
    td.appendChild(btn);
    tr.appendChild(td);

    btn.addEventListener("click", onClickPlayer);

    // btn.addEventListener("click",function(){
    //       alert(players[i].name)
    //       //                      detta funkar fast med sk closures = magi vg
    // })

    allPlayersTBody.appendChild(tr);
  }

  // innerHTML och backticks `
  // Problem - aldrig bra att bygga strängar som innehåller/kan innehålla html
  //    injection
  // for(let i = 0; i < players.length;i++) { // hrmmm you do foreach if you'd like, much nicer!
  //                                         // I will show you in two weeks
  //                                         //  or for p of players
  //     let trText = `<tr><th scope="row">${players[i].name}</th><td>${players[i].jersey}</td><td>${players[i].position}</td><td>${players[i].team}</td></tr>`
  //     allPlayersTBody.innerHTML += trText
  // }
  // createElement
};

updateTable();

MicroModal.init({
  onShow: (modal) => console.info(`${modal.id} is shown`), // [1]
  onClose: (modal) => console.info(`${modal.id} is hidden`), // [2]

  openTrigger: "data-custom-open", // [3]
  closeTrigger: "data-custom-close", // [4]
  openClass: "is-open", // [5]
  disableScroll: true, // [6]
  disableFocus: false, // [7]
  awaitOpenAnimation: false, // [8]
  awaitCloseAnimation: false, // [9]
  debugMode: true, // [10]
});
