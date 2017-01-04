# sample-article-angular
This sample web application illustrates how to call IBM Watson Content Hub APIs from client JavaScript. The application uses Angular, jQuery and Bootstrap to display an online application with navigation and cards with images from Watson Content Hub.

This sample shows:
* Authenticating to the Watson Content Hub and calling APIs that require authentication.
* Using the taxonomies and categories APIs to retrieve the site's navigation.
* Using the powerful search API to retrieve a list of content items for a specific content type.
* Accessing content item elements for use in rendering.
* Using an Image Profile with separate renditions for thumbnail and full sized views.
* Dynamically building HTML for navigation, cards and details using Angular, jQuery and Bootstrap.
* Navigate between different list and details views using Angular routing

### About the Watson Content Hub authoring APIs

The initial set of APIs provided by Watson Content Hub are for authoring services, which require authentication and are not optimized for retrieval by applications in production. Follow-on releases will provide "delivery" services which can be accessed anonymously and are optimized for caching and performance. However, the two APIs will be very similar, so to switch from authoring to delivery services you will just need to change the "authoring" portion of the service URL to "delivery". 

### About authentication and tenant handling

To call authenticated APIs, you need to first call the login service with the desired user name and password. This will return tenant information and an authentication token cookie for use on subsequent calls. The browser will include the authentication token cookie in subsequent requests. 

The login call will return both a tenant ID and a tenant base URL in the response header. The tenant ID needs to be part of the URL for subsequent API calls. For example, the search service will have a URL like this:

https://my.digitalexperience.ibm.com/api/[tenantID]/authoring/v1/search

Typically you will use the base URL from the x-ibm-dx-tenant-base-url header to construct the service URL with the tenant ID. This is what's done in the sample code. An alternative approach is to obtain the tenant ID from the Watson Content Hub user interface. Click on the "i" information icon at the top left next to where it says "IBM Watson Content Hub" and you will see your tenant ID.

Once you have the authentication token and have built the complete API link that includes the tenant ID, you can call any of the authenticated APIs by appending the specific API route for the service you want. This example calls the search service by appending "/authoring/v1/search" to the base URL, and the categories service via "/authoring/v1/categories".

Note that every API service operation has specific user roles that it can be used with. In the API Explorer (see link below under [resources](#user-content-resources)) you can see the user roles for all operations.

### Running the sample

#### 1. Download the files

Download the application files (html, js, and css) from the "public" folder into any folder on your workstation.

#### 2. Update the user credentials

This sample uses a hard-coded user name and password set in the app.js file. Update the name and password values in that file.

To avoid putting credentials in the source you could change the application to provide browser inputs for username and password. Also, as noted above, future Watson Content Hub releases will have support for "delivery" APIs that can be available without login.

#### 3. Create all the resources needed to render the sample

This application uses an "Article" content type and one or more content items of that type. Each content item will be assigned a category and the associated image will have default and thumbnail renditions.

The sample content can be downloaded [here](https://github.com/ibm-wch/sample-article-content), and pushed into your content hub using the following command in the [developer tools](https://github.com/ibm-wch/wchtools-cli):
```
wchtools push -taicCrv
```
This will upload the sample types, assets, image profiles, content, categories and renditions.

If you wish to create these resources by hand, see this [appendix](#appendix).

#### 4. Enable CORS support for your tenant

Since this sample will run from a different domain than Watson Content Hub services, you will need to enable CORS (Cross-Origin Resource Sharing) for your tenant. You should only add domains that require access to the content and assets stored in your content hub, such as your web servers or your development environment. The domain format must be `protocol://server:port` where the protocol is either http or https, the server is either your server name or its IP address, and the port is the port number of your server. For example: `http://my.domain.org:80`. You can also use the `*` wildcard to enable CORS for any domain, though this isn't recommended from a security perspective. To control the CORS enablement for Watson Content Hub, go to Hub set up -> General settings -> Security tab. After adding your domain, be sure to click the Save button at the top right of the screen.

#### 5. Load index.html in a browser

You can do this right from the file system in Firefox, Chrome, or Safari browsers. Alternatively you can make the files available on any web server and open index.html in a browser using your web server URL.

If all goes well you should see an application looking something like this (depending on what you entered for text and on the images you selected):

![sample screenshot](/docs/article-sample-screenshot.jpg?raw=true "Sample screenshot")

### Resources

API Explorer reference documentation: https://developer.ibm.com/api/view/id-618

Watson Content Hub developer center: https://developer.ibm.com/wch/

Watson Content Hub forum: https://developer.ibm.com/answers/smartspace/wch/

### Appendix
How to create content for this sample by hand:

* Create an "Article" taxonomy with different categories: In the WCH user interface, under Content Model -> Taxonomies, create a taxonomy named "Article" by clicking the "Create taxonomy" button. Add a few categories (eg: "Travel", "Lifestyle", "Fashion", "Tech", etc) by clicking the "Add parent category" button. Each category will be used as a link in the application's navgation.

* Create an "Article" Image profile with a "thumbnail" rendition: In the WCH user interface, under Content Model -> Image profiles, create an image profile named "Article" by clicking the "Create image profile" button. Create a rendition with:
	* Label: thumbnail
	* Key: thumbnail (this should fill in automatically)
	* Width: 800
	* Height: 500
Click the Add rendition button to complete the image profile. The thumbnail rendition will be used when rendering the site's card view.

* Create an "Article" content type: In the WCH user interface, under Content Model -> Content types, create a content type named "Article" with the following elements. To set the "custom display" values, click on the little gear icon for the element.

|Element name | Element type | Element custom display settings |
| --- | --- | --- |
|Title | Text | (none) |
| Summary | Text | (none) |
| Author | Text | (none) |
| Body | Text | Multi line, Field width: 100, Field height: 10 |
| Image | Image | Image profiles: Article |
| Publish Date | Date (Field type "Single date") | (none) |
| Category | Category | Select category: Article |

* Create some sample content items using the Article content type: Go to Content -> My content and assets, and click the "Compose" link and select the "Article" content type. Fill in all the fields. Repeat to add various items to the different categories (to fill out the navigation).
