# ─────────────────────────────────────────────────────────────────────
# Site Factory — Makefile
# ─────────────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help
SHELL         := /bin/zsh

# Couleurs
C_RESET  := \033[0m
C_CYAN   := \033[36m
C_GREEN  := \033[32m
C_YELLOW := \033[33m
C_DIM    := \033[2m

# ── Infra ───────────────────────────────────────────────────────────

.PHONY: up down restart logs ps

up: ## Démarre Traefik + MariaDB (+ adminer, whoami, error-pages)
	docker compose up -d
	@echo "$(C_GREEN)✔ Infra démarrée$(C_RESET)"
	@echo "  Traefik dashboard : https://traefik.localhost"
	@echo "  Adminer           : https://adminer.localhost"
	@echo "  MariaDB           : localhost:3307"

down: ## Stoppe tous les containers
	docker compose down

restart: down up ## Redémarre l'infra

logs: ## Logs des containers (follow)
	docker compose logs -f --tail=50

ps: ## Statut des containers
	docker compose ps

# ── Dev ─────────────────────────────────────────────────────────────

.PHONY: dev install

dev: ## Lance l'infra + Next.js dev (Turbopack, port 3100)
	docker compose up -d traefik db
	@echo "$(C_CYAN)▶ Next.js dev sur http://localhost:3100$(C_RESET)"
	pnpm -C site-factory dev

install: ## Installe les dépendances (pnpm)
	pnpm install
	@echo "$(C_GREEN)✔ Dépendances installées$(C_RESET)"

# ── Base de données ────────────────────────────────────────────────

.PHONY: db.migrate db.seed db.reset db.studio db.generate

db.migrate: ## Applique les migrations Prisma
	pnpm -C site-factory prisma:migrate

db.seed: ## Seed la base de données
	pnpm -C site-factory prisma:seed

db.reset: ## Reset complet de la DB (migrate reset + seed)
	cd site-factory && npx prisma migrate reset --force
	@echo "$(C_GREEN)✔ Base de données réinitialisée$(C_RESET)"

db.studio: ## Ouvre Prisma Studio (GUI)
	cd site-factory && npx prisma studio

db.generate: ## Régénère le client Prisma
	pnpm -C site-factory prisma:generate

# ── Génération configs (compose + traefik) ────────────────────────────

.PHONY: regen regen.compose regen.traefik

regen: regen.compose regen.traefik ## Régénère TOUT (docker-compose fragments + Traefik + certs)
	@echo "$(C_GREEN)✔ Configs régénérées$(C_RESET)"

regen.compose: ## Génère tous les docker-compose fragments (configs/*)
	cd site-factory && npx tsx prisma/generate-configs.ts

regen.traefik: ## Force la régénération Traefik dynamic.yml (+ mkcert si besoin)
	pnpm -C site-factory sf:traefik

# NOTE:
# - `regen.compose` appelle déjà generateTraefikConfig() dans ton script actuel.
# - Donc si tu veux éviter le double run, supprime regen.traefik OU retire
#   l'appel à generateTraefikConfig() de generate-configs.ts.
#
# Recommandation: garder `regen` => 1 seule source de vérité.

# ── Qualité ─────────────────────────────────────────────────────────

.PHONY: lint typecheck check

lint: ## Lint ESLint
	pnpm -C site-factory lint

typecheck: ## Vérifie les types TypeScript (tsc --noEmit)
	pnpm -C site-factory typecheck

check: lint typecheck ## Lint + TypeScript

# ── Build ───────────────────────────────────────────────────────────

.PHONY: build start

build: ## Build de production Next.js
	pnpm -C site-factory build

start: ## Démarre le serveur de production
	pnpm -C site-factory start

# ── Nettoyage ───────────────────────────────────────────────────────

.PHONY: clean clean.all

clean: ## Supprime .next et les caches
	rm -rf site-factory/.next site-factory/.turbo
	@echo "$(C_GREEN)✔ Caches nettoyés$(C_RESET)"

clean.all: clean ## Clean + supprime node_modules + volumes Docker
	rm -rf node_modules site-factory/node_modules
	@# Stop all project containers (each subfolder in configs/)
	@for dir in configs/*/*/docker-compose.local.yml; do \
		if [ -f "$$dir" ]; then \
			pdir=$$(dirname "$$dir"); \
			pname=$$(basename "$$pdir"); \
			echo "  $(C_DIM)Stopping $$pname…$(C_RESET)"; \
			docker compose -p "$$pname" down -v --remove-orphans 2>/dev/null || true; \
		fi; \
	done
	@# Also stop any orphan compose projects whose files are already gone
	@docker compose ls -q 2>/dev/null | while read -r proj; do \
		case "$$proj" in claude) ;; *) \
			echo "  $(C_DIM)Stopping orphan $$proj…$(C_RESET)"; \
			docker compose -p "$$proj" down -v --remove-orphans 2>/dev/null || true;; \
		esac; \
	done
	docker compose down -v
	@echo "$(C_YELLOW)⚠ node_modules et volumes Docker supprimés$(C_RESET)"

# ── Docker compose validation ──────────────────────────────────────

.PHONY: compose.validate

compose.validate: ## Valide le docker-compose.yml
	docker compose config --quiet
	@echo "$(C_GREEN)✔ docker-compose.yml valide$(C_RESET)"

# ── Help ────────────────────────────────────────────────────────────

.PHONY: help

help: ## Affiche cette aide
	@echo ""
	@echo "$(C_CYAN)Site Factory — Commandes disponibles$(C_RESET)"
	@echo ""
	@grep -E '^[a-zA-Z_.]+:.*##' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*## "}; {printf "  $(C_GREEN)%-20s$(C_RESET) %s\n", $$1, $$2}'
	@echo ""