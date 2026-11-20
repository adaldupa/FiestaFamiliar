# Roba y Gana configurable y preparación del ensayo

Revisión: 20 de noviembre de 2026. Rama `roba-configurable-ensayo`. Sin merge a main.

## Base y respaldo

La revisión publicada `fb1a1bcf4a9acb657d4b9f7c905c45f3a5e056da` coincide con el árbol local de `ajustes-pruebas-manuales`. Se creó primero la rama remota de respaldo y después se implementaron los cambios. No se encontró en los archivos, ramas, reflog ni referencias disponibles la versión reportada con 208 pruebas: la base verificable pasó **203**. No se presupone que aquella versión no exista en otro equipo. Se conservaron las sesiones, revisiones y resultados existentes; las pruebas usan datos temporales aislados.

## Cambios comprobados

Los seis importes predeterminados siguen siendo +100, +75, robar 50, robar 25, reto por 100 y reto por 50. En configuración del concurso pueden guardarse nuevos importes para futuras apariciones. Cada importe debe ser entero positivo dentro del máximo de la ficha aprobada (1000); la suma de ambos robos no excede su débito permitido (1000). Restaurar valores predeterminados es una acción explícita. Cada aparición congela su configuración: una modificación posterior no reescribe tarjetas ni resultados anteriores. Las tarjetas A/B conservan identidad y consignas independientes aunque se configuren importes iguales.

La programación por ventaja sigue desactivada inicialmente. Conserva umbral de 200 puntos y espera de 2 rondas. La excepción opcional permite programar otra aparición antes de esa espera cuando se mantiene la ventaja; por defecto el tope de programación consecutiva es 2, configurable entre 1 y 5. Se anuncia antes del giro y nunca reemplaza un resultado ya sorteado. El tope limita la programación automática: Roba y Gana permanece disponible en el sorteo ordinario y puede repetirse. Los cambios de parámetros quedan auditados.

Los robos usan la clasificación inmediatamente anterior a revelar, el líder roba al segundo y los saldos no bajan de cero. Los retos esperan confirmación. La confirmación y sus movimientos son únicos, también después de recargar o reiniciar el servidor.

Se reprodujo y corrigió otra falla: deshacer un lote antiguo que había financiado robos posteriores podía generar un saldo negativo. Ahora se rechaza antes de mutar datos y se indica usar la corrección revisada con motivo. Esa corrección sigue comprobando el saldo final y conserva la auditoría.

## Evidencia y estado real

`npm test`: **219 pruebas aprobadas, 0 fallos** (177 Node y 42 Python). Incluye los doce juegos, eventos de 2/3/4 equipos, cronómetros/pausas, empates, correcciones, premios, cartas, persistencia, DTO público, servidor LAN y premiación. Las entradas de prueba son sintéticas y aisladas; no son resultados de una fiesta real.

| Funcionalidad | Estado comprobado | Pendiente real |
|---|---|---|
| La galleta viajera | Regresión automatizada de posiciones, tiempo y puntos | Ensayo físico |
| Picasso a oscuras | Regresión automatizada de rapidez y privacidad | Ensayo físico |
| Roba y Gana | Importes, seis cartas únicas, revelación, robos, retos, repetición y auditoría probados | Legibilidad y dinámica con participantes |
| Tararea si puedes | Regresión automatizada; canción privada | Ensayo físico |
| La torre traicionera | Regresión automatizada de posiciones | Ensayo físico |
| ¡Hazme el sonido! | Regresión automatizada de conteo y tarjeta pública | Comprobar TV y representante de espaldas |
| Rebote imposible | Regresión automatizada de aciertos/rapidez | Ensayo físico con dos representantes |
| Manos de mantequilla | Regresión automatizada de posiciones y duración | Ensayo físico |
| El actor dramático | Regresión automatizada simultánea, 90 s y tarjetas privadas; controles existentes conservados | Confirmar cuatro controles y cronómetro sin desplazamiento en el dispositivo real |
| Palabras prohibidas | Regresión automatizada: objetivo y tres prohibidas públicos, infracción por tarjeta, sin repetición | Confirmar lectura en TV y flujo de pistas |
| ¡Yo soy el objeto! | Regresión automatizada de conteo y tarjetas | Ensayo físico |
| ¿Cuántos hay? | Regresión automatizada de cercanía/empates y valor privado | Ensayo físico |
| Marcador, correcciones y premiación | Regresión aprobada; corrección histórica adicional cubierta | Presentación y ceremonia en TV |
| Ruleta, instrucciones y transiciones | Implementación previa conservada; regresión de contenido | Verificación visual real pendiente |
| Conductor/TV y recuperación LAN | Pruebas HTTP de reinicio, privacidad y rechazo de escritura obsoleta aprobadas | Wi-Fi real con celular y TV |

### Bloqueos visuales

Los cinco casos de `npm run test:manual-browser` no pudieron ejecutar el navegador: Chromium falla al crear el socket (`Operation not permitted`). El intento alternativo de control del navegador de escritorio encontró un proveedor AT-SPI no disponible. Se observó únicamente una ventana vacía, nunca la aplicación. No se certifica tamaño de ruleta, lectura a distancia, animaciones ni disposición real de cuatro controles por estas pruebas.

Evidencias conservadas en `evidencia/roba-configurable/`: base verificada, ejecución completa, regresiones específicas y errores del navegador/control de escritorio. No hay capturas de la aplicación ni una partida física aprobada. El cierre de aceptación requiere completar [el ensayo en dispositivos](ENSAYO_FISICO_DISPOSITIVOS.md).
