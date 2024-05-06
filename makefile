.PHONY: clean generate migrate

clean:
	rm -rf .wrangler/state/v3/d1 migrations

all: clean generate migrate