SRCDIR  = docs/diagrams
SRC     = $(wildcard $(SRCDIR)/*.mdd)
SVG     = ${SRC:.mdd=.svg}

generate-diagrams: $(SVG)

$(SRCDIR)/%.svg: $(SRCDIR)/%.mdd
	npm run generate-diagram -- --input $< --output $@