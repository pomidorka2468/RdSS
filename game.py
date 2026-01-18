import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from static.classes.player import Player

with Path("static/sections.json").open(encoding="utf-8") as f:
    SECTIONS = json.load(f)["sections"]

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

    if "items" in section:
        section_items = section["items"]
    else :
        section_items = {}

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
