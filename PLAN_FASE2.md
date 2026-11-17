# Fase 2 — plan de implementación

## Estado de esta rama

Solo inspección y planificación. **Fase 2A no implementada ni verificada.**
No se han ejecutado pruebas nuevas ni repetido las 54 pruebas documentadas de fase 1.
Esta rama conserva la aplicación funcional de fase 1; este documento no activa minijuegos.
La sesión de trabajo que realizó la inspección dispone del conector de GitHub, pero no de terminal, runtime ni navegador de pruebas.

Autorización: desarrollar únicamente 2A. La integración a main y las fases 2B, 2C y 2D requieren aprobación posterior.

## Inspección del código real

Documentos revisados: README.md, FASE1_EQUIPOS.md, VERIFICACION.md y especificacion_noche_de_retos.md.
Módulos revisados: src/teams-core.js, src/conductor.js, src/publico.js, src/teams-show.js,
src/lan-host.js, src/lan-public.js, src/core.js, src/wheel.js, servidor_local.py y service-worker.js.
También se revisaron package.json y el árbol de archivos. No aparece AGENTS.md en el árbol de main.

- package.json declara versión 2.1.0. npm test encadena dos suites Node y una suite Python.
- VERIFICACION.md documenta 19 pruebas de equipos, 26 del dominio anterior y 9 de LAN: 54 en total.
  Es evidencia previa; no equivale a una ejecución durante esta inspección.
- teams-core.js conserva IDs, distribución, métricas y confirmación en retos.equipos.v2.
  Su validador solo acepta presentación welcome/teams y tipos de auditoría de fase 1.
- conductor.js aplica las operaciones sobre una copia recuperable, guarda y publica;
  debe integrar el concurso por esa misma ruta de escritura.
- publico.js usa una segunda lista blanca y no importa el dominio privado.
- servidor_local.py mantiene revisión compartida, bloqueo, archivo temporal y reemplazo,
  autenticación y una lista blanca pública independiente. Su validación solo contempla fase 1.
- src/core.js es el dominio anterior inactivo. drawTeams/validateSession/award exigen
  cuatro equipos o 17 personas; undo elimina la entrada de historial.
  No se puede activar tal cual: rompería el alcance actual y la auditoría de correcciones.
- service-worker.js precarga catálogo y módulos. Cualquier módulo nuevo necesita actualizar
  manifiesto de caché y versión, sin borrar claves de sesiones.

## Alcance autorizado: 2A

Una ronda real de El actor dramático dentro del flujo existente:
equipos confirmados → sorteo persistido → representantes → reglas públicas → preparación →
reloj activo/pausado → captura → vista previa → confirmación → marcador → siguiente ronda.
Conservar también estados de preparación, equipos confirmados, premiación y finalización en el
modelo explícito, sin desarrollar todavía la ceremonia televisiva de 2D.

Incluir frase secreta privada, acierto de 100 puntos confirmado, recuperación de ambas vistas,
corrección/anulación auditable y selección voluntaria de representantes.
No implementar todavía administrador de biblioteca, doce dinámicas ni Duelo de Generaciones.

## Diseño propuesto, todavía no implementado

### Compatibilidad y persistencia

1. Añadir un módulo de concurso que consuma equipos validados por teams-core.js.
   Preservar people, result, semilla, métricas, confirmación y auditoría existentes.
2. Definir una versión de esquema explícita con migración de sesiones v2; no reutilizar
   validateSession del dominio v1 ni reinterpretar automáticamente sus resultados.
3. Antes de migrar, conservar una copia recuperable del original; datos inválidos deben
   mostrar error sin sobrescribirlos.
4. La sesión compartida y el modo individual deben persistir el mismo modelo de concurso.
   La migración debe funcionar también con session.json de fase 1.
5. Cada evento tendrá ID y equipos propios, colección de revisiones de juegos congeladas,
   rondas, movimientos y clasificación. Las reglas futuras no modificarán rondas anteriores.
6. La edición de equipos de fase 1 no debe cambiar silenciosamente equipos históricos de eventos.

### Catálogo versionado

Definir esquema validado con ID estable y revisiones inmutables:
nombre, descripción, categoría, modalidad, límites de participantes, reglas públicas,
instrucciones privadas, materiales, segundos, puntuación, victoria, desempate,
nadie completa, accesibilidad, secretos, estado, versión y fechas.

Preparar tipos de puntuación fijo, posición, aciertos, cercanía, manual y especial;
en 2A ejecutar solo éxito de 100 puntos de El actor dramático.
El historial conserva la revisión concreta usada. Editar/restaurar reglas genera una revisión,
sin reescribir resultados. El administrador visual corresponde a 2B.

La especificación existente propone actuar sin hablar y 100 puntos por acierto.
No fija duración, desempate ni regla de nadie completa para este juego: solicitar su configuración
al conductor o mantenerlos identificados como pendientes, sin inventar reglas definitivas.
La frase de demostración deberá introducirse por el conductor y permanecer privada.

### Motor y aleatoriedad

- Transiciones explícitas con precondiciones; comandos identificados e idempotentes.
- Sorteo sobre juegos activos seleccionados del evento; resultado y candidatos se guardan
  antes de animar. Soportar semilla, omisión con motivo, reintroducción y agotamiento.
- En la demostración, la colección contiene solo El actor dramático. La selección será real
  sobre ese conjunto de un elemento; las pruebas del motor usarán varios juegos ficticios.
- Representantes por menor participación y última ronda, con desempate sembrado;
  selección manual y sustitución voluntaria registradas sin penalización.
- Contabilizar participación efectiva una sola vez; anular puntos no debe inventar ni borrar
  una participación física que sí ocurrió.

### Reloj y sincronización

- Guardar milisegundos restantes al pausar y una referencia temporal al ejecutar;
  no decrementar un contador independiente en cada pantalla.
- En LAN, reloj del anfitrión como autoridad y estimación de desfase para el cliente;
  contemplar recarga y reconexión.
- Toda escritura debe pasar por control de revisión. Dos conductores no podrán iniciar
  dos relojes efectivos para una ronda.
- La llegada a cero cambia el estado una sola vez. La TV solo presenta el reloj recibido.
- Audio optativo y movimiento reducido; no disparar avisos duplicados por cada actualización.

### Puntos e historial

- Captura y vista previa separadas de confirmación. Confirmar genera movimientos únicos.
- Puntajes derivados del libro de movimientos; no aceptar un total libre enviado por cliente.
- Cada movimiento: ID, evento, ronda, equipo, cantidad, motivo, fecha, estado y referencia.
- Corrección y deshacer mediante movimientos compensatorios enlazados;
  no borrar entradas ni usar history.pop() del dominio anterior.
- Rechazar doble confirmación, equipos ajenos, IDs duplicados y referencias inválidas.
- Clasificación con empates según configuración; sin inventar un desempate físico.

### Frontera pública y red local

Actualizar coordinadamente listas blancas JS, Python y receptor público.
Enviar únicamente datos públicos de juego, representantes, tiempo, resultados y marcador.
Nunca enviar catálogo privado completo, frases, respuestas, edades, auditoría ni códigos.

Revisar también las rutas estáticas: allowed_file permite actualmente src/ y catalogo/.
No colocar secretos reales dentro de archivos estáticos servidos sin autenticación.
Los secretos introducidos por el conductor pertenecen al almacenamiento privado.
Conservar autenticación, no-store de API, revisión, escritura atómica y exclusión de datos locales en Git.

### Respaldo e importación

Validar estructura, versión, IDs únicos, referencias, estados, reglas y movimientos,
antes de cambiar datos. Preparar exportación/importación de sesión/evento en 2A.
La administración completa de biblioteca y preguntas se entregará en sus etapas.
Reemplazar datos requiere confirmación; errores no deben modificar almacenamiento.

## Orden de implementación

1. Ejecutar baseline de 54 pruebas y conservar salida real.
2. Implementar esquema, migración y pruebas de compatibilidad.
3. Implementar estados, sorteo, representantes, reloj y libro de puntos con pruebas.
4. Ampliar validación y proyección Python, control de revisiones y pruebas LAN.
5. Integrar controles reales en conductor y presentación pública en TV.
6. Actualizar caché offline y probar recarga/migración.
7. Demostrar el flujo completo y corrección, con evidencia real.
8. Actualizar README.md, ESPECIFICACION_FASE2.md, VERIFICACION_FASE2.md,
   GUIA_CONDUCTOR.md, modelo de catálogo y pendientes.
9. Publicar commits en esta rama y entregar para revisión, sin integrar main.

## Verificación requerida antes de declarar 2A entregada

Ejecutar npm test y conservar las 54 pruebas previas. Añadir pruebas para:
integridad 2/3/4 equipos; migración v2; sorteos reproducibles y sin repetición;
agotamiento/omisión; representantes/sustituciones; transiciones inválidas;
reloj con fuente temporal inyectada; pausa/reanudación/recarga;
confirmación idempotente; corrección/anulación; clasificación;
referencias y versiones de importación; aislamiento por evento;
revisiones y dos conductores concurrentes; privacidad en JS/Python y rutas estáticas.

Verificar en navegador conductor y TV, con almacenamiento separado para LAN:
1. Recuperar equipos confirmados.
2. Sortear El actor dramático.
3. Confirmar representantes y mostrar reglas/materiales públicos.
4. Introducir frase privada y comprobar que no aparece en respuestas públicas.
5. Iniciar, pausar, reanudar y finalizar reloj.
6. Capturar un acierto, revisar 100 puntos y confirmar.
7. Ver marcador en TV, recargar ambas vistas y comprobar persistencia.
8. Corregir/deshacer y revisar historial compensatorio.
9. Probar offline, teclado, sonido silenciado y movimiento reducido.

Documentar por separado: implementado y probado; implementado pendiente de validación
manual; diseñado sin implementar; pendiente de decisión. No fabricar capturas ni salidas.

## Continuación en un entorno con ejecución

Abrir el repositorio en Codex con terminal y navegador, actualizar referencias remotas y
cambiar a fase2-motor-concurso. Leer nuevamente los archivos que hayan cambiado desde esta
inspección. Ejecutar npm test antes de editar. Retomar el orden anterior y el prompt maestro
del usuario; no interpretar este documento como entrega funcional o autorización para 2B–2D.
