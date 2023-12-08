PHONY: tests
tests:
	python3 -m pytest --disable-warnings $(file) -s --cov=./src/backend --cov-report=term -p no:warnings --cov-config=./pyproject.toml -vv
