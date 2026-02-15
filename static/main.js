const battlePanel = document.getElementById("battle_panel");
const stroyPanel = document.getElementById("story_panel");
const statsPanel = document.getElementById("stats_panel");

const storyText = document.getElementById("story_text");
const statusText = document.getElementById("section_id");
const battleText = document.getElementById("battle_text");

const storyActions = document.getElementById("story_actions");
const battleActions = document.getElementById("battle_actions");

inBattle = false;
let battleNextSection = null;

(function init() {
  loadSection(0);
})();

async function loadSection(section_number){
  res = await fetch(`/get_next_sections?section_number=${section_number}`);
  data = await res.json();

  storyText.textContent = data["section_text"];
  statusText.textContent = "Sektion " + section_number;
  storyActions.replaceChildren();

  if (data["func"]) {
    await fetch(`/${data["func"]}`);
  }

  if (data["type"] === "battle") {
    battleNextSection = data["next_section"] ?? null;
    startBattle(data["enemy"], data["section_text"]);
    return;
  }

  if (Array.isArray(data["items"]) && data["items"].length > 0) {
    data["items"].forEach(item => {
      itemButton = createButton(
        `item_${item.name}`, 
        item.name, 
        () => pickItem(item.name)
      );
      storyActions.appendChild(itemButton);
    });
  }

  if (Array.isArray(data["choices"]) && data["choices"].length > 0) {
    data["choices"].forEach(choice => {
      choiceButton = createButton(
        `item_${choice["number"]}`, 
        choice["text"], 
        () => loadSection(choice["number"])
      );
      storyActions.appendChild(choiceButton);
    });
  }
}

function showStats(){
  if (statsPanel.classList.contains("hidden")) {
    stroyPanel.classList.add("hidden");
    statsPanel.classList.remove("hidden");
    battlePanel.classList.add("hidden");
  } else if (inBattle){
    stroyPanel.classList.add("hidden");
    statsPanel.classList.add("hidden");
    battlePanel.classList.remove("hidden");
  } else if (!inBattle){
    stroyPanel.classList.remove("hidden");
    statsPanel.classList.add("hidden");
    battlePanel.classList.add("hidden");
  }
  updateStats();
}

async function pickItem(name){
  const res = await fetch(
    `/pick_item?name=${encodeURIComponent(name)}`
  );
  const data = await res.json();
  if (data.success) {
    itemButton = document.getElementById("btn_item_"+name);
    itemButton.className = "hidden";
    updateStats();
  } else {
    alert("can not take this item");
  }
}

async function updateStats(){
  const res = await fetch(`/get_stats`);

  const data = await res.json();
  const items = data.items;
  const weapons = data.weapons;

  health_map = {
    0: "tot",
    1: "kritisch",
    2: "verletzt",
    3: "angeschlagen",
    4: "normal",
    5: "fit"
  };

  health = data["health"];
  health_text = health_map[health];

  const healthbarElement = document.getElementById(`vitality_meter`);
  const healthElement = document.getElementById(`vit_${health_text}`);
  const penalty1Element = document.getElementById(`penalty_chip_minus_1`);
  const penalty2Element = document.getElementById(`penalty_chip_minus_2`);
  
  Array.from(healthbarElement.children).forEach(child => {
    child.classList.remove("status_step--active");
  });
  if (healthElement) {
    healthElement.classList.add("status_step--active");
  }

  penalty1Element.classList.remove("active_penalty");
  penalty2Element.classList.remove("active_penalty");
  if (health_text === "verletzt") {
    penalty1Element.classList.add("active_penalty");
  } else if (health_text === "kritisch") {
    penalty2Element.classList.add("active_penalty");
  }

  
  document.getElementById("current_section").textContent = "Sektion " + data["section"];

  document.getElementById("strength_value").textContent = data["strength"];
  document.getElementById("dex_value").textContent = data["dexterity"];

  for (let i = 1; i <= 15; i++) {
    const strengthTick = document.getElementById(`str_${i}`);
    const dexTick = document.getElementById(`dex_${i}`);
    if (strengthTick) {
      strengthTick.classList.toggle("tick--on", i <= data["strength"]);
    }
    if (dexTick) {
      dexTick.classList.toggle("tick--on", i <= data["dexterity"]);
    }
  }

  for (let i = 1; i <= 6; i++) {
    const itemElement = document.getElementById(`item_${i}`);
    const item = items[i - 1];
    let label = "—";
    if (item["name"]) {
      label = item["name"];
    }
    itemElement.textContent = label;
  }

  for (let i = 1; i <= 3; i++) {
    const weapon = weapons[i - 1];
    const weaponNameElement = document.getElementById(`weapon${i}_name`);
    const weaponActiveElement = document.getElementById(`weapon${i}_active`);
    const weaponBonusElement = document.getElementById(`weapon${i}_hitbonus`);
    const weaponNoteElement = document.getElementById(`weapon${i}_note`);
    const weaponAttackElement = document.getElementById(`weapon${i}_attack`);

    weaponNameElement.textContent = weapon.name ?? "—";
    weaponActiveElement.checked = weapon.active ?? false;
    weaponBonusElement.textContent = weapon.bonus ?? "+0";
    weaponNoteElement.textContent = weapon.note ?? "—";
    weaponAttackElement.textContent = weapon.attack ?? "0";
  }
}

async function setWeaponActive(index){
  updateStats();
  const checkboxElement = document.getElementById(`weapon${index+1}_active`);
  const res = await fetch(`/set_weapon_active?index=${index}`);
  const data = await res.json();
  checkboxElement.checked = !!data.active;
  updateStats();
}

async function restart() {
  await fetch(`/restart`);
  loadSection(0);
  updateStats();
}

function startBattle(enemy, text) {
  inBattle = true;
  stroyPanel.classList.add("hidden");
  battlePanel.classList.remove("hidden");

  if (text) {
    battleText.textContent = text;
  }

  const attackButton = createButton(
    "attack",
    "Gegner angreifen",
    () => attack()
  );
  const prayButton = createButton(
    "pray",
    "Zu Gott beten",
    () => pray()
  );
  battleActions.replaceChildren(attackButton, prayButton);
}

async function attack(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");

  const res = await fetch(`/attack`);
  const result = await res.json();
  battleText.textContent = result.text;

  if (result.status === "dead") {
    const continueButton = createButton(
      "continue",
      "Weiter lesen",
      () => battleEnd()
    );
    battleActions.replaceChildren(continueButton);
    return;
  }

  defendButton = createButton(
    "defend",
    "Der Gegner greift an",
    () => defend()
  );
  battleActions.replaceChildren(defendButton);
}

async function pray(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");

  const res = await fetch(`/pray`);
  const resultText = await res.text();
  battleText.textContent = resultText;

  defendButton = createButton(
    "defend",
    "Der Gegner greift an",
    () => defend()
  );
  battleActions.replaceChildren(defendButton);
}

async function defend(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");

  const res = await fetch(`/defend`);
  const resultText = await res.text();
  battleText.textContent = resultText;

  attackButton = createButton(
    "attack",
    "Gegner angreifen",
    () => attack()
  );
  prayButton = createButton(
    "pray",
    "Zu Gott beten",
    () => pray()
  );
  battleActions.replaceChildren(attackButton, prayButton);
}

function fight() {
  attack();
}

function battleEnd() {
  inBattle = false;
  battlePanel.classList.add("hidden");
  stroyPanel.classList.remove("hidden");
  if (battleNextSection !== null && battleNextSection !== undefined) {
    loadSection(battleNextSection);
  }
}

function createButton(name, text, onClick) {
  wrapper = document.createElement("div");
  wrapper.id = `btn_${name}`;
  wrapper.className = "choice_button";
  wrapper.onclick = onClick;

  button = document.createElement("button");
  button.textContent = text;
  wrapper.appendChild(button);

  return wrapper;
}
