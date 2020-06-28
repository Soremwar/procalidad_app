Esta es una app empresarial para realizar planeación y asignación de recursos

Para iniciar el servidor Deno ejecute el siguiente comando
```bash
deno run --unstable --importmap=libraries.json --allow-read=. --allow-net app.js
```

Para compilar la aplicación React necesaria para correr la página
```bash
yarn install
yarn compile
```

### Notas:
Asegurese de permitir el acceso de Deno a la red como servicio

#### En un servidor Linux:
`setcap cap_net_bind_service=ep /ruta/a/deno`