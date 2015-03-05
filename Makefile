HOMEDIR = /var/www/codesampler
#HOMEDIR = ~/gcw/codesampler
GITDIR = /var/repos/codesampler.git

PM2 = $(HOMEDIR)/node_modules/pm2/bin/pm2

test:
	node tests/commits-from-events-tests.js
	node tests/sample-commit-stream-tests.js
	node tests/analysis-tests.js
	node tests/analysis-to-postable-stream-tests.js
	node tests/excerptpicker-tests.js
	node tests/already-used-filter-tests.js

test-integration: start-sampledcode-chronicler
	node tests/integration/sample-analyze-excerpt-tests.js

run: start-sampledcode-chronicler
	node run-code-sampler.js

dry-run: start-sampledcode-chronicler
	node run-code-sampler.js --dry

start-sampledcode-chronicler:
	$(PM2) start start-chronicler.js --name sampledcode-chronicler || \
		echo "sampledcode-chronicler already started"

stop-sampledcode-chronicler:
	$(PM2) stop sampledcode-chronicler || echo "Didn't need to stop process."

check-processes:
	$(PM2) list

npm-install:
	cd $(HOMEDIR)
	npm install
	npm prune

sync-worktree-to-git:
	git --work-tree=$(HOMEDIR) --git-dir=$(GITDIR) checkout -f

post-receive: sync-worktree-to-git npm-install stop-sampledcode-chronicler \
	start-sampledcode-chronicler
