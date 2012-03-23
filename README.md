`./configure` or `./configure --global` after cloning to set things up (submodules, tools build, npm install etc.)

`make` or `node app.js` to start local dev server.  
`make redis` to start redis server.  
`make test` or `vows tests/*` to run tests.

# TODO

* Fix 0.4.7 build error

# Test HOW-TO

* `make test` or `vows tests/*` to run all the tests.
* `make spec` or `vows tests/* --spec` to gets detailed report.
* `vows tests/model.js --spec` to run only the `model.js` tests with detailed report.

