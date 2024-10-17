let authHeader = '';

const login = () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    document.getElementById('login-error').classList.remove('d-none');
    document.getElementById('login-error').innerText = 'Por favor, ingresa usuario y contraseña.';
    return;
  }

  authHeader = 'Basic ' + btoa(`${username}:${password}`);

  fetch('/api/status', {
    headers: {
      Authorization: authHeader,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Credenciales incorrectas');
      }
      document.getElementById('docker-status-table').classList.remove('d-none');
      document.getElementById('login-form').classList.add('d-none');
      document.getElementById('login-error').classList.add('d-none');
      document.getElementById('system-info').classList.remove('d-none');
      updateStatus();
    })
    .catch(() => {
      document.getElementById('login-error').classList.remove('d-none');
      document.getElementById('login-error').innerText = 'Credenciales incorrectas. Inténtalo de nuevo.';
    });
};

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024,
    sizes = ['B', 'KB', 'MB', 'GB', 'TB'],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const updateStatus = () => {
  fetch('/api/status', {
    headers: {
      Authorization: authHeader,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Autenticación fallida');
      }
      return response.json();
    })
    .then((data) => {
      const containerStatusElement = document.getElementById('container-status');
      containerStatusElement.innerHTML = '';

      const totalMem = data.totalMem;
      const freeMem = data.freeMem;
      const usedMem = totalMem - freeMem;

      document.getElementById('vps-memory').innerText = `${formatBytes(usedMem)} usados de ${formatBytes(totalMem)}`;

      data.containers.forEach((container) => {
        const statusClass = container.status === 'running' ? 'status-up' : 'status-down';
        const startedAt = container.startedAt;
        const memoryUsage = container.memoryUsage ? formatBytes(container.memoryUsage) : 'N/A';
        const row = `
          <tr>
            <td>${container.name}</td>
            <td class="${statusClass}">${container.status}</td>
            <td>${startedAt}</td>
            <td>${memoryUsage}</td>
            <td>
              <button class="btn btn-success btn-sm" onclick="startContainer('${container.id}')">Iniciar</button>
              <button class="btn btn-danger btn-sm" onclick="stopContainer('${container.id}')">Detener</button>
              <button class="btn btn-info btn-sm" onclick="viewLogs('${container.id}', '${container.name}')">Ver Logs</button>
            </td>
            <td>${new Date().toLocaleTimeString()}</td>
          </tr>
        `;
        containerStatusElement.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error('Error obteniendo el estado de los contenedores:', error);
    });
};

const startContainer = (id) => {
  fetch(`/api/start/${id}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Autenticación fallida');
      }
      updateStatus();
    })
    .catch((error) => console.error('Error iniciando el contenedor:', error));
};

const stopContainer = (id) => {
  fetch(`/api/stop/${id}`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Autenticación fallida');
      }
      updateStatus();
    })
    .catch((error) => console.error('Error deteniendo el contenedor:', error));
};

const viewLogs = (id, name) => {
  document.getElementById('logs-view').classList.remove('d-none');
  document.getElementById('log-container-name').innerText = name;
  const logElement = document.getElementById('container-logs');
  logElement.innerHTML = 'Cargando logs...';

  fetch(`/api/logs/${id}`, {
    headers: {
      Authorization: authHeader,
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Error obteniendo los logs');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      const readChunk = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            return;
          }
          const chunk = decoder.decode(value);
          logElement.innerHTML += chunk;
          logElement.scrollTop = logElement.scrollHeight;
          readChunk();
        });
      };
      readChunk();
    })
    .catch((error) => {
      logElement.innerHTML = 'Error obteniendo los logs.';
      console.error('Error obteniendo los logs:', error);
    });
};


const hideLogs = () => {
  document.getElementById('logs-view').classList.add('d-none');
};

setInterval(updateStatus, 180000);
