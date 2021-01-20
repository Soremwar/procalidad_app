Esta es una app empresarial para realizar planeación y asignación de recursos

Para iniciar el servidor Deno ejecute el siguiente comando

```bash
deno run --unstable --import-map=libraries.json --allow-read=./ --allow-write=storage --allow-net app.ts
```

Para compilar la aplicación React necesaria para correr la página

```bash
yarn install
yarn compile
```

Para formatear el código de la aplicación

```bash
deno fmt api components config lib web
```

### Requerimientos

- Deno versión 1.6.3

### Notas:

Asegurese de permitir el acceso de Deno a la red como servicio

#### En un servidor Linux:

`setcap cap_net_bind_service=ep /ruta/a/deno`

### Procedimientos de sistema

Los procedimientos adjuntos al sistema se encuentran dentro de la carpeta
scripts
