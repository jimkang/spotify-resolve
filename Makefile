test:
	node tests/basictests.js
	node tests/bearer-token-tests.js

pushall:
	git push origin master && npm publish

prettier:
	prettier --single-quote --write "**/*.js"

get-access-token:
	# ENCODEDCREDS should be "clientid:clientsecret", base64-encoded. 
	curl -H "Authorization: Basic $(ENCODEDCREDS)" -d grant_type=client_credentials https://accounts.spotify.com/api/token
