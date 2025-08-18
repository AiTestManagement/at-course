I want to create a playwright project in typescirpt to test the web application at the url http://the-internet.herokuapp.com/

- The source code for this web site is in the `APP-UNDER-TEST\` directory
- The user guide for playwright typescript is in the `PRPs\pw_docs\` folder
- The user guide for all the playwright typescript apis is in the `PRPs\pw_docs\api\` folder

I do not want to install the application under test locally, just use the application under test code (in the `APP-UNDER-TEST\` directory) to help us structure this playwright project correctly, create good page objects and work out the initial selectors.

I do want to create an inital test suite with a few test cases to cover the "Checkbox" functionality (on the http://the-internet.herokuapp.com/checkboxes page). We ONLY need to create tests for this area of the functionality to start with. 