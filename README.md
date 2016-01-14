# pipes.connector.sugarcrm

##### [Simple Data Pipe](https://developer.ibm.com/clouddataservices/simple-data-pipe/) connector for SugarCRM

This repository contains the SugarCRM Simple Data Pipe connector and is the connector used for the connector tutorials:

* [Creating Your Own Simple Data Pipe Connector (using the high level API)](https://github.com/ibm-cds-labs/pipes-sdk/wiki/Creating-Your-Own-Simple-Data-Pipe-Connector-%28using-the-high-level-API%29)
* [Creating Custom Simple Data Pipe Pages](https://github.com/ibm-cds-labs/pipes-sdk/wiki/Creating-Custom-Simple-Data-Pipe-Pages)

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

	###### SugarCRM OAuth Keys page:
	![SugarCRM OAuth Keys page] (https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/blob/master/resources/sugarcrmoauthkeys.png)  
	
5. Click __Save__


### Using the SugarCRM Connector 

* [Install the Connector](https://github.com/ibm-cds-labs/pipes/wiki/Installing-a-Simple-Data-Pipe-Connector) into Simple Data Pipe
* Select __SugarCRM__ for the __Type__ when creating a new pipe  

	###### Create A New Pipe dialog:
	![Create A New Pipe dialog] (https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/blob/master/resources/pipescreatenewpipe.png)  
	
* In the Connect page, enter the OAuth __Consumer Key__ and __Consumer Secret__
* In the Connect page, enter the __Site url__ taken from the `site_url` in SugarCRM's `config.php`.  

	###### Pipes Connect page:
	![Pipes Connect page] (https://github.com/ibm-cds-labs/pipes.connector.sugarcrm/blob/master/resources/pipesconnectpage.png)  
	


### Resources

* [SugarCRM 6.x API Versioning] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/04_Versioning/)
* [SugarCRM 6.x OAuth] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Authentication/Oauth/)
* [SugarCRM 6.x REST] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/01_REST/)
* [SugarCRM v4 REST API] (http://support.sugarcrm.com/02_Documentation/04_Sugar_Developer/Sugar_Developer_Guide_6.5/02_Application_Framework/Web_Services/05_Method_Calls/)
