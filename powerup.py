import pygame
import random
from settings import *

class PowerUp(pygame.sprite.Sprite):
    def __init__(self, type):
        super().__init__()
        self.type = type
        self.image = pygame.Surface((40, 40), pygame.SRCALPHA)
        font = pygame.font.SysFont(None, 20)
        if type == "heal":
            self.image.fill(GREEN)
            text = font.render("50+", True, WHITE)
            self.image.blit(text, text.get_rect(center=(20, 20)))
        elif type == "damage":
            self.image.fill(RED)
            text = font.render("+10", True, WHITE)
            self.image.blit(text, text.get_rect(center=(20, 20)))
        self.rect = self.image.get_rect(center=(random.randint(50, SCREEN_WIDTH-50), random.randint(50, SCREEN_HEIGHT-50)))
