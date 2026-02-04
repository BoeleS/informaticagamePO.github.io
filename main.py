import pygame, sys, random
from settings import *
from player import Player
from enemy import Enemy, Spider, Boss
from bullet import Bullet, Web
from powerup import PowerUp

pygame.init()
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Shooter Game")
clock = pygame.time.Clock()
font = pygame.font.SysFont(None, 30)

# Sprites
player = Player(SCREEN_WIDTH//2, SCREEN_HEIGHT//2)
player_group = pygame.sprite.Group(player)
bullet_group = pygame.sprite.Group()
enemy_group = pygame.sprite.Group()
powerup_group = pygame.sprite.Group()

# Game state
wave = 1
wave_timer = 60 * FPS
wave_rest = 15 * FPS
paused = False
last_powerup = 0
powerup_timer = 0

def spawn_wave(wave_num):
    enemy_group.empty()
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
    # Leven onderaan
    pygame.draw.rect(screen, RED, (SCREEN_WIDTH//2-50, SCREEN_HEIGHT-30, 100, 20))
    pygame.draw.rect(screen, GREEN, (SCREEN_WIDTH//2-50, SCREEN_HEIGHT-30, player.hp, 20))
    # Kogels linksboven
    text = font.render(f"Ammo: {player.bullets}", True, WHITE)
    screen.blit(text, (10, 10))
    # Pauzeer knop
    pygame.draw.rect(screen, GRAY, (SCREEN_WIDTH-110, 10, 100, 40))
    text2 = font.render("Pause", True, WHITE)
    screen.blit(text2, (SCREEN_WIDTH-90, 20))

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()
        if event.type == pygame.MOUSEBUTTONDOWN:
            mx, my = event.pos
            if SCREEN_WIDTH-110 <= mx <= SCREEN_WIDTH-10 and 10 <= my <= 50:
                paused = not paused
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_SPACE and player.bullets > 0:
                bullet_group.add(Bullet(player.rect.centerx, player.rect.centery, 1, player.damage))
                player.bullets -= 1

    keys = pygame.key.get_pressed()
    if not paused:
        player_group.update(keys)
        bullet_group.update()
        enemy_group.update(player)
        powerup_group.update()

        # Botsing bullets
        for bullet in bullet_group:
            hit = pygame.sprite.spritecollide(bullet, enemy_group, False)
            for enemy in hit:
                enemy.hp -= bullet.damage
                bullet.kill()
                if enemy.hp <= 0:
                    enemy.kill()

        # Botsing powerups
        for pu in pygame.sprite.spritecollide(player, powerup_group, True):
            if pu.type == "heal":
                player.hp = min(player.hp+50, PLAYER_HP)
            elif pu.type == "damage":
                player.damage += 10
                player.powerup_timer = POWERUP_DURATION * FPS

        # Powerup timer
        if player.powerup_timer > 0:
            player.powerup_timer -= 1
        else:
            player.damage = BULLET_DAMAGE

        # Wave timer
        wave_timer -= 1
        if wave_timer <= 0:
            if wave < 3:
                screen.fill(BLACK)
                text = font.render("Wave voltooid!", True, WHITE)
                screen.blit(text, (SCREEN_WIDTH//2-60, SCREEN_HEIGHT//2))
                pygame.display.flip()
                pygame.time.delay(15000)
                wave += 1
                spawn_wave(wave)
                wave_timer = 60 * FPS
            else:
                screen.fill(BLACK)
                text = font.render("Level voltooid!", True, WHITE)
                screen.blit(text, (SCREEN_WIDTH//2-60, SCREEN_HEIGHT//2))
                pygame.display.flip()
                pygame.time.delay(5000)
                pygame.quit()
                sys.exit()

        # Powerups spawn
        powerup_timer += 1
        if powerup_timer >= POWERUP_INTERVAL * FPS:
            powerup_timer = 0
            if random.choice([True, False]):
                powerup_group.add(PowerUp("heal"))
            else:
                powerup_group.add(PowerUp("damage"))

    # Draw
    screen.fill(BLACK)
    player_group.draw(screen)
    bullet_group.draw(screen)
    enemy_group.draw(screen)
    powerup_group.draw(screen)
    draw_hud()
    pygame.display.flip()
    clock.tick(FPS)
