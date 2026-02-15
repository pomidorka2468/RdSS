class Enemy:
    def __init__(self, name, health, attack, defense):
        self.name = name
        self.health = health
        self.attack = attack
        self.defense = defense


    def take_damage(self, damage):
        if damage > self.defense:
            self.health -= 1
            if self.health >= 1:
                return "wounded"
            if self.health == 0:
                return "dead"
        else:
            return "missed"
