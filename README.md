# sample-article-angular
This sample web application illustrates how to call Acoustic Content (formerly Watson Content Hub) APIs from client JavaScript. The application uses Angular, jQuery and Bootstrap to display an online application with navigation and cards with images from Acoustic Content.

This sample shows:
* Using the taxonomies and categories APIs to retrieve the site's navigation.
* Using the powerful search API to retrieve a list of content items for a specific content type.
* Accessing content item elements for use in rendering.
* Using an Image Profile with separate renditions for thumbnail and full sized views.
* Dynamically building HTML for navigation, cards and details using Angular, jQuery and Bootstrap.
* Navigate between different list and details views using Angular routing

### Running the sample

#### 1. Download the files

Download the application files (html, js, and css) from the "public" folder into any folder on your workstation.

#### 2. Update the baseTenantAPIURL

The baseTenantAPIURL variable in public/app.js must also be set for your tenant. In the IBM Watson Content Hub user interface, open the "Hub information" dialog from the "About" flyout menu off the left navigation pane. The pop-up window shows your API URL, host and content hub ID for your Watson Content Hub tenant. Use this information to update the value of the baseTenantAPIURL variable in public/app.js, in the form https://{host}/api/{content hub tenant id}.  For example it might look something like this:

const baseTenantAPIURL = "https://my12.digitalexperience.ibm.com/api/12345678-9abc-def0-1234-56789abcdef0";

#### 3. Create all the resources needed to render the sample

This application uses an "Article" content type and one or more content items of that type. Each content item will be assigned a category and the associated image will have default and thumbnail renditions.

Follow the instructions at the [sample-article-content](https://github.com/ibm-wch/sample-article-content) repository, to download and push the sample "Article" type, assets, image profiles, content, categories and renditions, along with sample article content, for your tenant.

If you wish to create these resources by hand, see the associated [Manual Creation of COntent Types and Content](https://github.com/ibm-wch/sample-article-content/wiki/Manual-Creation-of-Content-Types-and-Content) wiki page in the sample-article-content repository.

#### 4. Enable CORS support for your tenant

Since this sample will run from a different domain than Watson Content Hub services, you will need to enable CORS (Cross-Origin Resource Sharing) for your tenant. You should only add domains that require access to the content and assets stored in your content hub, such as your web servers or your development environment. The domain format must be `protocol://server:port` where the protocol is either http or https, the server is either your server name or its IP address, and the port is the port number of your server. For example: `http://my.domain.org:80`. You can also use the `*` wildcard to enable CORS for any domain, though this isn't recommended from a security perspective. To control the CORS enablement for Watson Content Hub, go to Hub set up -> General settings -> Security tab. After adding your domain, be sure to click the Save button at the top right of the screen.

#### 5. Load index.html in a browser

You can do this right from the file system in Firefox, Chrome, or Safari browsers. Alternatively you can make the files available on any web server and open index.html in a browser using your web server URL.

If all goes well you should see an application looking something like this (depending on what you entered for text and on the images you selected):

![sample screenshot](/docs/article-sample-screenshot.jpg?raw=true "Sample screenshot")

## Resources

Acoustic Content developer documentation: https://developer.goacoustic.com/acoustic-content/docs

Acoustic Content API reference documentation: https://developer.goacoustic.com/acoustic-content/reference

Acoustic Content Samples Gallery: https://content-samples.goacoustic.com/
