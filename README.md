# pipes.connector.sugarcrm

##### [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/) connector for SugarCRM

This connector is based on the initial connector API and before the implementation of the [pipes-sdk](https://github.com/ibm-cds-labs/pipes-sdk).

It is also the connector used in the original draft of the [Creating Your Own Simple Data Pipe Connector](https://developer.ibm.com/clouddataservices/create-your-own-cloud-etl-connector-easy/) tutorial.


### Pre-requisites

##### Access to SugarCRM

SugarCRM 6.x installed and running.

##### Enable OAuth Support

Configure the OAuth credentials for SugarCRM 6.x as follows:

1. Log into SugarCRM
2. Go into the OAuth page ( __> Admin > OAuth Keys__ )
3. Click on __Create__
4. Enter a __Consumer Key Name__, __Consumer Key__, and __Consumer Secret__
5. Click __Save__


### Using the SugarCRM Connector 

##### Add the Connector into Simple Data Pipe

Copy the repository into the Simple Data Pipes connectors directory (i.e., _/pipes/server/connectors_).

##### Update the SugarCRM site_url

Edit the `connectorUtil.js` and update the `siteUrl` variable to match the `site_url` in SugarCRM's `config.php`.

##### Launch Simple Data Pipe

Running Simple Data Pipe should now detect and make use of the SugarCRM connector.


### Resources

* [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/)
* [Simple Data Pipe GitHub repo](https://github.com/ibm-cds-labs/pipes)  
* [Instructions for setting up a local dev environment for Simple Data Pipe](https://github.com/ibm-cds-labs/pipes/wiki/Instructions-for-setting-up-a-local-dev-environment-for-Simple-Data-Pipe)
* [Creating Your Own Simple Data Pipe Connector](https://developer.ibm.com/clouddataservices/create-your-own-cloud-etl-connector-easy/)
* [pipes-sdk](https://github.com/ibm-cds-labs/pipes-sdk) 
