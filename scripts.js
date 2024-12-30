document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.button-add-task');
  const inputTask = document.querySelector('.input-task');
  const inputTime = document.querySelector('.input-time');
  const inputDay = document.querySelector('.input-day');
  const listaCompleta = document.querySelector('.list-tasks');
  const ctx = document.getElementById('taskChart').getContext('2d');

  let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];

  // Inicializar Flatpickr
  flatpickr('.input-time', {
      enableTime: true,
      dateFormat: 'd/m/Y H:i',
      time_24hr: true,
  });

  const diasSemana = [
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
      'Domingo',
  ];

  const taskChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: diasSemana,
          datasets: [
              {
                  label: 'Pendentes',
                  data: Array(7).fill(0),
                  backgroundColor: '#4facfe',
              },
              {
                  label: 'Concluídas',
                  data: Array(7).fill(0),
                  backgroundColor: '#00f2fe',
              },
          ],
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'top',
              },
          },
          scales: {
              y: {
                  beginAtZero: true,
              },
          },
      },
  });


  function atualizarGrafico() {
      const dadosPendentes = Array(7).fill(0);
      const dadosConcluidas = Array(7).fill(0);

      tarefas.forEach((tarefa) => {
          const index = diasSemana.indexOf(
              tarefa.dia.charAt(0).toUpperCase() + tarefa.dia.slice(1) + '-feira'
          );
          if (index >= 0) {
              if (tarefa.concluida) {
                  dadosConcluidas[index]++;
              } else {
                  dadosPendentes[index]++;
              }
          }
      });

      taskChart.data.datasets[0].data = dadosPendentes;
      taskChart.data.datasets[1].data = dadosConcluidas;
      taskChart.update();
  }


  function adicionarNovaTarefa() {
      const tarefa = inputTask.value.trim();
      const hora = inputTime.value;
      const dia = inputDay.value;

      if (!tarefa || !hora) {
          showToast('Preencha todos os campos!', 'error');
          return;
      }

      tarefas.push({ tarefa, hora, dia, concluida: false });
      salvarTarefas();
      mostrarTarefas();
      atualizarGrafico();
      showToast('Tarefa adicionada!');
      inputTask.value = '';
      inputTime.value = '';
      inputDay.value = 'segunda';
  }


  function mostrarTarefas() {
      listaCompleta.innerHTML = tarefas
          .map(
              (item, index) => `
      <li class="task ${item.concluida ? 'done' : ''}">
        <div>
          <strong>${item.tarefa}</strong>
          <small>${item.hora} - ${item.dia}</small>
        </div>
        <div>
          <i class="fas fa-check-circle" onclick="concluirTarefa(${index})"></i>
          <i class="fas fa-trash" onclick="deletarTarefa(${index})"></i>
        </div>
      </li>
    `
          )
          .join('');
  }


  function concluirTarefa(index) {
      tarefas[index].concluida = !tarefas[index].concluida;
      salvarTarefas();
      mostrarTarefas();
      atualizarGrafico();
      showToast('Tarefa atualizada!');
  }


  function deletarTarefa(index) {
      tarefas.splice(index, 1);
      salvarTarefas();
      mostrarTarefas();
      atualizarGrafico();
      showToast('Tarefa excluída!', 'error');
  }

  function salvarTarefas() {
      localStorage.setItem('tarefas', JSON.stringify(tarefas));
  }


  function showToast(message, type = 'success') {
      Toastify({
          text: message,
          duration: 3000,
          gravity: 'top',
          position: 'right',
          backgroundColor: type === 'success' ? '#4caf50' : '#f44336',
      }).showToast();
  }

  button.addEventListener('click', adicionarNovaTarefa);
  window.concluirTarefa = concluirTarefa;
  window.deletarTarefa = deletarTarefa;

  mostrarTarefas();
  atualizarGrafico();
});
