import pygame
from settings import *
from bullet import Web, Fireball


class Enemy(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((ENEMY_SIZE, ENEMY_SIZE), pygame.SRCALPHA)
        self._draw_enemy()
        self.hp = ENEMY_HP
        self.rect = self.image.get_rect(center=(x, y))
        self.speed = ENEMY_SPEED
        self.touch_damage = ENEMY_TOUCH_DAMAGE

    def _draw_enemy(self):
        center = ENEMY_SIZE // 2
        pygame.draw.circle(self.image, RED, (center, center), center)
        pygame.draw.line(self.image, BLACK, (10, 8), (18, 16), 3)
        pygame.draw.line(self.image, BLACK, (30, 8), (22, 16), 3)
        pygame.draw.arc(self.image, BLACK, (10, 16, 20, 14), 3.4, 6.1, 3)
        pygame.draw.line(self.image, BLACK, (4, center), (0, center + 10), 3)
        pygame.draw.line(self.image, BLACK, (ENEMY_SIZE - 4, center), (ENEMY_SIZE, center + 10), 3)
        pygame.draw.line(self.image, BLACK, (center - 6, ENEMY_SIZE - 4), (center - 10, ENEMY_SIZE), 3)
        pygame.draw.line(self.image, BLACK, (center + 6, ENEMY_SIZE - 4), (center + 10, ENEMY_SIZE), 3)

    def update(self, player, projectile_group):
        if self.rect.centerx < player.rect.centerx:
            self.rect.x += self.speed
        if self.rect.centerx > player.rect.centerx:
            self.rect.x -= self.speed
        if self.rect.centery < player.rect.centery:
            self.rect.y += self.speed
        if self.rect.centery > player.rect.centery:
            self.rect.y -= self.speed


class Spider(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.image = pygame.Surface((SPIDER_SIZE, SPIDER_SIZE), pygame.SRCALPHA)
        self._draw_spider()
        self.hp = SPIDER_HP
        self.speed = SPIDER_SPEED
        self.web_timer = 0
        self.touch_damage = SPIDER_TOUCH_DAMAGE

    def _draw_spider(self):
        center = SPIDER_SIZE // 2
        pygame.draw.circle(self.image, PURPLE, (center, center), center - 6)
        for offset in range(-3, 5, 2):
            pygame.draw.line(self.image, BLACK, (6, center + offset), (0, center + offset - 6), 2)
            pygame.draw.line(self.image, BLACK, (SPIDER_SIZE - 6, center + offset), (SPIDER_SIZE, center + offset - 6), 2)
        pygame.draw.circle(self.image, BLACK, (center - 6, center - 4), 3)
        pygame.draw.circle(self.image, BLACK, (center + 6, center - 4), 3)

    def update(self, player, projectile_group):
        super().update(player, projectile_group)
        self.web_timer += 1
        if self.web_timer >= SPIDER_WEB_COOLDOWN:
            self.web_timer = 0
            projectile_group.add(Web(self.rect.centerx, self.rect.centery, player.rect.center))


class Boss(Enemy):
    def __init__(self, x, y):
        super().__init__(x, y)
        self.image = pygame.Surface((BOSS_SIZE, BOSS_SIZE), pygame.SRCALPHA)
        self._draw_boss()
        self.hp = BOSS_HP
        self.speed = BOSS_SPEED
        self.fire_timer = 0
        self.touch_damage = BOSS_TOUCH_DAMAGE

    def _draw_boss(self):
        center = BOSS_SIZE // 2
        pygame.draw.circle(self.image, DARK_GREEN, (center, center), center)
        pygame.draw.circle(self.image, LIGHT_GREEN, (center, center), center - 20)
        pygame.draw.circle(self.image, YELLOW, (center - 25, center - 10), 8)
        pygame.draw.circle(self.image, YELLOW, (center + 25, center - 10), 8)
        pygame.draw.rect(self.image, ORANGE, (center - 20, center + 20, 40, 15))

    def update(self, player, projectile_group):
        super().update(player, projectile_group)
        self.fire_timer += 1
        if self.fire_timer >= BOSS_FIRE_COOLDOWN:
            self.fire_timer = 0
            projectile_group.add(Fireball(self.rect.centerx, self.rect.centery, player.rect.center))
