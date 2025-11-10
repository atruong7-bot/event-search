HOMEWORK ASSIGNMENT 3
CSCI 571 – Fall 2025

Abstract
Ajax, JSON, Frontend Frameworks, CSS Frameworks, Node.js, and Ticketmaster API

This content is protected and may not be shared, uploaded, or distributed.

Prof. Marco Papa
papa@usc.edu

Assignment 3: Ajax, JSON, Frontend Frameworks, CSS Frameworks, Node.js, and Ticketmaster API

1. Objectives
1. Get experience with creating backend applications using JavaScript/Node.js on the server side with Fastify/Express/Hono/Elysia framework.
2. Get experience with using Frontend and CSS Frameworks on the client side and creating responsive front-end.
3. Get experience with Ticketmaster APIs, Spotify APIs, Google Maps APIs, Google Geocoding APIs, IPinfo APIs, Facebook share APIs, and Twitter share APIs.
4. Get experience with Google Cloud Platform.

2. Homework Description Resources
1. Homework Description Document (This document)
2. Rubric (aka Grading Guidelines)
3. Web Reference Video
4. Mobile Reference Video
5. Piazza

3. General Directions
1. The backend of this Assignment must be implemented in JavaScript using Node.js Express framework (or Fastify/hono.js/ElysiaJS – however limited TA/CP support will be available). Refer to Node.js website for installing Node.js and learning how to use it. Have a look at "Getting started" guides in Express website to learn how to create backend applications using Express. Node `fetch()` can be useful to make requests from your Node.js backend to Ticketmaster servers. Implementing the backend in anything other than Node.js will result in a 4-point deduction.

2. The frontend of this Assignment must be implemented using the Angular, React, or Vue.js frameworks.
   a. Refer to Angular setup docs for installing Angular and creating Angular projects. Angular "Tour of Heroes" app tutorial is a very good tutorial to see different Angular concepts in action. Implementing the frontend in anything other than Angular, React or Vue.js will result in a 4-point deduction.

3. You are expected to create a responsive website. For that reason, we recommend you to use Shadcn + Tailwind CSS.

4. The backend of this Assignment must be deployed on Google Cloud. The backend should serve the frontend as well as other endpoints you may define. Please refer to the instructions on D2L Brightspace for deploying Node.js applications to any of the cloud services.

5. You must refer to the Assignment description document (this document), rubric, the reference videos and instructions in Piazza while developing this Assignment. All discussions and clarifications in Piazza related to this Assignment are part of the Assignment description and grading guidelines. Therefore, please review all Piazza threads before submitting the assignment. If there is a conflict between Piazza and this description and/or the grading guidelines, answers and clarifications in Piazza supersede the other documents.

6. The Assignment will be graded using the latest version of the Google Chrome browser. Developing the Assignment using the latest version of Google Chrome is advised.

4. System Overview
The system contains three components: 1) browser (frontend), 2) Node.js application (backend) and 3) external services/APIs (Ticketmaster, Google Geocoding, Ipify.info). You will have to implement both the frontend and the backend. Your backend will include two major functionalities: serving the frontend static files to the browser and responding to the frontend's AJAX requests by fetching data from Ticketmaster servers. You will not directly call the Ticketmaster APIs from the frontend as it requires disclosing a secret API key to the public. You will call ipinfo.io and Google Geocoding API directly from your frontend: calling ipinfo.io directly allows the service to capture user's IP address, not your backends' one; Google Geocoding API support direct calling and has an option to scope key usage to a specific website.

NOTE: Setup authorization is required to call Ticketmaster API endpoints and is using request headers with the API key for the app. You can re-use the API Key obtained and used in Assignment 2.

Please do not directly call the Ticketmaster API endpoints from your frontend. Calls to other APIs can be made from the frontend.

All read requests from the frontend to the backend must be implemented using the HTTP GET method, as you will not be able to send us sample backend endpoint links as a part of your submission, if you use HTTP POST. You are encouraged to use other HTTP verbs for working with favorites (adding, removing, etc).

5. Description
In this exercise, you are asked to create a web application that allows you to search for event information using the Ticketmaster API, and the results will be displayed in a card in tabular format. The application will also allow users to mark events as "Favorites" and see the list of all events marked as favorites. Also, users can share a post on Facebook and a tweet on Twitter about the events.

All implementation details and requirements will be explained in the following sections.

There are 3 front-end routes/pages for this application:
a) Search Route ['/search'] – It is the default route of this application which is used to search for events
b) Event detail route ['/event/<id>'] – This route will show information about the corresponding event
c) Favorites Route ['/favorites'] – It displays the list of favorite events

Exact route paths are only given as examples, feel free to change/nest them.
Hint: use a routing library for your framework.

5.1 Navbar component
The Navigation bar must be present on top of all the routes of the application. It consists of the "Events Around" title and the following menu options:
1. Search
2. Favorites

5.2 Search Route
The Search route consists of two main sections:
● Search Form
● Results grid view

5.2.1 Search Form
The form has 5 fields: Keywords, Category, Distance (miles), Location, and a checkbox to auto-detect location. You should use the ipinfo.io API (as you did in Assignment 2) to fetch the user's geolocation, if the location checkbox is checked. Otherwise, the user must enter an address location to search.

Location field is a text field. It is disabled and cleared when the "Auto-detect Location" is enabled.
Distance field is a numeric input with "miles" text appended to the right side of the input.
Keywords field should be implemented as a dropdown select with search and suggest functionality.

Category field should be implemented as a dropdown.
These are the categories to include in the dropdown:
● All
● Music
● Sports
● Arts & Theatre
● Film
● Miscellaneous

5.2.1.1 Autocomplete data source
The Keyword Input field allows the user to enter a keyword to retrieve results. Based on the user input, the text box should display a list of all the suggestions fetched using a Ticketmaster suggest API.

This is the API endpoint for autocomplete from the Ticketmaster suggest API:
GET https://app.ticketmaster.com/discovery/v2/suggest

Please refer to this documentation for the Ticketmaster Suggest API:
https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/suggest

This is a sample API call:
https://app.ticketmaster.com/discovery/v2/suggest?apikey=YOUR_API_KEY&keyword=[KEYWORD]

5.2.1.2 Location Field
If the "Auto-detect your location" checkbox is checked, then the location field should reset the Location textbox to blank and disable the field. When the Auto-detect checkbox is not checked, the user needs to enter the location address. Use the Google Maps Geocoding API to get latitude and longitude of the location that the user entered and pass that latitude/longitude values in the Ticketmaster's event search API.

The Google Maps Geocoding API is documented here:
https://developers.google.com/maps/documentation/geocoding/start

The Google Maps Geocoding API expects two parameters:
1. address: The location that you want to geocode, in the format used by the national postal service of the country concerned.
2. key: Your Google application's API key.

An example of an HTTP request to the Google Maps Geocoding API:
https://maps.googleapis.com/maps/api/geocode/json?address=University+of+Southern+California+CA&key=YOUR_API_KEY

5.2.1.3 Search button
Clicking the Search Events button performs a search using the given event keyword, the distance filter from the given location and the category of events. Once the user has provided valid input, your frontend should send a request to your backend NodeJS server with the form inputs. You must use GET to transfer the form data to your web server (do not use POST). The backend code will act as a proxy - extract the form inputs and make an HTTP call, using the inputs to invoke the Ticketmaster API event information service.

If the user clicks on the SUBMIT button without providing a value in the "Keyword", "Category" or "Location" fields or checking the location checkbox, you should show an error state.

Do not call the Ticketmaster API directly from the front-end, this will lead to a 4-point penalty.

5.2.2 Results grid view
The response received from the backend after clicking the SUBMIT button will be parsed and displayed in a grid of cards. The event card consists of 5 columns, and a button:
1) Category
2) Date/Time
3) Cover image
4) Event name
5) Venue name
6) "Like" button

The results table must display a maximum of 20 search results (1st page of Ticketmaster response). Each card is clickable and navigates user to the Details page.

If results are not found, display "No results available".

The API endpoint for search is:
GET https://app.ticketmaster.com/discovery/v2/events

Refer to the search documentation at:
https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#search-events-v2

Card information API mapping:
- Name: The value of "name" attribute directly on "event" item of the result list
- Date: The value of the "localDate" and "localTime" attributes of "start" object
- Cover image: The value of the first image in "images" list of the "events" object
- Event: The value of the "name" attribute that is part of the "events" object
- Genre: The "name" value of the first "segment" attribute under "classifications" list
- Venue: The value of the "name" attribute that is part of the first embedded "venue"

5.3 Details Page
The Details page consists of Back button, Event name, Buy Tickets, Favorite button and three tabs:
1) Info
2) Artists/Teams
3) Venue

Use shadcn tabs to implement tabs. The Event Details API is documented at:
https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#anchor_get

To retrieve event details, the request needs two parameters:
● id: ID of the event
● apikey: Your application's API key

Top part should contain:
• "Back to search" link – should return to the search
• Event name
• Buy Tickets – "Ticketmaster" link that opens in a new page
• Favorite button

5.3.1 "Info" tab
The Events details tab shows:
● Date – displays "localDate" and "localTime"
● Artists/Team – displays artists/team "name" segmented by a comma
● Venue – displays "venue name"
● Genres – displays genre in order of "segment", "genre", "subGenre", "type", "subType"
● Ticket Status – color coded:
  o On sale: Green
  o Off sale: Red
  o Canceled: Black
  o Postponed: Orange
  o Rescheduled: Orange
● Seat Map – displays an image of the seat map
● Facebook icon – On clicking, create a post in a new tab
● Twitter icon – On clicking, create a tweet in a new tab

Back button:
Clicking on the Back to search button navigates back to the search results. All previously filled values, results and scroll position should be preserved.

Favorite icon:
On clicking the Favorite icon, display 'Event Added to Favorites!' alert and change heart icon to red. Once marked as favorite, it should display red heart icon until removed from favorites.

5.3.2 "Artists/Team" tab
The Artists/Team tab shows artist information from Spotify API (only for Music events):
- Name
- Followers (formatted as xxx,xxx,xxx)
- Popularity (0-100%)
- Spotify Link
- Albums

For non-music events, this tab should be disabled.

The Spotify API is documented at:
https://developer.spotify.com/documentation/web-api/

We recommend using the official client:
https://github.com/spotify/spotify-web-api-ts-sdk

Use the 'search' function with "type" argument being "artist".

5.3.3 Venue tab
The Venue tab displays:
- Name
- Address (concatenation of line1, city, state)
- "See Events" button (opens TicketMaster website)
- Cover image
- Parking info
- General Rule
- Child rule

Clicking the address link opens Google Maps with location marker.

5.4 Favorites

5.4.1 Favorite button
The Favorite button has two states:
- Not favorite: transparent heart icon with black stroke
- Favorite: red filled heart icon

State should be retained after page reload.

5.4.2 Favorite notification (toast/sonner)
Three notifications:
1) "… added to favorites!"
2) "… removed from favorites!" (with undo button)
3) "… re-added to favorites!" (when undo pressed)

Use sonner library for stack view, animations, auto-remove after timeout.

5.4.3 Favorite page
Displays events marked as "Favorites" from MongoDB Atlas database. Events sorted by order added. If no favorites, display 'No favorite events yet'.

5.5 Database
Use MongoDB Atlas (NoSQL database) for storing favorites.

MongoDB Atlas documentation: https://www.mongodb.com/docs/
MongoDB on Google Cloud: https://www.mongodb.com/mongodb-on-google-cloud

Setup steps:
1. Create MongoDB Atlas account
2. Create project
3. Create deployment with cluster
4. Set up Database Access and Network Access
5. Create database and collection
6. Connect using MongoDB Node driver

DO NOT RECOMMEND HAVING 0.0.0.0/0 in Network Access - use specific IPs.

6. Responsive Design
The webpage must be responsive. Test using Google Chrome Responsive Design Mode.

7. API Documentation

7.1 Spotify API
Register Spotify Account, create application, get client id and client secret.
https://developer.spotify.com/dashboard/
Use: https://github.com/spotify/spotify-web-api-ts-sdk

8. Libraries
● Node-geohash - https://github.com/sunng87/node-geohash
● Angular Google Maps - https://angular-maps.com/ (if using Angular)
● Shadcn components: badge, button, card, form, input, label, select, sonner, switch, tabs
● Shadcn style: new-york
● Icon library: lucide

9. Implementation Hints

9.1 Images
Only static image is the favicon.

9.2 Icons
Use lucide icons: Heart, FacebookIcon, TwitterIcon, Search, ExternalLink, ChevronUp/ChevronDown, X, Loader2, Check, Menu, Arrow Left.

9.3 Shadcn Components
Use: badge, button, card, form, input, label, select, sonner, switch, tabs

9.4 Google App Engine
Deploy on Google Cloud (App Engine or Cloud Run).
Example URLs:
- App Engine: https://example.appspot.com/searchEvents?keyword=xxx
- Cloud Run: https://<serviceName>-<projectHash>-<region>.run.app/searchEvents?keyword=xxx

9.5 AJAX call
Use GET method for backend requests.

9.6 CORS issues
Serve API endpoints under same hostname with /api/... prefix.

9.7 Debugging
For local development, use proxy configuration (vite server.proxy for React/Vue, Angular proxy config).

10. Assignment Submission
Update Assignment 3 link on GitHub Pages to deployed website.
Provide additional link to cloud query entry point.
Submit source code as ZIP to D2L Brightspace (exclude node_modules, include package.json).

11. Notes
● Can use React or Vue.js instead of Angular (same appearance required)
● Can use Bootstrap or other responsive frameworks
● Can use Fastify, Hono or Elysia instead of Express
● Appearance should match reference videos/screenshots

12. Additional References
**IMPORTANT**:
● Review all Piazza threads before submission
● Do not call Ticketmaster APIs directly from JavaScript (4-point penalty)
● Google Maps Geocoding API can be called directly from JavaScript
● Card view appearance should match reference video