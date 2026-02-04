import pygame
import random
from settings import *

class PowerUp(pygame.sprite.Sprite):
    def __init__(self, type):
        super().__init__()
        self.type = type
        self.image = pygame.Surface((30, 30))
        if type == "heal":
            self.image.fill(GREEN)
        elif type == "damage":
            self.image.fill(RED)
        self.rect = self.image.get_rect(center=(random.randint(50, SCREEN_WIDTH-50), random.randint(50, SCREEN_HEIGHT-50)))
