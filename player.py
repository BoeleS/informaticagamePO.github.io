import pygame
from settings import *

class Player(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((PLAYER_SIZE, PLAYER_SIZE), pygame.SRCALPHA)
        center = PLAYER_SIZE // 2
        pygame.draw.circle(self.image, BLUE, (center, center), center)
        pygame.draw.circle(self.image, WHITE, (center - 6, center - 4), 4)
        pygame.draw.circle(self.image, WHITE, (center + 6, center - 4), 4)
        pygame.draw.arc(self.image, WHITE, (center - 12, center - 2, 24, 16), 3.4, 6.0, 3)
        pygame.draw.line(self.image, WHITE, (6, center), (0, center + 10), 3)
        pygame.draw.line(self.image, WHITE, (PLAYER_SIZE - 6, center), (PLAYER_SIZE, center + 10), 3)
        pygame.draw.line(self.image, WHITE, (center - 6, PLAYER_SIZE - 4), (center - 10, PLAYER_SIZE), 3)
        pygame.draw.line(self.image, WHITE, (center + 6, PLAYER_SIZE - 4), (center + 10, PLAYER_SIZE), 3)
        self.rect = self.image.get_rect(center=(x, y))
        self.hp = PLAYER_HP
        self.speed = PLAYER_SPEED
        self.bullets = BULLET_CAPACITY
        self.damage = BULLET_DAMAGE
        self.powerup_timer = 0
        self.invincible_timer = 0

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

        if self.invincible_timer > 0:
            self.invincible_timer -= 1
