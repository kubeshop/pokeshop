SRCDIR        = docs/diagrams
OUTPUT_FORMAT = png
SRC           = $(wildcard $(SRCDIR)/*.mdd)
OUT           = ${SRC:.mdd=.$(OUTPUT_FORMAT)}
DETACHED      ?= false
BUILD         ?= false
FLAGS          = ""

help: Makefile ## show list of commands
	@echo "Choose a command run:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

generate-flags:
if ${DETACHED}; then FLAGS += " --detach"; fi
if ${BUILD}; then FLAGS += " --build"; fi

generate-diagrams: $(OUT)

$(SRCDIR)/%.$(OUTPUT_FORMAT): $(SRCDIR)/%.mdd
	npm run generate-diagram -- --input $< --output $@

run/pokeshop: ## run Pokeshop API on docker compose
	docker compose -f docker-compose.yml -f ./docker-compose.stream.yml up ${FLAGS}

down/pokeshop: ## stop Pokeshop API running on docker compose
	docker compose -f docker-compose.yml -f ./docker-compose.stream.yml  down

run/tracetests: ## run Trace-based tests on Pokeshop API with Tracetest
	docker compose -f docker-compose.yml -f ./docker-compose.stream.yml -f ./tracetest/docker-compose.yml run tracebased-tests

run: ## run Pokeshop API on Docker Compose and run Trace-based tests with Tracetest
	docker compose -f docker-compose.yml -f ./docker-compose.stream.yml -f ./tracetest/docker-compose.yml up ${FLAGS}

down: ## stop Pokeshop API on Docker Compose and run Trace-based tests with Tracetest
	docker compose -f docker-compose.yml -f ./docker-compose.stream.yml -f ./tracetest/docker-compose.yml down
