const battlePanel = document.getElementById("battle_panel");
const stroyPanel = document.getElementById("story_panel");
const statsPanel = document.getElementById("stats_panel");

const storyText = document.getElementById("story_text");
const statusText = document.getElementById("section_id");
const battleText = document.getElementById("battle_text");

const storyActions = document.getElementById("story_actions");
const battleActions = document.getElementById("battle_actions");

inBattle = false;

(function init() {
  loadSection(0);
})();

async function loadSection(section_number){
  res = await fetch(`/get_next_sections?section_number=${section_number}`);
  data = await res.json();

  storyText.textContent = data["section_text"];
  statusText.textContent = "Sektion " + section_number;
  storyActions.replaceChildren();

  if (Array.isArray(data["items"]) && data["items"].length > 0) {
    data["items"].forEach(item => {
      itemButton = createButton(
        `item_${item.name}`, 
        item.name, 
        `pickItem(${item.id})`
      );
      storyActions.appendChild(itemButton);
    });
  }

  if (Array.isArray(data["choices"]) && data["choices"].length > 0) {
    data["choices"].forEach(choice => {
      choiceButton = createButton(
        `item_${choice["number"]}`, 
        choice["text"], 
        `loadSection(${choice["number"]})`
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
  const armor = data.armor;

  const healthbarElement = document.getElementById(`vitality_meter`);
  const healthElement = document.getElementById(`vit_${data["health"]}`);
  const penalty1Element = document.getElementById(`penalty_chip_minus_1`);
  const penalty2Element = document.getElementById(`penalty_chip_minus_2`);
  
  Array.from(healthbarElement.children).forEach(child => {
    child.classList.remove("status_step--active");
  });
  if (healthElement) {
    healthElement.classList.add("status_step--active");
  }

  penalty1Element.classList.remove("active");
  penalty2Element.classList.remove("active");
  if (data["health"] === "verletzt") {
    penalty1Element.classList.add("active");
  } else if (data["health"] === "kritisch") {
    penalty2Element.classList.add("active");
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

async function attack(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");


  res = await fetch(`/attack`);
  battleText.value = res;


  defendButton = createButton(
    "defend",
    "Enemy tries to attack you",
    "defend()"
  );
  battleActions.replaceChildren(defendButton);
}


async function pray(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");


  res = await fetch(`/attack`);
  battleText.value = res;


  defendButton = createButton(
    "defend",
    "Enemy tries to attack you",
    "defend()"
  );
  battleActions.replaceChildren(defendButton);
}


async function defend(){
  const battleText = document.getElementById("battle_text");
  const battleActions = document.getElementById("battle_actions");


  res = await fetch(`/defend`);
  battleText.value = res;


  attackButton = createButton(
    "attack",
    "Attack the enemy",
    "attack()"
  );
  prayButton = createButton(
    "pray",
    "Pray to the God",
    "pray()"
  );
  battleActions.replaceChildren(attackButton, prayButton);
}


function createButton(name, text, func) {
  wrapper = document.createElement("div");
  wrapper.id = `btn_${name}`;
  wrapper.className = "button";
  wrapper.onclick = () => func;


  button = document.createElement("button");
  button.textContent = text;
  wrapper.appendChild(button);


  return wrapper;
}
