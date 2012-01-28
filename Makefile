
default: web

install_tools:
	npm install -g express
	npm install -g vows
web:
	node app.js
spec: test
test:
	vows tests/*
ci:
	vows -w tests/*
