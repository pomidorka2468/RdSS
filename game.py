import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from static.classes.player import Player
from static.classes.enemy import Enemy

with Path("static/sections.json").open(encoding="utf-8") as file:
    SECTIONS = json.load(file)["sections"]

with Path("static/items.json").open(encoding="utf-8") as file:
    ITEMS = json.load(file)["items"]
ITEMS_BY_NAME = {item["name"]: item for item in ITEMS.values()}

player = Player()
enemy = Enemy()

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
def root():
    index_path = Path("static/index.html")
    return index_path.read_text(encoding="utf-8")

@app.get("/get_next_sections")
def get_next_sections(section_number: str):
    section = SECTIONS[section_number]
    next_section = section["next_section"]

    if "text" in section:
        section_text = section["text"]
    else :
        section_text = ""

    if "items" in section:
        section_items = []
        for item_id in section["items"]:
            item = ITEMS.get(item_id) or ITEMS_BY_NAME.get(item_id) or {"name": item_id}
            section_items.append({"id": item_id, "name": item.get("name", item_id)})
    else :
        section_items = []

    section_choices = []
    if (section["type"] == "linear" or section["type"] == "choice"):
        for choice in next_section:
            section_choices.append({"number": choice["number"], "text": choice["text"]})
    elif (section["type"] == "requirement"):
        if (player.check_item(next_section["requirement"])):
            section_choices.append({"number": next_section["success"], "text": next_section["text"]})
        else:
            section_choices.append({"number": next_section["failure"], "text": next_section["text"]})

    data = {"section_text":section_text, "items":section_items, "choices":section_choices}
    return data

@app.get("/pick_item")
def pick_item(name: str):
    item = ITEMS.get(name) or ITEMS_BY_NAME[name]
    success = player.pick_item(
        name,
        item["name"],
        item["type"],
        item.get("note", "-"),
        item.get("bonus", 0),
        item.get("attack", 0)
    )
    return {"success": success}

@app.get("/get_stats")
def get_stats():
    return player.get_stats()

@app.get("/set_weapon_active")
def set_weapon_active(index: int):
    return player.set_weapon_active(index)

@app.get("/restart")
def restart():
    player.restart()

@app.get("/start_battle")
def start_battle(name: str, health: int, attack: int, defense: int, image_path: str):
    global enemy
    enemy = Enemy(name, health, attack, defense, image_path)

@app.get("/attack")
def attack():
    damage = player.attack()
    res = enemy.take_damage(damage)
    match res:
        case "missed":
            return "You have missed, enemy doesn't take any damage"
        case "wounded":
            return f"You have successfully hit. Enemy health: {enemy.health}"
        case "dead":
           
            return f"You have defeated the Enemy. Yay"
       
@app.get("/defend")
def take_damage():
    res = player.take_damage(enemy.attack)
    match res:
        case "missed":
            return "Enemy has missed"
        case "wounded":
            return f"Enemy hit you. Your status is {player.health_map[player.health]}"
        case "dead":
            return "You are dead. Git Gud"
       
@app.get("/pray")
def pray():
    res = player.take_damage(999999)
    if res == "dead":
        return f"God didn't answer your prayers. Enemy used an opening and stroke a critical hit your status is {player.health_map[player.health]}"
    else:
        return f"God didn't answer your prayers. Enemy used an opening and finished you. Git Gud"
