# Project Name

## Description

Se trata de una aplicación en la que puedes publicar cartas cortas a quien quieras de manera anónima. También pueden crear continuaciones para sus cartas, convirtiéndose en pequeñas historias de varios capítulos. Los otros usuarios pueden ver esas cartas y comentarlas.
 
## User Stories

- **404** - As a user I want to see a 404 page when I go to a page that doesn’t exist so that I know it was my fault 
- **500** - As a user I want to see a error page when there is a server problem so that I can know it's not my fault.
- **Homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
- **Sign up** - As a user I want to sign up on the webpage so that I can create a new account and access to the content application
- **Login** - As a user I want to be able to log in on the webpage so that I can access to the content application
- **Logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account
- **Letters list** - As a user I want to see all the letters published so that I can decide which one I want to read
- **Letter view** -  As a user I want to see an individual letter so that I can read it and comment it
- **Letter create** -  As a user I want to create a letter so that I can express what I'm feeling
- **Letter edit** - As a user I want to edit my letters so that I can correct it if I made some mistake
- **Letter delete** - As a user I want to delete my letters so that I can prevent to have any problem
- **Account edit** - As a user I want to edit my account so that I can change my information whenever I want.


## Backlog

- Dos campos para la contraseña para confirmar que el usuario no se equivoca
- Tener la opción de enviar por correo la carta a quien quieras cuenta la creas.
- Pantalla que confirme si quieres borrar una carta.
- Botones de "edit" y "delete" ocultos y que se despliguen al tocar al lado de una carta.
- Clasificar las cartas entre recientes, populares...
- Nuevo tipo de carta en la que escribes una versión que es verdad y otra mentira y así no se puede saber qué versión es qué.

## ROUTES:

- GET /
  - muestra la "homepage"
- GET /auth/signup
  - redirige al usuario a /letters si ya ha iniciado sesión
  - muestra el formulario de sign up
- POST /auth/signup
  - redirige al usuario a /letters si ya ha iniciado sesión
  - body: 
    - username
    - email
    - password
  - validation: 
    - fields not empty
    - user not exist
  - crea la password encriptada del usuario
  - guarda la sessión del usuario
  - redirige a /letters
- GET /auth/login
  - redirige al usuario a /letters si ya ha iniciado sesión
  - muestra el formulario de log in
- POST /auth/login
  - redirige al usuario a /letters si ya ha iniciado sesión
  - body: 
    - username o email
    - password
  - validation: 
    - fields not empty
    - user/email and password are correct
  - guarda la sessión del usuario
  - redirige a /letters
- POST /auth/logout
  - body: (empty)
  - redirect to /
- GET /letters
  - muestra la lista de cartas
- GET /letters/id
  - muestra una carta y los comentarios que tiene
- GET /letters/create 
  - muestra el formulario para crear una carta 
- POST /letters/create 
  - redirige a /letters si el usuario no ha iniciado sesión
  - body: 
    - receiver
    - text
    - email
  - validation
    - fields not empty
  - crea una carta
  - redirige a /letters/id
- GET /letters/id/edit
  - muestra el formulario para editar la carta
- POST /letters/id/edit
  - redirige a /letters/id si la carta no pertenece al usuario
  - body: 
    - text
  - validation
    - field not empty
  - edita una carta
  - redirige a /letters/id
- POST /letters/id/delete
  - redirige a /letters/id si la carta no pertenece al usuario
  - body: (empty)
  - borra una carta
  - redirige a /letters
- GET /letters/userid
  - muestra las cartas que pertenecen a ese usuario
- GET /account
  - muestra el formulario para modificar los datos de la cuenta
- POST /account
    - redirige a /letters/id si la carta no pertenece al usuario
  - body: 
    - username
    - email
    - password
  - validation
    - username not exists
    - fields not empty
  - edita un usuario
  - redirige a /account



## Models

User model
 
```
username: String
email: String
password: String
```

Letter model

```
owner: ObjectId<User>
receiver: String
text: String
next: ObjectId<User>
``` 

Comment model

```
owner: ObjectId<User>
text: String
letter: ObjectId<User>
``` 

## Links

### Trello

[Link to your trello board](https://trello.com) or picture of your physical board

### Git

The url to your repository and to your deployed project

[Repository Link](http://github.com)

[Deploy Link](http://heroku.com)

### Slides

The url to your presentation slides

[Slides Link](http://slides.com)