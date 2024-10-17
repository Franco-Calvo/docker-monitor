# Docker Monitor

Docker Monitor es una aplicación web que permite monitorear y controlar tus contenedores Docker de forma sencilla y eficiente.

## Características

- **Monitoreo en tiempo real**: Observa el estado de todos tus contenedores Docker.
- **Control de contenedores**: Inicia y detén contenedores fácilmente desde la interfaz.
- **Visualización de logs**: Accede a los logs de cada contenedor directamente desde el navegador.
- **Información de recursos**: Visualiza el consumo de memoria RAM de cada contenedor y el uso total de memoria del VPS.

## Requisitos

- **Node.js** (versión 14 o superior)
- **Docker**
- **TypeScript** (solo para desarrollo)
- **Git** (para clonar el repositorio)

## Pendientes

- **Mejorar la seguridad de autentificación**
- **Acceso mediante HTTPS y no HTTP**
- **Mejorar el diseño y adaptarlo**

## Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/tu_usuario/docker-monitor.git
   cd docker-monitor

   ```

2. **Instala las dependencias**

   ```bash
   npm install

   ```

3. **Configura las credenciales**

   ```bash
   const auth = { username: 'user', password: 'password' };
   ```

4. **Compila e inicializa**

   ```bash
    npm run build && npm start
   ```

5. **Accede a la app mediante el navegador**
   http://<IP/DOMINIODELVPS>:4200
