SRCDIR        = docs/diagrams
OUTPUT_FORMAT = png
SRC           = $(wildcard $(SRCDIR)/*.mdd)
OUT           = ${SRC:.mdd=.$(OUTPUT_FORMAT)}

generate-diagrams: $(OUT)

$(SRCDIR)/%.$(OUTPUT_FORMAT): $(SRCDIR)/%.mdd
	npm run generate-diagram -- --input $< --output $@

run:
	docker compose -f docker-compose.yml -f ./tracetest/docker-compose.tracetest.yaml up

down:
	docker compose -f docker-compose.yml -f ./tracetest/docker-compose.tracetest.yaml down
