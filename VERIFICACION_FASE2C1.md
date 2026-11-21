# Verificación Fase 2C.1

Fecha: 17 de noviembre de 2026. Rama: `fase2-motor-concurso`. Versión: `2.4.0-fase2c1`.

## Implementado y probado

145 pruebas aprobadas, sin fallos ni omisiones:

| Suite | Pruebas | Evidencia |
| --- | ---: | --- |
| Dominio Node: núcleo, equipos, concurso, navegación, Biblioteca y rondas | 108 | [Registro](evidencia/fase2c1/pruebas-dominio-servidor.txt) |
| Python: servidor LAN, conflictos, importación, privacidad y nuevas etapas | 24 | Mismo registro |
| Navegación real en navegador | 4 | [Registro](evidencia/fase2c1/pruebas-navegacion.txt) |
| Biblioteca real en navegador | 5 | [Registro](evidencia/fase2c1/pruebas-biblioteca.txt) |
| Ruleta, recuperación y conductor/TV LAN | 4 | [Registro](evidencia/fase2c1/pruebas-rondas.txt) |

Se conservaron las 120 pruebas de la entrega 2B, incluidas las regresiones anteriores. Se agregaron 16 de dominio, 5 de servidor y 4 de navegador. Los cambios en pruebas antiguas actualizan el paso explícito de presentación y la dependencia pública de la rueda; conservan las aserciones de integridad y privacidad.

Verificado: selección reproducible, doce candidatos existentes, exclusión de inactivos/archivados, repetición autorizada, Roba permanente, doble giro, siete etapas, confirmación explícita para cerrar sin resultados, versiones congeladas, puntuación real anterior sin duplicar, relojes/pausas, continuidad tras recarga, dos conductores con revisión optimista, DTO JS/Python equivalente y ausencia de secretos en TV. Las pruebas crean servidores y sesiones ficticias aisladas; no modifican la Biblioteca de producción.

Comandos ejecutados: `npm test`, `npm run test:navigation`, `npm run test:library`, `npm run test:rounds`, con `CHROMIUM_PATH=/tmp/chromium` para las suites visuales. Chromium 153 y Playwright 1.62.1. Las suites de navegación y Biblioteca guardaron sus capturas temporales aparte para conservar la evidencia histórica. Se revisaron capturas de instrucciones de TV y ejecución pendiente móvil. `git diff --check` sin incidencias.

## Evidencia visual

[Galería y capturas](evidencia/fase2c1/README.md). Datos ficticios. Tamaños de escritorio 1440×1000 y móvil 390×844; pruebas de desbordamiento también a 320 px. TV con presentación 16:9 dentro de la ventana de prueba.

## Límites y pendientes

No se implementan evaluadores de posición, conteo, cercanía ni premios directos. Su infraestructura está registrada y su ejecución se señala como pendiente; no permite resultados ficticios. El cierre explícito sin puntos conserva resultados parciales reales cuando existen, pero no confirma ni asigna una puntuación incompleta. La revisión original compatible del actor conserva el motor de puntos fijos; no convierte su ficha nueva en un motor de posición operativo.

Pendiente de validación manual: Android/iOS, TV físicos y red Wi-Fi familiar. Las pruebas LAN usaron contextos separados de navegador y servidor real local; no acreditan calidad de radio ni dispositivos externos. No se implementaron Duelo de Generaciones, premiación ni las siguientes entregas. No se sobrescribió el catálogo ni se fusionó a main.
