class Player:
    def __init__(self):
        self.inventory = []

    def pick_item(self, item):
        if item not in self.inventory and self.inventory.count < 6:
            self.inventory.append(item)

    def remove_item(self, item):
        if item in self.inventory:
            self.inventory.remove(item)

    def check_item(self, item):
        return item in self.inventory
