const allPlayersTBody = document.querySelector("#allPlayers tbody");
const searchPlayer = document.getElementById("searchPlayer");
const btnAdd = document.getElementById("btnAdd");
const closeDialog = document.getElementById("closeDialog");
const nameCat = document.getElementById("nameCat");
const jerseyCat = document.getElementById("jerseyCat");
const positionCat = document.getElementById("positionCat");
const pager = document.getElementById("pager");

let currentSortCol = "id";
let currentSortOrder = "asc";
let currentSearchText = "";
let currentPageNo = 1;
const pageSize = 6;

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
  let offset = (currentPageNo - 1) * pageSize;
  let url = `http://localhost:3000/getAll?sortBy=${currentSortCol}&sortOrder=${currentSortOrder}&search=${currentSearchText}&limit=6&page=${currentPageNo}&offset=${offset}`;
  return await (await fetch(url)).json();
}

let players = await fetchPlayers();
console.log(players);

function debounce(cb, delay = 250) {
  let timeout;

  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      cb(...args);
    }, delay);
  };
}

const debouncedSearch = debounce((searchText) => {
  currentSearchText = searchText.toLowerCase();
  currentPageNo = 1;
  updateTable();
});

searchPlayer.addEventListener("input", function (event) {
  debouncedSearch(event.target.value);
});

nameCat.addEventListener("click", () => {
  sortHandler("name");
});
jerseyCat.addEventListener("click", () => {
  sortHandler("jersey");
});
positionCat.addEventListener("click", () => {
  sortHandler("position");
});

function sortHandler(category) {
  if (currentSortCol === category) {
    currentSortOrder = currentSortOrder === "asc" ? "desc" : "asc";
  } else {
    currentSortCol = category;
    currentSortOrder = "asc";
  }
  updateTable();
}

function createPager(totalPages, pageNo) {
  pager.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const li = document.createElement("li");
    li.classList.add("page-item");
    if (i == pageNo) {
      li.classList.add("active");
    }
    const a = document.createElement("a");
    a.href = "#";
    a.innerText = i;
    a.classList.add("page-link");
    li.appendChild(a);
    a.addEventListener("click", async (e) => {
      e.preventDefault();
      currentPageNo = i;
      await updateTable();
    });
    pager.appendChild(li);
  }
}

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

const updateTable = async function () {
  let players = await fetchPlayers();

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
  createPager(players.totalPages, currentPageNo);
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
