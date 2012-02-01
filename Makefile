
default: server
server:
	node app.js
test:
	vows tests/*
spec:
	vows tests/* --spec
redis:
	./tools/redis/src/redis-server
