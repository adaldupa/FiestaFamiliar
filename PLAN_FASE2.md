# Plan de fase 2A

Actualiza la planificación inicial del commit `7497cdd`, conservada en el historial de la rama. La verificación efectiva de esta implementación se documenta en `VERIFICACION_FASE2.md`.

Rama: `fase2-motor-concurso`, desde `main` 2.1.0. No integrar a main ni continuar 2B–2D sin aprobación.

1. Conservar registro/equipos y añadir un módulo de concurso dentro de la sesión v2, sin borrar datos anteriores.
2. Catálogo versionado inicial de un juego: El actor dramático. Cada evento y ronda guarda una copia de reglas/puntuación; administrador de biblioteca reservado para 2B.
3. Máquina de estados: sorteo sembrado persistente, representantes voluntarios, reglas, turnos por equipo, cronómetro, captura, revisión, confirmación y marcador. Libro de puntos con anulaciones y correcciones enlazadas.
4. Proyecciones por listas blancas independientes en navegador y servidor. Reloj basado en referencia del anfitrión; conservar revisiones para conflictos Wi-Fi.
5. Probar las 54 regresiones y el motor nuevo. Demostrar una ronda completa, recarga, corrección/deshacer y exclusión de frases en público. Publicar solo la rama.

## Estructura

- `src/game-model.js`: contrato del catálogo versionado.
- `src/contest-core.js`: eventos, estados, ruleta, representantes, turnos, reloj y libro de puntos.
- `src/contest-host.js`: controles privados integrados al conductor existente.
- `src/contest-show.js`: renderer público, sin imports del dominio privado.
- `src/teams-core.js`: validación/persistencia compatible con fase 1 y nueva proyección.
- `servidor_local.py`: proyección pública independiente y referencia horaria local.
- `tests/contest.test.js`, `tests/test_contest_lan.py`: motor, compatibilidad, sincronización y privacidad.

La demostración se ejecutará con datos ficticios en otro puerto y carpeta de datos para conservar la aplicación estable y sus sesiones reales.

## Corrección de navegación de 2A

Separar Inicio, Participantes, Equipos, Concurso, Biblioteca reservada y Resultados, con pasos internos de equipos. Mantener estado de interfaz por dispositivo fuera del motor. Sin modificaciones a sorteos, puntos, esquema de sesión o sincronización. Verificación específica en VERIFICACION_NAVEGACION.md. No iniciar 2B.

## Autorización posterior: fase 2B

El 17 de noviembre de 2026 el usuario aprobó la navegación y autorizó el administrador de biblioteca. El alcance actual está en PLAN_FASE2B.md y la evidencia en VERIFICACION_FASE2B.md. Las restricciones de no iniciar 2B descritas arriba corresponden al cierre anterior de 2A; no se autorizaron 2C, 2D ni integrar main.
