# Verificación de fase 2B — biblioteca reutilizable

Fecha: 17 de noviembre de 2026 (America/Mexico_City). Rama `fase2-motor-concurso`.
Base: `da012c14ff23ebf8b0cb9640721d104f57c25632`, con la navegación de 2A aprobada por el usuario. Main no se integra ni modifica. No se inicia 2C ni 2D.

## Implementado y probado

- Administrador dentro de la sección Biblioteca: crear, abrir/editar, duplicar, activar/desactivar, archivar, buscar, combinar filtros y paginar.
- Ficha completa con preparación, pasos, materiales, tiempo, puntos y límites, éxito, desempate, no finalización, accesibilidad, instrucciones y tarjetas privadas, estado y pendientes.
- Guardar y restaurar agrega revisiones inmutables. Ediciones obsoletas se rechazan. No existe eliminación permanente.
- Roba y Gana conserva su ID estable, marca permanente y repetible; no se archiva. Duplicarlo crea un juego independiente, inactivo y sin protección de permanente.
- Exportación privada de biblioteca, revisiones, colecciones y auditoría. Importación con validación previa, resumen y confirmación; los conflictos crean revisiones nuevas y nunca reescriben el historial. Cargar nuevamente el mismo catálogo no duplica las fichas ni las revisiones ya importadas.
- Doce fichas del documento recibido, convertidas al esquema real. La carga es explícita: no se reemplaza el catálogo al arrancar. Las plantillas distribuidas no contienen campos privados; estos se inicializan y se completan localmente.
- Colecciones con referencias a versiones concretas. Se pueden seleccionar al crear una reunión cuando sus revisiones son compatibles, incluso después de editar las fichas actuales.
- Selección explícita de juegos y versiones al crear eventos. La revisión original del actor de 2A permanece disponible; la nueva revisión por clasificación de tiempo no se ejecuta como si ya tuviera motor.
- Retos genéricos de turnos con puntos fijos o manuales creados sin código utilizan el motor existente. Captura manual pide puntos y motivo, muestra revisión y confirma por el libro de puntos original.
- Ediciones de biblioteca no cambian las copias de eventos en curso. Se conserva el plazo del reloj y los resultados anteriores.
- Persistencia local, recuperación offline y sincronización LAN mediante los mecanismos existentes. El editor conserva su borrador ante navegación o una actualización de otro conductor; una versión obsoleta no puede sobrescribir la nueva.
- Validación privada independiente en el servidor para bibliotecas y referencias. Las fichas futuras no pueden activarse como eventos mediante un respaldo adulterado.
- Navegación de seis secciones y TV independiente conservadas. No se añade el catálogo al resumen público ni a la precarga pública del Service Worker.

## Resultado de pruebas

**120 pruebas aprobadas; cero fallos pendientes.**

| Suite | Casos |
| --- | ---: |
| Dominio anterior | 26 |
| Equipos de fase 1 | 19 |
| Motor de concurso | 26 |
| Navegación sin dependencias | 2 |
| Biblioteca: dominio, importación y compatibilidad | 19 |
| Python: LAN original + concurso + biblioteca | 19 |
| Navegación en Chromium | 4 |
| Biblioteca en Chromium | 5 |
| **Total** | **120** |

Se conservan y ejecutan las 91 pruebas anteriores. La única adaptación del harness anterior permite elegir otra carpeta de capturas mediante `NAV_EVIDENCE`, para no reemplazar las imágenes históricas de 2A. No se eliminan expectativas ni casos de regresión.

Salidas completas: [dominio y servidor](evidencia/fase2b/pruebas.txt), [navegación](evidencia/fase2b/pruebas-navegacion.txt), [biblioteca en navegador](evidencia/fase2b/pruebas-biblioteca-navegador.txt).

### Cinco escenarios de navegador

1. Cargar las doce fichas con aceptación de actualización del actor; crear una ficha real; editarla, restaurar su primera versión, duplicarla y archivarla; filtrar; crear colección; descargar y leer el JSON exportado; cargar su vista previa sin cambios; rechazar un archivo incompatible sin alterar datos; recuperar después de recarga; comprobar que el juego permanente no ofrece archivo.
2. Crear reunión con la revisión original compatible del actor tras cargar las reglas nuevas; iniciar turno/reloj; editar la ficha de biblioteca mientras corre la ronda; comprobar que el evento permanece idéntico y que la TV no recibe la nueva ficha ni sus secretos.
3. Vista de celular a 390×844 y 320×844: navegación, edición, borrador y ausencia de desbordamiento horizontal. Recarga con red simulada desconectada conserva fichas y estilos. Uso de teclado para cambiar sección.
4. Servidor LAN temporal con dos contextos de navegador separados: ambos reciben biblioteca; un conductor conserva su borrador al llegar una edición remota; guardar con la versión antigua se rechaza; API pública excluye biblioteca, borrador y nueva ficha privada.
5. Crear un reto manual sin código, guardarlo en una colección, editar su revisión actual y luego crear un evento desde la colección anterior. Comprobar que usa exactamente la revisión guardada, completar cuatro turnos, revisar 75/0/0/0 y confirmar 75 puntos reales.

Los escenarios de celular y de reto manual simulan además la ausencia de `crypto.randomUUID`, habitual en HTTP de red local. Los IDs y las semillas disponen de alternativa local; no se depende de esa función para operar desde el teléfono.

Las pruebas se ejecutaron con Playwright 1.62.1 y Chromium Headless Shell 153 en este entorno. Se usaron datos ficticios Prueba 01–17 y carpetas/puertos temporales. No se tocaron sesiones reales. El ensayo LAN usa contextos separados contra el servidor local; no afirma haber usado un teléfono físico ni radio Wi-Fi real.

### Errores encontrados y corregidos durante la verificación

- El campo de ID de colección con nombre `id` ocultaba la propiedad `form.id` y evitaba procesar el formulario. Se cambió a un campo interno `collectionId`; la creación y edición se ensayaron después.
- Se corrigieron selectores inválidos y esperas de confirmación en la suite nueva, conservando sus aserciones funcionales.
- Se añadieron alternativas a randomUUID y pruebas sin esa función para contextos HTTP de celular.

La salida final refleja las ejecuciones posteriores a estas correcciones; no se presentan intentos fallidos como resultados aprobados.

## Límites explícitos

**Catalogado no equivale a dinámica implementada.** Las doce fichas actualizadas llevan `implementation: planned`; se editan y se organizan en colecciones, pero sus motores específicos pertenecen a 2C. Los nuevos tiempos pendientes permanecen nulos y sus decisiones abiertas se muestran como pendientes.

Los seis sistemas de puntuación se configuran y validan en el catálogo. El concurso actual ejecuta fixed/manual por turnos. Clasificación por posición/tiempo, conteos, cercanía, cartas/robos y repetición automática todavía no se ejecutan. La revisión antigua del actor conserva su puntuación fija original.

No se generaron los bancos de 100/300 tarjetas ni preguntas genéricas para simular que están completos. Duelo de Generaciones y la ceremonia siguen pendientes. La marca repetible se conserva para sus motores futuros; en el motor actual se mantiene la autorización expresa de repetición de 2A.

## Pendiente de validación manual

- Revisión y aprobación del usuario antes de integrar main o autorizar 2C.
- Android/iPhone y TV físicos, Safari, lectores de pantalla, personas mayores y altavoces del evento.
- Reglas de reinicio de galleta, empates/orden de robos, límite de Rebote imposible y tiempo de estimación, conforme al documento fuente.

## Archivos principales

`src/library-core.js`, `src/library-host.js`, `library.css`, `biblioteca_validacion.py`, `catalogo/fichas-publicas-fase2b.json`, las tres suites nuevas de biblioteca.

Se actualizan modelo/validación, selección de revisiones al crear eventos, conductor, captura manual, caché offline y documentación. `teams-core.js`, `publico.js`, los renderers de TV, el algoritmo de equipos, los algoritmos de sorteo del motor, los relojes y las operaciones del libro de puntos no se reescriben.

## Reproducir

```sh
git fetch origin
git switch fase2-motor-concurso
git pull --ff-only origin fase2-motor-concurso
npm test
python3 servidor_local.py --port 8094 --data-dir .datos-locales-ensayo-2b
```

En Windows usa `py` para iniciar el servidor. Abre `http://127.0.0.1:8094/index.html`. Para el ensayo completo, importa desde Inicio la sesión ficticia `evidencia/sesion-demo-exportada.json` y confirma. En Biblioteca pulsa **Cargar las 12 fichas acordadas**, revisa la vista previa, acepta la actualización de fichas existentes y confirma.

Crea/edita una ficha, guarda, restaura una revisión y exporta la biblioteca. En Inicio crea una reunión seleccionando las revisiones compatibles; puedes usar una colección compatible o elegir juegos manualmente. La guía detallada está en [GUIA_BIBLIOTECA.md](GUIA_BIBLIOTECA.md).

Con Playwright instalado como indica README:

```sh
npm run test:navigation
npm run test:library
```

Las capturas de Biblioteca se regeneran en `evidencia/fase2b/`. Galería: [evidencia/fase2b/README.md](evidencia/fase2b/README.md).

## Distribución pública y datos privados

La revisión automática de publicación rechazó un primer archivo de catálogo por incluir campos de instrucciones privadas, aun cuando las tarjetas estaban vacías. La distribución final usa únicamente plantillas públicas sin `privateInstructions`, `secrets` ni objetivos de cercanía; tampoco se publica el documento original del usuario. El adaptador local inicializa esos campos y el editor permite completarlos en la sesión privada. No se publicó el archivo rechazado ni su historial intermedio. La exportación privada que realiza el usuario sigue incluyendo sus tarjetas para respaldo.
