# xmppwhitelabel

This is a simple go-between for anyone that wants to whitelabel the teleapi XMPP service. All it does is accept messages and pass them up to the XMPP server at sms.gdn and pass messages from sms.gdn to the client.

#### Settings
In index.js -- change the variable server_name and tls settings / path to certificate

After that, just run with forever (`npm install -g forever`, `forever start /path/to/index.js`). Would probably also work well in docker. 
