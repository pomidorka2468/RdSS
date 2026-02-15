import json
import random
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

    section_func = section.get("func")
    section_type = section.get("type")
    enemy_payload = None
    next_section_value = None

    if "items" in section:
        section_items = []
        for item_id in section["items"]:
            item = ITEMS.get(item_id) or ITEMS_BY_NAME.get(item_id) or {"name": item_id}
            section_items.append({"id": item_id, "name": item.get("name", item_id)})
    else :
        section_items = []

    section_choices = []
    match section["type"]:
        case "linear":
            for choice in next_section:
                section_choices.append({"number": choice["number"], "text": choice["text"]})
        case "choice":
            for choice in next_section:
                section_choices.append({"number": choice["number"], "text": choice["text"]})
        case "requirement":
            if player.check_item(next_section["requirement"]):
                section_choices.append({"number": next_section["success"], "text": next_section["text"]})
            else:
                section_choices.append({"number": next_section["failure"], "text": next_section["text"]})
        case "check":
            result = (
                getattr(player, next_section["ability"])
                + random.randrange(1, 6, 1)
                + random.randrange(1, 6, 1)
                - player.get_penalty()
            )
            if result >= next_section["value"]:
                section_choices.append({"number": next_section["success"], "text": next_section["text"]})
            else:
                section_choices.append({"number": next_section["failure"], "text": next_section["text"]})
        case "battle":
            global enemy
            enemy_data = section["enemy"]
            
            enemy = Enemy(
                enemy_data["name"],
                enemy_data["health"],
                enemy_data["attack"],
                enemy_data["defense"],
            )
            enemy_payload = enemy_data
            if isinstance(next_section, list) and len(next_section) > 0:
                next_section_value = next_section[0].get("number")

    data = {
        "section_text":section_text,
        "items":section_items,
        "choices":section_choices,
        "func": section_func,
        "type": section_type,
        "enemy": enemy_payload,
        "next_section": next_section_value
    }
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
    
@app.get("/change_player_stat")
def change_player_stat(name: str, value: int):
    player.change_stat(name, value)

@app.get("/attack")
def attack():
    damage = player.get_attack()
    res = enemy.take_damage(damage)
    match res:
        case "missed":
            return {
                "status": "missed",
                "text": "Du hast verfehlt, der Gegner erleidet keinen Schaden."
            }
        case "wounded":
            return {
                "status": "wounded",
                "text": f"Treffer! Gegnerische Lebenspunkte: {enemy.health}"
            }
        case "dead":
            return {
                "status": "dead",
                "text": "Du hast den Gegner besiegt."
            }
       
@app.get("/defend")
def take_damage():
    res = player.take_damage(enemy.attack)
    match res:
        case "missed":
            return "Der Gegner hat verfehlt."
        case "wounded":
            return f"Der Gegner hat dich getroffen. Dein Zustand ist {player.health_map[player.health]}"
        case "dead":
            return "Du bist tot."
       
@app.get("/pray")
def pray():
    res = player.take_damage(999999)
    if res == "dead":
        return f"Gott hat dein Gebet nicht erhört. Der Gegner nutzte die Öffnung und traf kritisch. Dein Zustand ist {player.health_map[player.health]}"
    else:
        return "Gott hat dein Gebet nicht erhört. Der Gegner nutzte die Öffnung und hat dich erledigt."
