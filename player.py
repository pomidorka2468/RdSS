class Player:
    def __init__(self) -> None:
        self.name = "player"
        self.max_health = 6
        self.health = 6
        self.strength = 5
        self.agility = 5
        self.attack = 5
        self.armour_class = 5
        self.items = []

        self.weapons = []
        self.special_weapon = None
        self.active_weapon = None
