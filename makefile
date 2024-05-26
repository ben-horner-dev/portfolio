run-dev:
	docker-compose -f ./tools/docker/docker-compose-dev.yml -p portfolio-dev up
build-dev:
	docker-compose -f ./tools/docker/docker-compose-dev.yml build
test: 
	docker-compose -f ./tools/docker/docker-compose-dev.yml -p portfolio-dev up -d && cd src/frontend && npm run test && sudo npm run cypress:run && cd ../backend && python3 -m pytest --disable-warnings $(file) -s --cov=. --cov-report=term -p no:warnings --cov-config=./pyproject.toml -vv --cov-fail-under=100