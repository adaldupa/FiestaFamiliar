# Fase 2B — administrador de biblioteca

Autorizada por el usuario el 17 de noviembre de 2026. Navegación de 2A aprobada. Trabajar en `fase2-motor-concurso`; no integrar main ni iniciar 2C o 2D sin autorización.

## Alcance

Administración funcional de fichas: crear, editar, duplicar, activar/desactivar, archivar, buscar, filtrar, importar/exportar, conservar revisiones y restaurar como una revisión nueva. Sin eliminación permanente. Colecciones de versiones para reuniones y selección de revisiones compatibles al crear eventos.

El documento recibido `BIBLIOTECA_MINIJUEGOS_FIESTA_NAVIDENA.md` es la fuente de las doce fichas actuales. El documento original permanece con el usuario; no se distribuye en el repositorio. La carga del catálogo será explícita, mediante vista previa y confirmación, conservando todas las fichas, revisiones y eventos existentes.

## Diferencia entre ficha y dinámica ejecutable

Las doce fichas son configurables en Biblioteca. Los motores de clasificación por tiempo, conteos, cercanía y robos no se desarrollan en 2B. Esas fichas llevan `implementation: planned`. Los juegos genéricos por turnos con puntuación fija o manual utilizan el motor existente. El actor de 2A continúa disponible por su revisión original; la revisión nueva por tiempo se mantiene separada.

La marca repetible se registra como configuración futura. No se cambia la regla actual de no repetir sin autorización. Roba y Gana es permanente y repetible en el catálogo; su dinámica de cartas se reserva para 2C.

## Estructura

- `src/library-core.js`: operaciones atómicas, revisiones, colecciones, importación y filtros.
- `src/library-host.js`, `library.css`: administrador privado dentro de la sección Biblioteca.
- `src/game-model.js`: validación compatible con fichas antiguas y metadatos de 2B.
- `biblioteca_validacion.py`: validación de biblioteca al guardar por LAN.
- `catalogo/fichas-publicas-fase2b.json`: doce fichas al esquema real, sin bancos ficticios.
- `tests/library.test.js`, `tests/test_library_lan.py`, `tests/library.browser.cjs`: dominio, persistencia, privacidad y flujos reales.

## Límites deliberados

No cerrar reglas pendientes del documento, no generar todavía los bancos de 100/300 tarjetas, no implementar Duelo, robos ni premiación. Los tiempos no definidos permanecen nulos en fichas de dinámicas futuras. Los límites de participante son configurables; cada evento conserva sus equipos e identidades anteriores.
