import pygame
from settings import *
from math import sqrt

class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y, direction, damage):
        super().__init__()
        self.image = pygame.Surface((10, 5))
        self.image.fill(YELLOW)
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = BULLET_SPEED
        self.direction = direction
        self.damage = damage

    def update(self):
        self.rect.x += self.speed * self.direction
        if self.rect.right < 0 or self.rect.left > SCREEN_WIDTH:
            self.kill()

class Web(Bullet):
    def __init__(self, x, y, player):
        super().__init__(x, y, 0, 5)
        self.image = pygame.Surface((10, 10))
        self.image.fill((0, 200, 200))
        dx = player.rect.centerx - x
        dy = player.rect.centery - y
        distance = max(sqrt(dx**2 + dy**2), 1)
        self.velocity = (dx/distance*5, dy/distance*5)

    def update(self):
        self.rect.x += self.velocity[0]
        self.rect.y += self.velocity[1]
        if self.rect.right < 0 or self.rect.left > SCREEN_WIDTH or self.rect.top < 0 or self.rect.bottom > SCREEN_HEIGHT:
            self.kill()
