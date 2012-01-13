Phat - view
Chakrit - model/redis
Tor - controller

`make` or `node app.js` to start local dev server.

# TODO

* Test deploy to heroku
* Fix 0.4.7 build error
* Ask @chakrit about JAM to use the model layer.

# Test HOW-TO

* `make test` or `node test.js` to run test 1 time.
* `make ci` or `node test_ci.js` to spin a non-stop test loop.
* `touch ./tests/file.js` - Add a new test file (and restart the test loop)

Look in `sample.js` for sample code.

# Node HOW-TO

1. Ensure you're set for compiling stuff.
   * Windows - Get Cygwin and install `gcc` and `make`
   * Mac - Install the latest XCode and you should be set.
   * Linux - Get `gcc` and `make` using your package manager.
     On Ubuntu it's ready-made: `apt-get install build-essential`.
2. Get [NVM](https://github.com/creationix/nvm).
3. `nvm install v0.4.7` and `nvm alias default 0.4.7` to install
   and set node 0.4.7 as the main version. You may want to also
   install the latest one (0.6.7 last I checked).
4. `nvm use default` - To switch to the default node configuration.
5. Test it out with `echo "console.log('hello World');" | node`.

**NOTE:** For redis, you may want `printf` and `netcat` or `telnet`
packages on your system as well.

# Redis HOW-TO

I've included redis builds as a submodule inside the folder `tools/redis`
so just do:

1. `cd versez` - Switch to project folder.
2. `git submodule init` - This should fetch redis source into tools/redis
3. `cd tools/redis` - We're going to make redis
4. `make` - To start compiling redis.
5. `src/redis-server` - You should be greeted with a redis build.
6. Open another terminal screen (leave redis running).
7. `printf "PING\r\nQUIT\r\n" | nc localhost 6379`
   Tests local redis connectivity.
8. If you see a `+PONG\r\n+OK\r\n` then you should be good to go.
9. If you want to install `redis-server` binary into your system for
   easy access, run `make install` inside the `tools/redis` directory.

