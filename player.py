import pygame
from settings import *

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((PLAYER_SIZE, PLAYER_SIZE), pygame.SRCALPHA)
        pygame.draw.circle(self.image, BLUE, (PLAYER_SIZE//2, PLAYER_SIZE//2), PLAYER_SIZE//2)  # hoofd
        pygame.draw.line(self.image, WHITE, (10, 10), (30, 10), 3)  # glimlach
        pygame.draw.line(self.image, WHITE, (10, 30), (30, 30), 3)  # benen
        pygame.draw.line(self.image, WHITE, (0, 20), (40, 20), 3)   # armen
        self.rect = self.image.get_rect(center=(x, y))
        self.hp = PLAYER_HP
        self.speed = PLAYER_SPEED
        self.bullets = BULLET_CAPACITY
        self.damage = BULLET_DAMAGE
        self.powerup_timer = 0

    def update(self, keys_pressed):
        if keys_pressed[pygame.K_w]:
            self.rect.y -= self.speed
        if keys_pressed[pygame.K_s]:
            self.rect.y += self.speed
        if keys_pressed[pygame.K_a]:
            self.rect.x -= self.speed
        if keys_pressed[pygame.K_d]:
            self.rect.x += self.speed

        # Binnen scherm houden
        if self.rect.left < 0: self.rect.left = 0
        if self.rect.right > SCREEN_WIDTH: self.rect.right = SCREEN_WIDTH
        if self.rect.top < 0: self.rect.top = 0
        if self.rect.bottom > SCREEN_HEIGHT: self.rect.bottom = SCREEN_HEIGHT
