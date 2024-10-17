import Docker from 'dockerode';
import { Request, Response, Router } from 'express';
import stripAnsi from 'strip-ansi';
import si from 'systeminformation';
import { getContainerInfo } from '../utils/docker.js';

const router = Router();
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

router.get('/status', async (req: Request, res: Response) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const containerStatuses = await Promise.all(
      containers.map(async (container) => {
        const info = await getContainerInfo(container);
        return info;
      })
    );

    const memData = await si.mem();
    const totalMem = memData.total;
    const freeMem = memData.available;

    res.json({ containers: containerStatuses, totalMem, freeMem });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el estado de los contenedores' });
  }
});

router.post('/start/:id', async (req: Request, res: Response) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.start();
    res.json({ message: 'Contenedor iniciado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al iniciar el contenedor' });
  }
});

router.post('/stop/:id', async (req: Request, res: Response) => {
  try {
    const container = docker.getContainer(req.params.id);
    await container.stop();
    res.json({ message: 'Contenedor detenido' });
  } catch (error) {
    res.status(500).json({ error: 'Error al detener el contenedor' });
  }
});

router.get('/logs/:id', async (req: Request, res: Response) => {
  try {
    const container = docker.getContainer(req.params.id);

    const options: Docker.ContainerLogsOptions & { follow: true } = {
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: false,
      tail: 1000,
    };

    const stream = await container.logs(options);

    res.type('text/plain');

    stream.on('data', (chunk) => {
      const logData = stripAnsi(chunk.toString('utf8'));
      res.write(logData);
    });

    stream.on('end', () => {
      res.end();
    });

    stream.on('error', (err) => {
      console.error('Error al obtener los logs del contenedor:', err);
      res.status(500).end('Error al obtener los logs del contenedor');
    });

  } catch (error) {
    console.error('Error al obtener los logs del contenedor:', error);
    res.status(500).end('Error al obtener los logs del contenedor');
  }
});


export default router;
