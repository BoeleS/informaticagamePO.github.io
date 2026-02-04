import pygame
from settings import *
from random import randint

class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((30, 30))
        self.image.fill(RED)
        self.hp = ENEMY_HP
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = 2

    def update(self, player):
        # Beweeg naar speler
        if self.rect.x < player.rect.x:
            self.rect.x += self.speed
        if self.rect.x > player.rect.x:
            self.rect.x -= self.speed
        if self.rect.y < player.rect.y:
            self.rect.y += self.speed
        if self.rect.y > player.rect.y:
            self.rect.y -= self.speed

class Spider(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.image = pygame.Surface((40, 40))
        self.image.fill((150, 0, 150))
        self.hp = SPIDER_HP
        self.web_timer = 0

class Boss(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.image = pygame.Surface((150, 150))
        self.image.fill((0, 100, 0))
        self.hp = BOSS_HP
        self.fire_timer = 0
