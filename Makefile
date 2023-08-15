SRCDIR        = docs/diagrams
OUTPUT_FORMAT = png
SRC           = $(wildcard $(SRCDIR)/*.mdd)
OUT           = ${SRC:.mdd=.$(OUTPUT_FORMAT)}

help: Makefile ## show list of commands
	@echo "Choose a command run:"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /[a-zA-Z_-]+:.*?## / {sub("\\\\n",sprintf("\n%22c"," "), $$2);printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST) | sort

generate-diagrams: $(OUT)

$(SRCDIR)/%.$(OUTPUT_FORMAT): $(SRCDIR)/%.mdd
	npm run generate-diagram -- --input $< --output $@

run: ## run Pokeshop API on docker compose
	docker compose -f docker-compose.yml -f ./tracetest/docker-compose.tracetest.yaml up

down: ## stop Pokeshop API running on docker compose
	docker compose -f docker-compose.yml -f ./tracetest/docker-compose.tracetest.yaml down
