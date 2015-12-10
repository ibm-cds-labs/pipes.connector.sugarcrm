
'use strict';

var pipesSDK = require.main.require('pipes-sdk');
var connectorExt = pipesSDK.connectorExt;
var connUtil = require('./connectorUtil.js').ConnectorUtil;
var pipeDb = pipesSDK.pipesDb;
var _  = require('lodash');


/**
 * SugarCRM connector
 */
function sugarConnector() {
	
	//Call constructor from super class
	connectorExt.call(this, connUtil.metadata.id, connUtil.metadata.label);
	

	/**
	 * prepended to the name of each table created
	 */
	this.getTablePrefix = function() {
		return connUtil.metadata.prefix;
	};
	
	
	/**
	 * get request token and approve request token
	 */
	this.connectDataSource = function(req, res, pipeId, url, callback) {

		//get the pipe object
		pipeDb.getPipe(pipeId, function(err, pipe) {
			if (err) {
				console.error("connectDataSource > getPipe - error: ", err);
				return callback(err);
			}
			
			var oauth = connUtil.oauthClient(pipe);
			
			//obtain a request token
			oauth.getOAuthRequestToken(
				{ "method": "oauth_request_token" },
				function(err, oauth_token, oauth_token_secret, results) {
					if (err) {
						console.error("connectDataSource > getOAuthRequestToken - error: ", err);
					}
					else {
						//store pipe, url, token, secret in session to retrieve/use after token has been manually authorized
						req.session.state = JSON.stringify({pipe: pipeId, url: url, oauth_token: oauth_token, oauth_token_secret: oauth_token_secret });
						
						//redirect the user to authorize the token
					   	res.redirect(connUtil.oauthEndPoint(pipe).approveRequestToken + oauth_token);
					}
				}
			);
		});
		
	};
	
	
	/**
	 * get access token and use access token to retrieve tables (i.e. modules)
	 */
	this.authCallback = function(oAuthCode, pipeId, callback, state) {

		//get the pipe object
		pipeDb.getPipe(pipeId, function(err, pipe) {
			if (err) {
				console.error("authCallback > getPipe - error: ", err);
				return callback(err);
			}

			var oauth = connUtil.oauthClient(pipe, oAuthCode);
			
			//obtain an access token
			oauth.getOAuthAccessToken(
				state.oauth_token, 
				state.oauth_token_secret, 
				oAuthCode, 
				function(err, oauth_access_token, oauth_access_token_secret, results) {
					if (err) {
						console.error("authCallback > getOAuthAccessToken - error: ", err);
						return callback(err);
				 	}
				 	else {
						//update the pipe with the oauth token and token secret
						pipe.oauth = {
							oauth_access_token: oauth_access_token,
							oauth_access_token_secret: oauth_access_token_secret
						};
						
						//obtain the list of tables to be copied over into Cloudant
						oauth.get(
							connUtil.restApi.getAvailableModules(pipe),
							oauth_access_token,
							oauth_access_token_secret,
							function(err, data, res) {
								if (err) {
									console.error("authCallback > get_available_modules - error: ", err);
									return callback(err);
							 	}
								else {
									var modules = JSON.parse(data).modules;
									
									//update the pipe with the tables (i.e., modules)
									pipe.tables = _.map(modules, function(module) {
														return { name: module.module_key, labelPlural: (module.module_label && module.module_label.length > 0) ? module.module_label : module.module_key }; 
													});
									
									//pass the updated pipe to the callback
							    	callback(null, pipe);
								}
							}
						);
				 	}
				}
			);
		});
		
	};
	
	
	/**
	 * reconnect to confirm token still valid and obtain a session_id
	 */
	this.doConnectStep = function(done, pipeRunStep, pipeRunStats, logger, pipe, pipeRunner) {

		console.log("Calling doConnectStep() for", pipe.name);

		var oauth = connUtil.oauthClient(pipe);
		
		try {
			//connect to the data source, check access token is still valid 
			oauth.get(
				connUtil.restApi.oauthAccess(pipe),
				pipe.oauth.oauth_access_token,
				pipe.oauth.oauth_access_token_secret,
				function(err, data, res) {
					if (err) {
						logger.error("doConnectStep > oauth_access - error: ", err);
						done(err);
				 	}
					else {
						//TODO: check if token is valid and refresh if not
						
				    	done();
					}
				}
			);
		}
		catch(e) {
			logger.error("doConnectStep exception:", e);
			done(e);
		}
	};
	
	
	/**
	 * fetch records for requested tables (i.e., modules)
	 */
	this.fetchRecords = function(table, pushRecordFn, done, pipeRunStep, pipeRunStats, logger, pipe, pipeRunner) {

		console.log("Calling fetchRecords() for", table.name);

		var oauth = connUtil.oauthClient(pipe);
		
		try {
			//fetch list of entries for the given table
			oauth.get(
				connUtil.restApi.getEntryList(pipe, table),
				pipe.oauth.oauth_access_token,
				pipe.oauth.oauth_access_token_secret,
				function(err, data, res) {
					if (err) {
						logger.error("fetchRecords > get_entry_list - error:", err);
						return done(err);
				 	}
					else {
						var dataJson = {};
						
						try {
							dataJson = JSON.parse(data);
							if (typeof dataJson.total_count == "undefined") {
								logger.info("Skipping table", table.name, ":", data);
							}
							else {
								//set expected number of records so percentage complete can be calculated
								if (pipeRunStats.expectedTotalRecords) {
									pipeRunStats.expectedTotalRecords += dataJson.entry_list.length;
								}
								else {
									pipeRunStats.expectedTotalRecords = dataJson.entry_list.length;
								}
								//send the list of entries to retrieve
								pushRecordFn(dataJson.entry_list);
							}
						}
						catch(e) {
							logger.error("Error with table", table.name, ":", data);
						}
						
				    	done();
					}
				}
			);
		}
		catch(e) {
			logger.error("fetchRecords exception: ", e);
			done(e);
		}
	}
	
};

//Extend event Emitter
require('util').inherits(sugarConnector, connectorExt);

module.exports = new sugarConnector();
