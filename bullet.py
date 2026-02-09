import pygame
from settings import *


class Projectile(pygame.sprite.Sprite):
    def __init__(self, x, y, target_pos, speed, color, size, damage):
        super().__init__()
        self.image = pygame.Surface(size, pygame.SRCALPHA)
        pygame.draw.circle(self.image, color, (size[0] // 2, size[1] // 2), size[0] // 2)
        self.rect = self.image.get_rect(center=(x, y))
        direction = pygame.math.Vector2(target_pos) - pygame.math.Vector2(x, y)
        if direction.length() == 0:
            direction = pygame.math.Vector2(1, 0)
        self.velocity = direction.normalize() * speed
        self.damage = damage

    def update(self):
        self.rect.x += self.velocity.x
        self.rect.y += self.velocity.y
        if (
            self.rect.right < 0
            or self.rect.left > SCREEN_WIDTH
            or self.rect.top < 0
            or self.rect.bottom > SCREEN_HEIGHT
        ):
            self.kill()


class Bullet(Projectile):
    def __init__(self, x, y, target_pos, damage):
        super().__init__(x, y, target_pos, BULLET_SPEED, YELLOW, (10, 10), damage)


class Web(Projectile):
    def __init__(self, x, y, target_pos):
        super().__init__(x, y, target_pos, WEB_SPEED, WEB_COLOR, (12, 12), WEB_DAMAGE)


class Fireball(Projectile):
    def __init__(self, x, y, target_pos):
        super().__init__(x, y, target_pos, FIREBALL_SPEED, FIREBALL_COLOR, (16, 16), FIREBALL_DAMAGE)
