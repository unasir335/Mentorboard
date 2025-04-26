# Running MentorBoard web application

## Steps to run server and separate but persistent clients (based on PORT)

Please follow the steps in order:

In the project directory, you can run:
### `npm install`

Installs all dependencies from package.json - make sure you are cd into root of application (mentorboard)

### `npm run server`

Runs the server.
On [http://localhost:8080](http://localhost:8080).


### `npm start` (Please do this on a separate terminal instance)

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.


### `PORT=3001 npm start` (Please do this on a separate terminal instance)

Run the client on a different port for persistent users and chat correspondence in real time
Port number can be specified by user, cannot be 3000 as that is default PORT
