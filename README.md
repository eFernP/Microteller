# Project Name

## Description

Se trata de una aplicación en la que puedes publicar microhistorias y leer y comentar las microhistorias de los demás usuarios. También puedes añadir continuaciones a tus microhistorias, creando así un hilo con ellas, y participar en retos de microhistorias y votar aquellas que participen en ellos.
 
## User Stories

- **404** - As a user I want to see a 404 page when I go to a page that doesn’t exist so that I know it was my fault 
- **500** - As a user I want to see a error page when there is a server problem so that I can know it's not my fault.
- **Homepage** - As a user I want to be able to access the homepage so that I see what the app is about and login and signup
- **Sign up** - As a user I want to sign up on the webpage so that I can create a new account and access to the content application
- **Login** - As a user I want to be able to log in on the webpage so that I can access to the content application
- **Logout** - As a user I want to be able to log out from the webpage so that I can make sure no one will access my account
- **Stories list** - As a user I want to see all the stories published so that I can decide which one I want to read
- **Story view** -  As a user I want to see an individual story so that I can read it and comment it
- **Story create** -  As a user I want to create a story so that I can share it with other users
- **Story edit** - As a user I want to edit my stories so that I can correct it if I made some mistake
- **Story delete** - As a user I want to delete my stories so that I can prevent to have any problem
- **Account edit** - As a user I want to edit my account so that I can change my information whenever I want.


## Backlog

- Dos campos para la contraseña para confirmar que el usuario no se equivoca
- Tener la opción de enviar por correo la microhistoria a quien quieras cuenta la creas.
- Pantalla que confirme si quieres borrar una microhistoria.
- Botones de "edit" y "delete" ocultos y que se despliguen al tocar al lado de una microhistoria.
- Clasificar las microhistorias entre recientes, populares...
- Nuevo tipo de microhistoria en la que escribes una versión que es verdad y otra mentira y así no se puede saber qué versión es qué.

## ROUTES:

- GET /
  - muestra la "homepage"
- GET /auth/signup
  - redirige al usuario a /stories si ya ha iniciado sesión
  - muestra el formulario de sign up
- POST /auth/signup
  - redirige al usuario a /stories si ya ha iniciado sesión
  - body: 
    - username
    - email
    - password
  - validation: 
    - fields not empty
    - user not exist
  - crea la password encriptada del usuario
  - guarda la sessión del usuario
  - redirige a /stories
- GET /auth/login
  - redirige al usuario a /stories si ya ha iniciado sesión
  - muestra el formulario de log in
- POST /auth/login
  - redirige al usuario a /stories si ya ha iniciado sesión
  - body: 
    - username o email
    - password
  - validation: 
    - fields not empty
    - user/email and password are correct
  - guarda la sessión del usuario
  - redirige a /stories
- POST /auth/logout
  - body: (empty)
  - redirect to /
- GET /stories
  - muestra la lista de microhistorias
- GET /stories/id
  - muestra una microhistoria y los comentarios que tiene
- GET /stories/create 
  - muestra el formulario para crear una microhistoria 
- POST /stories/create 
  - redirige a /stories si el usuario no ha iniciado sesión
  - body: 
    - title
    - text
    - email
  - validation
    - fields not empty
  - crea una microhistoria
  - redirige a /stories/id
- GET /stories/id/edit
  - muestra el formulario para editar la microhistoria
- POST /stories/id/edit
  - redirige a /stories/id si la microhistoria no pertenece al usuario
  - body: 
    - text
  - validation
    - field not empty
  - edita una microhistoria
  - redirige a /stories/id
- POST /stories/id/delete
  - redirige a /stories/id si la microhistoria no pertenece al usuario
  - body: (empty)
  - borra una microhistoria
  - redirige a /stories
- GET /stories/userid
  - muestra las microhistorias que pertenecen a ese usuario
- GET /account
  - muestra el formulario para modificar los datos de la cuenta
- POST /account
    - redirige a /stories/id si la microhistoria no pertenece al usuario
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

Story model

```
owner: ObjectId<User>
title: String
text: String
next: ObjectId<User>
``` 

Comment model

```
owner: ObjectId<User>
text: String
story: ObjectId<User>
``` 

## Links


### Repository

https://github.com/esterFern/Microteller

###Deploy

https://microteller.herokuapp.com/



