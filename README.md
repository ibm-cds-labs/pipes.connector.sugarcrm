# pipes.connector.sugarcrm

##### [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/) connector for SugarCRM

This connector uses the [pipes-sdk](https://github.com/ibm-cds-labs/pipes-sdk) connector API and makes use of a custom Connect page.

It is also the connector used as the guide in the [Creating Your Own Simple Data Pipe Connector](https://developer.ibm.com/clouddataservices/create-your-own-cloud-etl-connector-easy/) tutorial and the [Creating A Custom Page for Your Connector]() tutorial.


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

From within the Simple Data Pipe directory run `npm install [connectorPath]` where __[connectorPath]__ is the path to the _sugarcrm6x_ directory in the SugarCRM connector.

##### Launch Simple Data Pipe

Running Simple Data Pipe should now detect and make use of the SugarCRM connector.

##### Custom Connect Page

When creating a connector, the custom Connect page contains a __Site url__ field should be set to the `site_url` from SugarCRM's `config.php`.


### Resources

* [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/)
* [Simple Data Pipe GitHub repo](https://github.com/ibm-cds-labs/pipes)  
* [Instructions for setting up a local dev environment for Simple Data Pipe](https://github.com/ibm-cds-labs/pipes/wiki/Instructions-for-setting-up-a-local-dev-environment-for-Simple-Data-Pipe)
* [Creating Your Own Simple Data Pipe Connector](https://developer.ibm.com/clouddataservices/create-your-own-cloud-etl-connector-easy/)
* [pipes-sdk](https://github.com/ibm-cds-labs/pipes-sdk) 
