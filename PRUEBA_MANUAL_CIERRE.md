# Ensayo manual desde celular y televisión

## Preparación sin tocar sesiones reales

Descargar o clonar la rama `cierre-funcional-concurso`. Para ensayar, iniciar un servidor con **carpeta de datos separada** y otro puerto:

```sh
python3 servidor_local.py --data-dir ../fiesta-ensayo-cierre --port 8081
```

En Windows puede utilizarse `py` en lugar de `python3`. No borrar `.datos-locales`, almacenamiento del navegador ni respaldos de reuniones anteriores. Mantener encendida la computadora y la terminal abierta.

El servidor imprime los enlaces con la IP de la computadora. Todos los dispositivos deben estar en la misma Wi-Fi:

- Computadora: enlace de conductor, terminado en `index.html`.
- Celular: mismo conductor usando la IP impresa; introducir el código privado mostrado en la computadora.
- TV o navegador conectado a la TV: enlace terminado en `publico.html`, sin código privado.

Usar una pestaña de conductor activa por navegador. Al actualizar el código, recargar una vez para activar la caché nueva; no limpiar datos. Para ensayar equipos diferentes, crear nuevas reuniones en la carpeta de ensayo.

## Recorrido

1. Registrar 17 participantes de prueba. Elegir primero 2 equipos, sortear y confirmar. Repetir el ensayo después con 3 y 4 equipos.
2. Crear una nueva reunión con las doce fichas definitivas. Verificar que Inicio abre Concurso y conserva los integrantes confirmados.
3. En **Representantes y repetición**, activar selección antes de revelar. Presentar una pregunta de Duelo; la TV debe mostrar solo la pregunta. Confirmar un acierto con una persona identificada: sumar exactamente 10 puntos y clasificarla para el siguiente juego.
4. Recargar el conductor: los 10 puntos y la selección deben conservarse. Girar: no mostrar el nombre ni el tiempo del juego en TV hasta confirmar representantes. En Rebote guardar dos personas distintas por equipo.
5. Ejecutar los doce juegos. El sorteo es real: si Roba reaparece naturalmente, jugarlo y continuar hasta haber recorrido los doce distintos. No sustituir resultados del giro para forzar una lista.
6. En simultáneos iniciar todos juntos y registrar las finalizaciones por equipo. En conteo probar Correcto, Pasar e infracción confirmada; comprobar que solo se anula esa tarjeta. Cambiar una canción desconocida antes de iniciar Tararea.
7. Pausar un juego, recargar y reanudar. Comparar el reloj del celular y la TV; el tiempo detenido no debe contarse. Finalizar y revisar: el marcador no cambia hasta confirmar.
8. Confirmar puntos una vez, recargar y comprobar que no se duplican. En **Corregir puntos con motivo y revisión**, editar una puntuación válida, revisar y confirmar: comprobar que cambia y que el lote anterior queda anulado en Resultados.

## Roba y Gana

1. Anotar clasificación y saldos antes de revelar.
2. Cada equipo elige una tarjeta diferente. Intentar elegir una ya ocupada: debe estar bloqueada.
3. Antes de todas las elecciones, intentar revelar: debe rechazarse. Al completarlas, revelar las seis juntas, incluidas las no elegidas.
4. Confirmar que el líder roba al segundo de la clasificación anotada. Los demás roban al mejor oponente. En empate se usa el orden estable de equipos; no se cambian sus lugares.
5. Registrar cada robo y confirmar por separado los retos cumplidos o no cumplidos. No finalizar mientras queden resoluciones pendientes.
6. Comprobar que un premio de esa aparición no aumenta lo robable del saldo anterior y que ningún saldo queda negativo. Revisar y confirmar una vez.
7. Activar repetición automática con ventaja y separación de ensayo. Esperar a que ambas condiciones reales se cumplan: debe anunciarse la ronda extra antes de girar, con Roba como única opción. No editar resultados para cumplir el umbral; para probarlo rápidamente, usar el menor umbral autorizado (25) desde el inicio del ensayo.

## Desconexión y recuperación

1. Exportar un respaldo de la reunión de ensayo.
2. Con el juego pausado, detener el servidor y comprobar que las pantallas detectan la desconexión sin perder la copia guardada.
3. Reiniciar con la misma carpeta de ensayo y puerto. Recargar y volver a conectar con el código privado si se solicita.
4. Verificar ronda, tarjeta, reloj, elecciones y marcador. Ningún acierto o premio debe duplicarse.
5. Si dos dispositivos de conductor guardan simultáneamente, el segundo cambio desactualizado debe rechazarse y recuperar la versión vigente.

## Premiación

1. Tras completar las rondas, no abrir otra pregunta de Duelo. Pulsar **Iniciar premiación final** y confirmar.
2. Comprobar clasificación y resumen en el conductor. En TV avanzar desde los lugares inferiores hasta el primer lugar; los empatados se presentan juntos.
3. Recargar a mitad de ceremonia: conservar el grupo actual y los puntos. Verificar movimiento reducido si se activa.
4. Para ensayar corrección, retirar la ceremonia con motivo y seleccionar una ronda. Corregir mediante revisión/confirmación y reiniciar premiación; la anterior debe figurar retirada en el historial.
5. Presentar todos los lugares y pulsar **Cerrar formalmente el evento**. Recargar y comprobar que permanece finalizado y conserva resultados.
6. Crear una nueva reunión de ensayo y verificar que el historial del evento anterior sigue intacto.

## Evidencia a registrar

Para cada incidencia anotar juego, fase, equipo, acción, resultado esperado/observado y si hubo recarga o desconexión. Capturar conductor y TV sin compartir el código privado ni respuestas secretas. El ensayo se considera aprobado únicamente cuando el recorrido real completo funcione en las pantallas de destino.
