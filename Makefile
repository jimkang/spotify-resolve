test:
	node tests/basictests.js

pushall:
	git push origin master && npm publish

lint:
	./node_modules/.bin/eslint .

get-access-token:
	# ENCODEDCREDS should be "clientid:clientsecret", base64-encoded. 
	curl -H "Authorization: Basic $(ENCODEDCREDS)" -d grant_type=client_credentials https://accounts.spotify.com/api/token