# Application Organizer

This is a website created using Next.js that allows users to keep track of their applications.
Users sign in using their Google accounts, and can add/edit/delete their applications.

Applications are saved in a MongoDB database for each user. Users give the title, url, and status of the application, and can update them whenever they recieve news. 
To prevent duplicate applications from being submitted, it checks if the url given is already in the database, and if it is, it tells the user that this is a duplicate.

# Website: https://app-track.vercel.app