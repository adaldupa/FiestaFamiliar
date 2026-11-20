# Ensayo físico: computadora, celular y televisión

Usar la rama `roba-configurable-ensayo`. Conservar la carpeta de datos real y exportar un respaldo desde la aplicación antes de ensayar. No borrar almacenamiento ni importar sobre una sesión histórica.

## Abrir los dispositivos

1. En la computadora anfitriona, dentro del repositorio, iniciar un servidor con una carpeta nueva exclusiva para ensayos:

   ```bash
   python3 servidor_local.py --host 0.0.0.0 --port 8081 --data-dir ../fiesta-ensayo-roba
   ```

   En Windows puede usarse `py` en lugar de `python3`. Mantener abierta esa terminal. Para recuperar este ensayo, reiniciar siempre con la misma carpeta y puerto.
2. Abrir en la computadora `http://127.0.0.1:8081/index.html`. Obtener ahí el código privado del conductor. No mostrarlo en TV.
3. Consultar la IPv4 de la computadora con `ipconfig` (Windows) o `hostname -I` (Linux). Usar la dirección de la red local, por ejemplo `192.168.1.40`.
4. Conectar celular y TV a la misma red local. Abrir en el celular `http://192.168.1.40:8081/index.html` e introducir el código privado. Abrir en el navegador de la TV `http://192.168.1.40:8081/publico.html`, sin código. Sustituir la IP de ejemplo por la real. `localhost` en esos dispositivos apunta a ellos mismos.
5. Si no conecta, revisar permiso de entrada del puerto 8081 en la computadora y que la red de invitados no aísle dispositivos. No abrir el puerto a Internet. Dirigir desde un solo conductor a la vez; si otro dispositivo conserva un estado antiguo, recargarlo antes de editar.

## Comprobar antes de la fiesta

Crear un evento identificado como ENSAYO, seleccionar participantes y confirmar equipos. Verificar el mismo evento, equipos y ronda en celular y TV. Repetir un evento completo con 2, 3 y 4 equipos; anotar cualquier divergencia, dispositivo, ronda y acción exacta.

- Girar la ruleta: comprobar nombres legibles a distancia, protagonismo de la rueda y marcador compacto. Tras confirmar, debe desaparecer la lista de opciones; las instrucciones públicas deben ser breves.
- Palabras prohibidas: representante de espaldas a TV; sus compañeros ven objetivo y tres prohibidas y dan pistas. Probar Correcto, Pasar e Infracción. La infracción debe invalidar solo esa tarjeta; revisar aciertos, puntos y ausencia de repetición en otro equipo/ronda.
- El actor dramático: confirmar juego y representantes antes de obtener tarjetas. Verificar cuatro controles de finalización con cronómetro visible, ejecución simultánea de 90 s y tarjetas privadas ausentes de TV. Registrar tiempos distintos, empate y equipo sin completar; revisar 100/75/50/25 con saltos por empate y cero para no completar. Corregir usando segundos o mm:ss.
- ¡Hazme el sonido!: tarjeta pública y representante de espaldas. Tararea/Picasso: canción/consigna privada ausente de TV. Revisar tarjetas y aciertos de ¡Yo soy el objeto!, estimaciones y valor real privado de ¿Cuántos hay?. Completar también los otros juegos con su ficha aprobada; no sustituir acciones físicas por datos inventados.
- Roba y Gana: antes de una nueva ronda, revisar los seis importes en configuración. Probar guardar y restaurar; una ronda ya creada debe conservar sus importes. Cada equipo elige una carta distinta; ninguna se revela antes de todas las elecciones y las seis aparecen juntas. Revisar clasificación previa, destino de cada robo, saldo mínimo cero, retos pendientes y una única confirmación.
- Para comprobar la excepción, activarla expresamente en este evento de ensayo, con umbral mínimo permitido de 25 y el tope elegido. Generar ventaja mediante los resultados del ensayo y comprobar el anuncio antes del giro. Al alcanzar el tope, debe cesar la programación forzada; Roba sigue disponible en la ruleta ordinaria. No editar puntos únicamente para fabricar evidencia de una partida real.
- Verificar selección de representantes y Duelo de Generaciones: respuesta correcta concede un movimiento independiente de 10 puntos y selecciona a quien participará; recargar no debe duplicarlo.
- Terminar los doce juegos y avanzar la premiación desde el conductor. Revisar clasificación, empates, resumen y cierre. Intentar modificar puntos durante la ceremonia debe exigir el procedimiento explícito de corrección auditada.

## Sincronización y recuperación

Iniciar, pausar y reanudar un turno desde el celular: verificar el mismo estado del reloj en TV. Recargar ambas pantallas en pausa y comprobar cartas, aciertos, representantes y marcador. No confirmar puntuaciones desde dos dispositivos simultáneamente.

Pausar y exportar el ensayo. Desconectar temporalmente el Wi-Fi del celular; comprobar la indicación de desconexión y recuperar la conexión antes de continuar. Después detener el servidor con Ctrl+C: la TV debe conservar el último estado guardado sin generar premios. Reiniciar el mismo comando con la misma carpeta; recargar, introducir el código si se solicita y comprobar misma ronda, cartas y puntos. Reintentar una confirmación ya realizada no debe duplicar movimientos. Una edición obsoleta debe rechazarse y recuperarse recargando, sin sobrescribir el estado vigente.

Registrar resultado observado, esperado y hora de cada incidencia. Estas comprobaciones requieren dispositivos reales: las 219 pruebas automatizadas no certifican cobertura Wi-Fi, legibilidad, navegación del televisor ni facilidad de operación durante la fiesta.
