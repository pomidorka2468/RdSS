import random

class Player:
    def __init__(self):
        self.health = 5
        self.strength = 5
        self.agility = 5
        self.attack = 5
        self.defense = 5

        self.health_map = {
            0: "tot",
            1: "kritisch",
            2: "verletzt",
            3: "angeschlagen",
            4: "normal",
            5: "fit"
        }
        
        self.inventory = []
        self.weapons = []
        #ToDo Armor

    def pick_item(self, item_id, name, type, description, bonus, strength):
        if type == "weapon":
            if any(weapon["id"] == item_id for weapon in self.weapons):
                return False
            if len(self.weapons) >= 3:
                return False
            self.weapons.append(
                {
                    "id": item_id,
                    "name": name,
                    "active": False,
                    "bonus": bonus,
                    "note": description,
                    "attack": strength,
                }
            )
            return True
        elif type == "utensil":
            if any(utensil["id"] == item_id for utensil in self.inventory):
                return False
            if len(self.inventory) >= 6:
                return False
            self.inventory.append({"id": item_id, "name": name})
            return True
        else: 
            return False

    def remove_item(self, item):
        for utensil in list(self.inventory):
            if utensil["id"] == item or utensil["name"] == item:
                self.inventory.remove(utensil)
                return True

        for weapon in list(self.weapons):
            if weapon["id"] == item or weapon["name"] == item:
                self.weapons.remove(weapon)
                return True

        return False

    def check_item(self, item):
        if any(utensil["id"] == item for utensil in self.inventory):
            return True
        if any(weapon["id"] == item for weapon in self.weapons):
            return True
        return False

    def get_stats(self):
        items = list(self.inventory)
        while len(items) < 6:
            items.append({"name": ""})

        weapons = list(self.weapons)
        while len(weapons) < 3:
            weapons.append(
                {
                    "id": "",
                    "name": "",
                    "active": False,
                    "bonus": "0",
                    "note": "—",
                    "attack": "0",
                }
            )

        return {
            "strength": self.strength,
            "dexterity": self.agility,
            "attack": self.attack,
            "defense": self.defense,
            "health": self.health,
            "items": items,
            "weapons": weapons
        }

    def change_stat(self, stat, delta):
        value = int(getattr(self, stat)) + int(delta)
        setattr(self, stat, value)

    def set_weapon_active(self, index):
        if self.weapons[index]["active"] == True:
            self.weapons[index]["active"] = False
            return False
        elif self.weapons[index]["active"] == False:
            self.weapons[index]["active"] = True
            return True
    
    def restart(self):
        self.health = 5
        self.strength = 5
        self.agility = 5
        self.attack = 5
        self.defense = 5

        self.health_map = {
            0: "tot",
            1: "kritisch",
            2: "verletzt",
            3: "angeschlagen",
            4: "normal",
            5: "fit"
        }
        
        self.inventory = []
        self.weapons = []

    def take_damage(self, damage):
        cur_defense = self.defense + random.randrange(1, 6, 1) + random.randrange(1, 6, 1)
        if cur_defense >= damage:
            return "missed"
        else:
            self.health -= 1
            if self.health != 0:
                return "wounded"
            else:
                return "dead"


    def attack(self):
        weapon_bonus = 3 #Use real bonus later
        return self.attack + weapon_bonus + random.randrange(1, 6, 1) + random.randrange(1, 6, 1)
