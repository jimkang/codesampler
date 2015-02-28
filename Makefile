test:
	node tests/commits-from-events-tests.js
	node tests/sample-commit-stream-tests.js
	node tests/analysis-tests.js
	node tests/analysis-to-excerpt-stream-tests.js
	node tests/excerptpicker-tests.js

test-integration:
	node tests/integration/sample-analyze-excerpt-tests.js

run:
	node run-code-sampler.js

dry-run:
	node run-code-sampler.js --dry
