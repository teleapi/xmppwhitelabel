var XMPPClient = require('node-xmpp-client');
var XMPPServer = require('node-xmpp-server');
var ltx = require('node-xmpp-core').ltx;
var uuid = require('node-uuid');

var server = null;
var clients = {};
var server_name = '208.103.144.163';

function startServer(done) {
	done = done || function () {};
	server = new XMPPServer.C2S.TCPServer({
		port: 5222,
		domain: server_name
	});
	
	server.on('connection', function (client) {
		client.uuid = uuid.v4();
		client.upstream = null;
		client.on('authenticate', function (opts, cb) {
			//console.log('Authenticating:', opts);
			opts.username = opts.username
				.split('@')[0]
				.replace(/[^0-9]/g, '')
			;
			var c = new XMPPClient({ jid: opts.username + '@sms.gdn', password: opts.password });
			//console.log('upstream auth:', c);
			c.timeout = new Date().getTime();
			client.upstream = c;
			client.opts = opts;
			
			c.on('stanza', function (stanza) {
				console.log('Upstream Before:', stanza.toString());
				if (typeof stanza.attrs.from != 'undefined') {
					if (stanza.attrs.from.indexOf('@') !== -1) {
						var number = stanza.attrs.from.split('@').shift();
						stanza.attrs.from = number + '@' + server_name;
					} else {
						stanza.attrs.from = stanza.attrs.from.replace('sms.gdn', server_name);
					}
				}
				stanza.attrs.to = client.opts.username + '@' + server_name;
				console.log('Upstream After:', stanza.toString());
				client.send(stanza);
			});
			
			c.on('online', function () {
				console.log('Online:', c.jid);
				cb(null, opts);
				//console.log(client.upstream);
			});
			
			c.on('error', function (a) {
				cb(false);
				console.log('Upstream Error:', a);
			});
		});
		
		client.on('error', function (a) {
			console.log('Client Error:', a);
		});
		
		client.on('stanza', function (stanza) {
			console.log('Client Before:', stanza.toString());
			stanza.attrs.from = client.opts.username + '@sms.gdn';
			if (typeof stanza.attrs.to != 'undefined') {
				if (stanza.attrs.to.indexOf('@') !== -1) {
					var number = stanza.attrs.to.split('@').shift();
					stanza.attrs.to = number + '@sms.gdn';
				} else {
					stanza.attrs.to = stanza.attrs.to.replace(server_name, 'sms.gdn');
				}
			}
			console.log('Client After:', stanza.toString());
			if (client.upstream) {
				//~ var s = ltx.parse(stanza.toString().replace(server_replace, 'sms.gdn'));
				//~ console.log('Client after:', s.toString());
				client.upstream.send(stanza);
			}
		});
	});
	
	server.on('listening', done);
}

startServer(function () {
	console.log('XMPP listening on port 5222');
});
