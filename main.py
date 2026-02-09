import pygame, sys, random
from settings import *
from player import Player
from enemy import Enemy, Spider, Boss
from bullet import Bullet
from powerup import PowerUp

pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Shooter Game")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 30)
big_font = pygame.font.SysFont(None, 48)

# Sprites
player = Player(SCREEN_WIDTH//2, SCREEN_HEIGHT//2)
player_group = pygame.sprite.Group(player)
bullet_group = pygame.sprite.Group()
enemy_group = pygame.sprite.Group()
powerup_group = pygame.sprite.Group()
enemy_projectiles = pygame.sprite.Group()

# Game state
wave = 1
wave_timer = 60 * FPS
rest_timer = 0
wave_state = "playing"
paused = False
powerup_timer = 0

def spawn_wave(wave_num):
    enemy_group.empty()
    enemy_projectiles.empty()
    if wave_num == 1:
        for _ in range(5):
            x = random.randint(50, SCREEN_WIDTH-50)
            y = random.randint(50, SCREEN_HEIGHT-50)
            enemy_group.add(Enemy(x, y))
    elif wave_num == 2:
        for _ in range(5):
            x = random.randint(50, SCREEN_WIDTH-50)
            y = random.randint(50, SCREEN_HEIGHT-50)
            enemy_group.add(Spider(x, y))
    elif wave_num == 3:
        x = SCREEN_WIDTH//2
        y = 100
        enemy_group.add(Boss(x, y))

spawn_wave(wave)

def draw_hud():
    ammo_text = font.render(f"Ammo: {player.bullets}", True, WHITE)
    screen.blit(ammo_text, (10, 60))

    health_width = 200
    bar_x = SCREEN_WIDTH // 2 - health_width // 2
    pygame.draw.rect(screen, RED, (bar_x, SCREEN_HEIGHT - 30, health_width, 20))
    hp_ratio = max(player.hp, 0) / PLAYER_HP
    pygame.draw.rect(screen, GREEN, (bar_x, SCREEN_HEIGHT - 30, health_width * hp_ratio, 20))
    hp_text = font.render(f"HP: {player.hp}", True, WHITE)
    screen.blit(hp_text, (bar_x + 60, SCREEN_HEIGHT - 28))

    pygame.draw.rect(screen, GRAY, (10, 10, 90, 35))
    pause_text = font.render("Pause", True, WHITE)
    screen.blit(pause_text, (20, 15))

    if player.powerup_timer > 0:
        buff_text = font.render("Damage +10!", True, YELLOW)
        screen.blit(buff_text, (SCREEN_WIDTH - 160, 10))

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if 10 <= mx <= 100 and 10 <= my <= 45:
                paused = not paused
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and player.bullets > 0:
                target = pygame.mouse.get_pos()
                bullet_group.add(Bullet(player.rect.centerx, player.rect.centery, target, player.damage))
                player.bullets -= 1
            if event.key == pygame.K_r:
                player.bullets = BULLET_CAPACITY

    keys = pygame.key.get_pressed()
    if not paused:
        if wave_state == "playing":
            player_group.update(keys)
            bullet_group.update()
            enemy_group.update(player, enemy_projectiles)
            enemy_projectiles.update()
            powerup_group.update()

            for bullet in bullet_group:
                hit = pygame.sprite.spritecollide(bullet, enemy_group, False)
                for enemy in hit:
                    enemy.hp -= bullet.damage
                    bullet.kill()
                    if enemy.hp <= 0:
                        enemy.kill()

            if player.invincible_timer == 0:
                for enemy in pygame.sprite.spritecollide(player, enemy_group, False):
                    player.hp -= enemy.touch_damage
                    player.invincible_timer = PLAYER_INVINCIBLE_FRAMES

            for projectile in pygame.sprite.spritecollide(player, enemy_projectiles, True):
                if player.invincible_timer == 0:
                    player.hp -= projectile.damage
                    player.invincible_timer = PLAYER_INVINCIBLE_FRAMES

            for pu in pygame.sprite.spritecollide(player, powerup_group, True):
                if pu.type == "heal":
                    player.hp = min(player.hp + 50, PLAYER_HP)
                elif pu.type == "damage":
                    player.damage += 10
                    player.powerup_timer = POWERUP_DURATION * FPS

            if player.powerup_timer > 0:
                player.powerup_timer -= 1
            else:
                player.damage = BULLET_DAMAGE

            if wave < 3:
                wave_timer -= 1
                if wave_timer <= 0:
                    wave_state = "rest"
                    rest_timer = 15 * FPS
                    enemy_group.empty()
                    enemy_projectiles.empty()
            else:
                if len(enemy_group) == 0:
                    wave_state = "level_complete"

            powerup_timer += 1
            if powerup_timer >= POWERUP_INTERVAL * FPS:
                powerup_timer = 0
                if random.choice([True, False]):
                    powerup_group.add(PowerUp("heal"))
                else:
                    powerup_group.add(PowerUp("damage"))

        elif wave_state == "rest":
            rest_timer -= 1
            if rest_timer <= 0:
                wave += 1
                if wave <= 3:
                    spawn_wave(wave)
                    wave_timer = 60 * FPS
                    wave_state = "playing"
        elif wave_state == "level_complete":
            pass

    # Draw
    screen.fill(BLACK)
    player_group.draw(screen)
    bullet_group.draw(screen)
    enemy_group.draw(screen)
    powerup_group.draw(screen)
    enemy_projectiles.draw(screen)
    draw_hud()
    if wave_state == "rest":
        text = big_font.render("Wave voltooid!", True, WHITE)
        screen.blit(text, text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)))
    if wave_state == "level_complete":
        text = big_font.render("Level voltooid!", True, WHITE)
        screen.blit(text, text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2)))
    pygame.display.flip()
    clock.tick(FPS)
