# Backend

## JWT 

Para generar firma JWT, correr en node:
`require('crypto').randomBytes(32).toString('hex')`

Luego en el archivo .env asignar la firma a la variable JWT_SECRET.

## Diagrama E/R

![diagrama entidad relación](https://github.com/IIC2513-2021-1/grupo-billturnerssailors-p2-backend/blob/main/entity_relationship.png?raw=true)

## API Documentation

Se encuentra en este [link](https://documenter.getpostman.com/view/13049545/TzeTKq3t).

## Heroku

Nuestra API está montada en este [link](https://bts-proyecto2backend.herokuapp.com/)


## Seeds
Para correr las seeds, recuerden que la base de datos tiene que estar limpia, por lo tanto, antes de correr las seed realizar lo siguiente:
```
yarn sequelize db:migrate:undo:all
yarn sequelize db:migrate 
```
Y luego correr las seeds:
`yarn sequelize db:seed:all`

## Testing
Para correr los test ejecutar el comando ```yarn test``` con el flag `-u` para
actualizar los snapshots. Por ejemplo:
```
yarn test -silent -verbose -u
```
