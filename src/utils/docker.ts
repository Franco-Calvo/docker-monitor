import Docker, { ContainerInfo } from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export interface ContainerStatus {
  id: string;
  name: string;
  status: string;
  startedAt: string;
  memoryUsage: number;
}

export const getContainerInfo = async (container: ContainerInfo): Promise<ContainerStatus> => {
  const startedAt = container.State === 'running' ? formatUptime(container.Status) : 'N/A';
  const containerInstance = docker.getContainer(container.Id);
  let memoryUsage = 0;

  if (container.State === 'running') {
    const stats = await containerInstance.stats({ stream: false });
    memoryUsage = stats.memory_stats.usage || 0;
  }

  return {
    id: container.Id,
    name: container.Names[0].replace('/', ''),
    status: container.State,
    startedAt,
    memoryUsage,
  };
};

const formatUptime = (status: string): string => {
  const upPrefix = 'Up ';
  if (status.startsWith(upPrefix)) {
    return status.slice(upPrefix.length);
  }
  return 'N/A';
};
