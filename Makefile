default: server
server:
	node app.js
test:
	vows tests/*
spec:
	vows tests/* --spec
redis:
	./tools/redis/src/redis-server
redis-cli:
	./tools/redis/src/redis-cli
cloc:
	cloc --exclude-dir=.git,node_modules,tools,lib .

