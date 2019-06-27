///// TODO

- req.params sanitize probably?
- sanitize loops and things (search req.body from all files)

- FRONT PAGE {
     News and info?
     Latest projects
     - + signs
 }
- Project status colors
- User status (free/looking for projects?)
- Show users that are free on specified date range
- Show open positions by default
- Make a guide how to write a bio (for example working hours)
- CV
- Ability to discard project suggestions
- Pagination for students and projects lists? maybe this: (https://evdokimovm.github.io/javascript/nodejs/mongodb/pagination/expressjs/ejs/bootstrap/2017/08/20/create-pagination-with-nodejs-mongodb-express-and-ejs-step-by-step-from-scratch.html)
- Manage members page-> change format of application apply date
- Maybe a warning system about unsaved changes when user tries to leave a page: "Do you really want to eat peanuts..."
- If no start date / deadline has been set for a project: change from "invalid date" to something else idk.
- Students should be able to see members of projects they are working on.(now they see nothing)


Other missing requirements:

- Registering with OpenID
- Projects need to show the amount of open positions
- Users can give feedback about the project and rate it
-As a project manager I want to contact the student users via email ->??

///// BUGS

- Suggesting the same project with the same roles to someone makes the roles appear multiple times on same row.
- Edit profile -> I want to learn skill category resets to langa every time editprofile page is opened. No idea when this broke :O
- Users with student privilege can be assigned as project managers. Intentional?
- If you logout and go back to previous page you can see all the visited Project Gate pages as you would still be logged in(atleast on chrome and firefox). security risk asd. 
- One person can be asigned multiple times the same role in a project (or different roles) After this project members list show users name in multiple lines.
- Users with student privilege can access anyones profile (can't edit anything)
- You can suggest projects to yourself as an admin or project manager
- I tried to place a 1.7gb :D  image as a project image -> server crashed with error "cannot read property 'resize' of undefined" -> max size validation?
-  !!!  Projects ordering is broken again  !!!
- On manage members page -> application: clicking on applicant name to open profile opens the current users profile instead of the applicants.
- On profile page while mobile navigation bar is active (in some situations even on desktop nav) navbar icons disappear, but only when bio or project tab is active. While skills tab is active, icons work???

///// MISC

- Application deny emaill??
- Edit only your own information?

///// RETIRED

- Project start date /// DONE
- Project suggestion email /// DONE
- Application accepted email
- POST MANAGE/:ID DOESN'T WORK, SKILLS ARE SUBMITTED AS AN OBJECT
- Firma banner in footer /// DoNe

- fixed datefields when creating a new project: removed extra divs
- Added form validation to settings page -> new passwords must have atleast 6 characters. 
SANITIZE MIDDLEWARE DOESN'T LET THROUGH OBJECTS. Possible fix: Just input as string, str.split(', ') in backend and loop through. Probably should use something
more unique than ',' to split them in .ejs file. 
    - DONE PROBABLY 
    - MODIFIED TO WORK WITH str.split('$gqnY@8l|$4A?pd$')
    - REVERTED BACK TO ORIGINAL WITH

- The "This site doesn't really work with Internet Explorer" message on login page appears on any browser (atleast Chrome and Firefox) if user has disabled JavaScript.
    - Changed the message to also say "enable javascript" because the site doesnt really work without javascript either

    
- Once you have applied to a project you can newer again apply to the same project.
    - now shows applied if you have applied and nothing if you are member

- Star rating system is not working on Firefox??? 
    - Removed some duplicate lines and now appears to be working?