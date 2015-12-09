# Creating Your Own Simple Data Pipes Connector (using v1 of the connector API)

### Pre-requisites

##### Access to Data Source

REST API access to the data source providing the content is neeeded. For these instructions, we installed and ran [SugarCRM 6.5.22 Community Edition](http://sourceforge.net/projects/sugarcrm/files/1%20-%20SugarCRM%206.5.X/FastStack/) locally.

##### Enable OAuth Support

Configure the OAuth credentials for SugarCRM 6.x as follows:

1. Log into SugarCRM
2. Go into the OAuth page ( __> Admin > OAuth Keys__ )
3. Click on __Create__
4. Enter a __Consumer Key Name__, __Consumer Key__, and __Consumer Secret__
	###### SugarCRM OAuth Keys page:
	![SugarCRM OAuth Keys page] (sugarcrmoauthkeys.png)

5. Click __Save__

SugarCRM should now be ready for authentication via OAuth.

##### Set Up Local Dev Environment

The instructions for setting up the Simple Data Pipe development environment can be found here: [Instructions for setting up a local dev environment for Simple Data Pipe](https://github.com/ibm-cds-labs/pipes/wiki/Instructions-for-setting-up-a-local-dev-environment-for-Simple-Data-Pipe).

### Creating the New Connector

##### Add a Connector to Simple Data Pipe

The first step is to add a new connector JavaScript file which extends the [connectorExt.js](https://github.com/ibm-cds-labs/pipes/blob/master/server/connectors/connectorExt.js). 

1. Create a directory (e.g., sugarcrm) for your connector under _/pipes/server/connectors_
2. Create an `index.js` file inside the new directory created in step 1
3. To separate any boilerplate code from `index.js`, you can create a second JavaScript file (e.g., connectorUtil.js) for helper functions
4. Edit the new `index.js`:
  * Extend [connectorExt.js](https://github.com/ibm-cds-labs/pipes/blob/master/server/connectors/connectorExt.js) and call it, passing a unique ID and a label for your connector 
5. Edit  `index.js` and add the functions to override. Your connector will need to override a few basic functions:
  * `getTablePrefix` - returns your connector's prefix to be prepended to table names created when copying into Cloudant
  * `connectDataSource` - initiates the OAuth protocol (getting a Request token and authorizing the token)
  * `authCallback` - handles the callback after authorization (get the Access token and obtain the list of tables)
  * `doConnectStep` - connect to data source and verify Access token is still valid (handle token refresh if necessary)
  * `fetchRecords` - get the records which will be copied over into Cloudant

Simple Data Pipe is now able to find and display your connector!

###### index.js:
```
var connectorExt = require("../connectorExt");
var connUtil = require('./connectorUtil.js').ConnectorUtil;

function sugarConnector() {
	
	connectorExt.call(this, connUtil.metadata.id, connUtil.metadata.label);
	
	this.getTablePrefix = function() {
		//prepended to the name of each table created
		return connUtil.metadata.prefix;
	};
	
	this.connectDataSource = function(req, res, pipeId, url, callback) {
		//TODO: get request token and approve request token
		callback("Not yet implemented");
	};
	
	this.authCallback = function(oAuthCode, pipeId, callback, state) {
		//TODO: get access token and use access token to retrieve tables
		callback("Not yet implemented");
	};
	
	this.doConnectStep = function(done, pipeRunStep, pipeRunStats, logger, pipe, pipeRunner) {
		//TODO: reconnect to confirm token still valid
		done();
	};
	
	this.fetchRecords = function(table, pushRecordFn, done, pipeRunStep, pipeRunStats, logger, pipe, pipeRunner) {
		//TODO: fetch records for requested tables
		done();
	}
};

require('util').inherits(sugarConnector, connectorExt);
module.exports = new sugarConnector();
```

###### connectorUtil.js:  
```
var ConnectorUtil = {

	metadata: {
		id: "sugarcrm",
		label: "SugarCRM",
		prefix: "sugar"
	}
	
};

module.exports.ConnectorUtil = ConnectorUtil;
```

###### Development environment console output:
```
Using cloudant service "Cloudant Url"
Pipes Tool started on port 8082 : Fri Sep 25 2015 13:41:51 GMT-0400 (EDT)
Loaded connector SalesForce
Loaded connector stripe
Loaded connector sugarcrm
Cloudant database pipe_db successfully initialized
```
###### Simple Data Pipes' Create A New Pipe dialog:
![Create A New Pipe dialog] (pipescreatenewpipe.png)

<!-- Broberg resume here -->

##### Authenticate with the Data Source (using OAuth)

The OAuth protocol for SugarCRM 6.x is a multi-step flow. With the simplified approch for creating connectors the first steps (Request token and User authorization) should be handled within the `connectDataSource` function while the final step (Access token) should be handled within the `authCallback` function.

1. Implement the `connectDataSource` function
  1. Get the pipe object - which should contain the pipe.clientId (Consumer Key) and pipe.clientSecret (Consumer Secret)
  2. Using the Consumer Key and Consumer Secret obtain a Request token. For SugarCRM 6.x make the REST call passing `method=oauth_request_token`
  3. Store the token and secret received from the request, along with pipeId and url. If your data source's OAuth implementation supports state parameters you may use it or alternatively, you may use the req session object to store the state
  4. Redirect user to approve token. For SugarCRM 6.x make the REST call passing `module=OAuthTokens`, `action=authorize`, `token=<request_token>`
2. Implement the `authCallback` function
  1. Get the pipe object
  2. Using the OAuth code/verifier obtain an Access token. For SugarCRM 6.x make the REST call passing `method=oauth_access_token`, `oauth_verifier=<verifiier>`
  3. Update the pipe object with the access token and secret received from the request
  4. Obtain the list of tables that will be copied over to Cloudant. For SugarCRM 6.x make a REST call passing `method=get_available_modules`
  5. Update the pipe object with the tables from the previous request. The pipe.tables should be an array of objects containing `name` and `labelPlural`
  6. Call the callback function passing in the updated pipe object. The first parameter of `callback()` is an error message or null if no errors
 
Simple Data Pipes is now able to connect to the data source!

###### index.js#connectDataSource:
```
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
				   	res.redirect(connUtil.oauthEndPoint.approveRequestToken + oauth_token);
				}
			}
		);
	});	
};
```

###### index.js#authCallback:
```
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
```

###### connectorUtil.js (with previous content omitted for brevity):
```
var global = require('bluemix-helper-config').global;
var OAuth = require('oauth').OAuth;
var qs = require('querystring');

var siteUrl = "http://127.0.0.1:80/sugarcrm"; //should match your SugarCRM's site_url (in config.php)

var ConnectorUtil = {

	...
	
	//endpoints to be used when negotiating OAuth flow with SugarCRM
	oauthEndPoint: {
		redirect: global.getHostUrl() + "/authCallback",
		rest: siteUrl + "/service/v4/rest.php",
		approveRequestToken: siteUrl + "/index.php?module=OAuthTokens&action=authorize&token=",
		requestAccessToken: siteUrl  + "/service/v4/rest.php?method=oauth_access_token&oauth_verifier="
	},
	
	//client to be used for making OAuth calls and API requests
	oauthClient: function(pipe, verifier) {
		return new OAuth(
			this.oauthEndPoint.rest,
			this.oauthEndPoint.requestAccessToken + verifier,
			pipe.clientId,
			pipe.clientSecret,
			'1.0A',
			this.oauthEndPoint.redirect,
			'HMAC-SHA1'
		);
	},
	
	//various APIs for making SugarCRM REST calls
	restApi: {
		getAvailableModules: function(pipe) { return _getAvailMods(pipe); }
	}
};

/** 
 *  Return the REST API url in the format of
 *    http://{site_url}/service/v4/rest.php?method={method_name}&oauth_token={access_token}&input_type=JSON&response_type=JSON&rest_data={rest_data_json} 
 */
var _getMethod = function(method_name, pipe, rest_data_json) {
	return ConnectorUtil.oauthEndPoint.rest + '?' + qs.stringify({
		method: method_name,
		oauth_token: pipe.oauth.oauth_access_token,
		input_type: "JSON",
		response_type: "JSON",
		rest_data: JSON.stringify(rest_data_json || {})
	});
};

var _getAvailMods = function(pipe) {
	return _getMethod(
		"get_available_modules",
		pipe,
		{ session:"", filter:"default" /* visible modules only */ }
	);
};

...
```

##### Connect to the Data Source and Fetch Records

For the Simple Data Pipe &mdash; for connectors using the simplified approach &mdash; when a run is initiated the connection to the data source should be handled in the `doConnectStep` function, which should confirm the access token is still valid and refresh the token if necessary. Retrieving the records to copy into Cloudant should be handled by the `fetchRecords` function.

1. Implement the `doConnectStep` function
  1. Using the access token (stored in the pipe earlier), connect to the data source to confirm token is still valid. For SugarCRM 6.x make the REST call passing `method=oauth_access`
  2. Refresh the token if access token is no longer valid
  3. Call `done()` when completed
2. Implement the `fetchRecords` function
  1. Obtain the desired records for the given table. For SugarCRM 6.x make the REST call passing `method=get_entry_list`, `module_name=<table/module>`
  2. Update the expected number of records in `pipeRunStats.expectedTotalRecords`
  2. Call the `pushRecordFn` function passing in the array of records
  3. Call `done()`

Simple Data Pipe is now able to retrieve records from the data source!

###### index.js#doConnectStep:
```
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
```

###### index.js#fetchRecords:
```
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
```

###### connectorUtil.js (with previous content omitted for brevity)
```
...

var ConnectorUtil = {

	...
	
	//various APIs for making SugarCRM REST calls
	restApi: {
	
		...
		
		oauthAccess: function(pipe) { return _getOAuthAccess(pipe); },
		
		getEntryList: function(pipe, table) { return _getEntryList(pipe, table);
		}
	}
		
};

...

var _getOAuthAccess = function(pipe) {
	return _getMethod(
		"oauth_access",
		pipe,
		{ session: "" }
	);
};

var _getEntryList = function(pipe, table) {
	return _getMethod(
		"get_entry_list",
		pipe,
		{
			session: "",
			module_name: table.name,
			query: "",
			order_by: "",
			offset: 0,
			select_fields: [],
			link_name_to_fields_array: [],
			max_results: 1000, //if > 0 replaces $sugar_config['list_max_entries_per_page']
			deleted: false,
			favorites: false
		}
	);
};

...
```

### Troubleshooting

##### Logging 
 
Console logging messages that appear in the development environment can be added using `console.log()`  

In addition using the `logger`, which is passed into `doConnectStep` and `fetchRecords`, logging messages can be added to the pipe run logs (e.g., `logger.info()`, `logger.error()`)

##### Connector not available in Simple Data Pipes UI  

* Check browser for JavaScript errors
* Check development environment console for errors when starting Simple Data Pipe
* Confirm connector JavaScript file name is `index.js`
* Confirm connector code is located under _/pipes/server/connectors_

##### Failing to connect to data source  

* Check for errors in development environment console
* Confirm OAuth is configured/enabled in the data source environment
* Confirm data source OAuth flow requirements  

##### Tables are not being listed  

* Check for errors in development environment console
* Confirm the correct data source API is being called with appropriate parameters
* Hard coding the tables list (see the [SampleConnector2](https://github.com/ibm-cds-labs/pipes/tree/master/connector_templates/SampleConnector2) example) to confirm rest of the connector code is working properly 

##### Pipe run appears to be inactive  

Depending on the number of tables and records being copied the pipe run may take some time.  

* Review the pipe run log for status and possible errors
* [Monitor dataWorks activities](https://github.com/ibm-cds-labs/pipes/wiki/How-to-monitor-dataWorks-activities-that-were-started-by-Simple-Data-Pipe)

### Resources

See the [Simple Data Pipes GitHub repo](https://github.com/ibm-cds-labs/pipes) for additional information and resources.

