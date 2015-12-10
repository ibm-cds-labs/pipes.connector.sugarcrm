# pipes.connector.sugarcrm

##### [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/) connector for SugarCRM

This repository contains multiple branches which represent different versions of the SugarCRM Simple Data Pipe connector, each of which corresponds with a different version of the Simple Data Pipe connector API:

* [connector-initial](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/tree/connector-initial) branch - uses the initial connector API (i.e., does not use the pipes-sdk)
* [connector-pipes-sdk](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/tree/connector-pipes-sdk) branch - uses the pipes-sdk connector API
* [connector-pipes-sdk-custom-page](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/tree/connector-pipes-sdk-custom-page) branch - uses the pipes-sdk and includes a customized page

In addition, tutorials are available for each of these branches (i.e., connector versions):

* [Creating Your Own Simple Data Pipe Connector (using the initial connector API)](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/wiki/Creating-Your-Own-Simple-Data-Pipe-Connector-%28using-the-initial-connector-API%29)
* [Creating Your Own Simple Data Pipe Connector (using the pipes-sdk connector API)](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/wiki/Creating-Your-Own-Simple-Data-Pipe-Connector-%28using-the-pipes-sdk-connector-API%29)
* [Creating Custom Simple Data Pipe Pages](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/wiki/Creating-Custom-Simple-Data-Pipe-Pages)

The [master](https://github.com/ibm-cds-labs/pipes.connector.sugarcrm) branch contains the latest version of the SugarCRM connector using the [pipes-sdk](https://github.com/ibm-cds-labs/pipes-sdk). It should be used with latest version of the Simple Data Pipe implementing the pipes-sdk.

The connector is applicable against SugarCRM servers which support [SugarCRM REST API v4](http://support.sugarcrm.com/Documentation/Sugar_Developer/Sugar_Developer_Guide_7.6/API/Web_Services/API_Versioning/) and OAuth 1.0 (i.e., SugarCRM 6.2.x or greater).


### Prerequisites

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

* [SugarCRM 6.x API Versioning] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/04_Versioning/)
* [SugarCRM 6.x OAuth] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Authentication/Oauth/)
* [SugarCRM 6.x REST] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/01_REST/)
* [SugarCRM v4 REST API] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/05_Method_Calls/)
