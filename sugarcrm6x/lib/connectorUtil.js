
'use strict';

var global = require.main.require('bluemix-helper-config').global;
var OAuth = require('oauth').OAuth;
var qs = require('querystring');

var ConnectorUtil = {

	metadata: {
		id: "sugarcrm",		//unique ID for the connector
		label: "SugarCRM",	//connector name that displays in the UI
		prefix: "sugar"		//prefix prepended to each table created from the connector
	},
	
	//endpoints to be used when negotiating OAuth flow with SugarCRM

	oauthEndPoint: function(pipe) {
		return {
			redirect: global.getHostUrl() + "/authCallback",
			rest: pipe.siteUrl + "/service/v4/rest.php",
			approveRequestToken: pipe.siteUrl + "/index.php?module=OAuthTokens&action=authorize&token=",
			requestAccessToken: pipe.siteUrl  + "/service/v4/rest.php?method=oauth_access_token&oauth_verifier="
		}
	},
	
	//client to be used for making OAuth calls and API requests
	oauthClient: function(pipe, verifier) {
		// make sure the parameter identifies a valid SugarCRM pipe 
		if ((typeof pipe === "undefined") || (pipe === null) || (pipe.connectorId !== this.metadata.id)) {
			console.error("Unable to retrieve OAuth client. Pipe has incorrect connector type:", pipe.connectorId);
			return null;
		}
		
		return new OAuth(
			this.oauthEndPoint(pipe).rest,
			this.oauthEndPoint(pipe).requestAccessToken + verifier,
			pipe.clientId,
			pipe.clientSecret,
			'1.0A',
			this.oauthEndPoint(pipe).redirect,
			'HMAC-SHA1'
		);
	},
	
	//various APIs for making SugarCRM REST calls
	restApi: {
		getAvailableModules: function(pipe) {
			return _getAvailMods(pipe);
		},
		
		oauthAccess: function(pipe) {
			return _getOAuthAccess(pipe);
		},
		
		getEntryList: function(pipe, table) {
			return _getEntryList(pipe, table);
		}
	}
		
};


// http://{site_url}/service/v4/rest.php?method={method_name}&oauth_token={access_token}&input_type=JSON&response_type=JSON&request_type=JSON&rest_data={api_data}
var _getMethod = function(method_name, pipe, rest_data_json) {
	return ConnectorUtil.oauthEndPoint(pipe).rest + '?' + qs.stringify({
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
		{
			session: "",
			filter: "default",	//visible modules only
		}
	);
};

var _getOAuthAccess = function(pipe) {
	return _getMethod(
		"oauth_access",
		pipe,
		{
			session: ""
		}
	);
};

var _getEntryList = function(pipe, table) {
	return _getMethod(
		"get_entry_list",
		pipe,
		{
			session: "", //pipe.oauth.session_id,
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


//exports
module.exports.ConnectorUtil = ConnectorUtil;
