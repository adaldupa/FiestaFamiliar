# Ensayo de los ajustes manuales

Usar la rama `ajustes-pruebas-manuales` y datos de ensayo separados. Para no tocar reuniones reales:

```sh
python3 servidor_local.py --data-dir ../fiesta-ensayo-ajustes --port 8081
```

Abrir el conductor en la computadora/celular con el enlace impreso y su código privado. En la TV usar únicamente `publico.html`, sin código. Misma Wi-Fi y computadora encendida. No borrar almacenamiento ni archivos de sesiones anteriores. Al actualizar, recargar para activar la caché nueva.

1. **Ruleta:** comprobar que ocupa el centro del escenario, que los nombres se leen desde el lugar de los participantes y que el marcador es compacto solo durante el giro. Al detenerse debe desaparecer la lista inferior de juegos. Confirmar que el resultado no cambia al recargar.
2. **Palabras prohibidas:** representante de espaldas a TV; el equipo ve objetivo y tres prohibidas. Iniciar 60 s. Pulsar Correcto, Pasar e Infracción y comprobar que cada acción cambia una sola tarjeta. La infracción confirmada no suma acierto ni borra los anteriores. Pausar debe ocultar la tarjeta en TV; reanudar debe conservarla. Finalizar debe retirar la tarjeta antes del siguiente turno. Revisar aciertos/puntos y no repetir tarjetas.
3. **¡Hazme el sonido!:** mismo representante de espaldas, pero compañeros hacen sonidos sin palabras ni gestos. La TV muestra solo la tarjeta activa; verificar cambios y 60 s por equipo.
4. **Actor:** preparar cuatro representantes y tarjetas diferentes en privado. Iniciar el reloj común de 90 s. Comprobar cuatro botones de finalización y reloj en una sola vista del conductor. Probar distintos tiempos, no completar y empate. Abrir una tarjeta privada nunca debe proyectarla en TV.
5. **Tiempos:** en revisión introducir `12.5`, `12,5` o `00:12.500`; deben representar el mismo tiempo. Dejar vacío para no completar. Corregir un empate y comprobar 100/75/50/25 con saltos de rango, sin cambiar el marcador antes de confirmar.
6. **Privacidad:** comprobar Tararea, Picasso y Objeto. Sus estímulos no deben aparecer en TV. Roba y Gana debe revelar sus seis premios solo después de todas las elecciones. El valor real de ¿Cuántos hay? sigue privado.
7. **Presentación:** instrucciones cortas en TV y detalles/materiales completos en conductor. Al confirmar puntos, destacar los cambios sin modificar cantidades. En clasificación general no mostrar representantes o nombres de prueba que no aportan información. Activar movimiento reducido y comprobar que se respetan las preferencias.
8. **Cierre:** completar los doce juegos, revisar el historial y dirigir la premiación. Comprobar empates, resumen, cierre y conservación del evento tras recargar. Para el recorrido completo, seguir también `PRUEBA_MANUAL_CIERRE.md`.

Anotar resolución y orientación de cada pantalla. Si un control queda fuera de vista, registrar juego/fase, captura, tamaño de ventana y si la tarjeta privada estaba abierta. No compartir códigos del conductor ni respuestas secretas en capturas públicas. Este ensayo no está sustituido por la salida de pruebas automáticas.
