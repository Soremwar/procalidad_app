Esta es una app empresarial para realizar planeación y asignación de recursos

Para iniciar el servidor Deno ejecute el siguiente comando
```bash
deno --importmap=libraries.json --allow-read=public/ --allow-net app.js
```

Para compilar la aplicación React necesaria para correr la página
```bash
yarn install
npx parcel watch components/App.jsx --out-dir public/resources --out-file app.js
```