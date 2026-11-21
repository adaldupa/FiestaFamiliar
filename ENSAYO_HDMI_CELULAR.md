# Ensayo en computadora + HDMI + celular

**La integración Work/Codex está disponible para ensayo físico, sin merge a main.** Se completaron 254 pruebas automatizadas y 14 rondas en navegador; HDMI, TV y celular físicos quedan pendientes. Usar un evento de ensayo separado y exportar el respaldo del evento real antes de cualquier prueba.

## Preparación

1. Descargar la rama `integracion/work-codex-20261121`. Tener Python 3 disponible; la aplicación y el servidor usan archivos locales y biblioteca estándar, sin depender de npm para jugar.
2. En la carpeta del proyecto, ejecutar:

   ```bash
   python3 servidor_local.py --host 0.0.0.0 --port 8081 --data-dir ../fiesta-ensayo-integracion
   ```

   En Windows puede usarse `py`. Esa carpeta nueva contiene únicamente el ensayo. No reemplazar la carpeta de datos real, no borrar almacenamiento del navegador y no importar encima de una sesión histórica. Para recuperar el ensayo, reiniciar siempre con la misma carpeta y puerto. Mantener la terminal abierta.
3. Conectar la computadora a TV por HDMI y elegir **Extender pantallas**, no Duplicar. Duplicar mostraría en TV lo que se abra en la computadora, incluidas tarjetas privadas.
4. En la computadora abrir `http://127.0.0.1:8081/index.html` para obtener el código privado de conductor. Luego abrir `http://127.0.0.1:8081/publico.html` en una ventana distinta, moverla a la pantalla HDMI y ponerla a pantalla completa. En la TV solo debe permanecer `publico.html`.
5. Consultar la IPv4 de la computadora (`ipconfig` en Windows o `hostname -I` en Linux). Conectar el celular a la misma red; abrir `http://IP_COMPUTADORA:8081/index.html` e introducir el código privado. Por ejemplo, si la IP es 192.168.1.40, abrir `http://192.168.1.40:8081/index.html`. No usar localhost en el celular.
6. Si no conecta, permitir el puerto 8081 en el firewall local y comprobar que la Wi-Fi de invitados no aísle clientes. No exponer el servidor a Internet. Utilizar solo un conductor que escriba a la vez; dejar la computadora en la vista pública después de obtener el código.

## Sincronización y privacidad

Crear un evento ENSAYO con cuatro equipos. Verificar mismo evento/ronda y marcador. En eventos anteriores, aplicar las correcciones a futuras rondas únicamente entre rondas, sin modificar las ya creadas.

- Iniciar, pausar y reanudar desde celular; comprobar reloj y equipo activo en TV.
- Sonido/Palabras: representante de espaldas, tarjeta visible en TV, tres prohibidas cuando corresponde; Correcto/Pasar/Infracción deben avanzar y no repetir cartas.
- Actor/Tararea: un turno por equipo, 90/60 s independientes; tarjeta/canción privada visible solo al conductor y representante. Comprobar cambio de canción antes de empezar, no después.
- Roba: seis cartas ocultas con número/propietario, orden de elección por clasificación, revelación conjunta, premios/robos calculados y retos pendientes de confirmación. El marcador se aplica tras revisión una sola vez.
- Completar los doce juegos y dos rondas extra autorizadas. Revisar clasificación tras cada ronda, aviso de fin de ordinarios, premiación y cierre voluntario. No fabricar resultados como prueba física de ejecución de un reto.

## Sin Internet y recuperación

Los archivos, bancos, fuentes e imágenes de la integración están dentro del proyecto. Con el servidor corriendo y una red local activa, Internet no es necesario para jugar. No apagar el router: el celular sigue necesitando la LAN. En HTTP por IP local, algunos navegadores no habilitan service worker; la operación depende del servidor local abierto y no de una instalación PWA.

Pausar y exportar el ensayo. Desconectar brevemente el Wi-Fi del celular y reconectarlo; recargar y verificar mismo estado. Detener el servidor con Ctrl+C, reiniciarlo con el mismo comando/carpeta y volver a cargar conductor/TV. Verificar mismos equipos, ronda, tarjetas y puntuaciones; reintentar una confirmación ya registrada no debe duplicar movimientos. Si una escritura queda obsoleta, recargar antes de continuar; no sobrescribir el estado vigente.

Registrar dispositivo, resolución, ronda, acción, resultado esperado/observado y capturas separadas de conductor y TV. Revisar ruleta, textos a distancia, tarjetas, reloj, marcador y ceremonia sin superposiciones. Comparar las capturas de `evidencia/integracion-work-codex/` con la pantalla real.

**Ensayo físico: pendiente hasta realizarlo.**
