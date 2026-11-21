# Corrección de experiencia de usuario · fase 2A

Fecha: 16 de noviembre de 2026, America/Mexico_City. Rama: `fase2-motor-concurso`.
Base inspeccionada: `a1fffd85910fb2a621169095bdcb9e9c7a94a836`.

## Implementado y probado

- Seis secciones principales; solo una visible. Menú lateral en escritorio y seis botones compactos en celular, con `aria-current` y foco en el título de la sección al navegar.
- Equipos con tres pasos internos independientes: configurar, bombos/sorteo, revisión/confirmación.
- Inicio concentra creación, continuación, consulta de eventos guardados, acceso a TV, configuración de presentación, conexión Wi-Fi y respaldo completo.
- Concurso contiene una ronda completa y solamente los controles correspondientes a su estado. Reglas, tarjeta, ajustes y correcciones se despliegan cuando se necesitan. Registro, equipos, creación y auditoría completa están en sus propias secciones.
- Resultados muestra marcador, posiciones e historial contable; la consulta de un evento histórico no lo reactiva ni cambia el evento abierto.
- Biblioteca muestra explícitamente una reserva para 2B; no hay administración simulada.
- Evento y estado permanecen en una franja fija. Las tarjetas privadas se pliegan al abandonar Concurso.
- Cambiar de sección conserva los nodos de formulario, incluidos campos sin enviar; no ejecuta operaciones del motor, no publica cambios ni escribe revisiones LAN.
- Se recupera sección/paso por pestaña, separados de la sesión de partida. El cronómetro conserva el plazo real durante navegación y recarga.
- Cachés de conductor/público actualizadas para servir navegación y CSS offline. La TV conserva su HTML, renderer y grafo público independientes.

## Pruebas ejecutadas

**91 pruebas aprobadas: 87 en `npm test` y 4 escenarios de navegador.**

| Suite | Cantidad | Resultado |
| --- | ---: | --- |
| Dominio anterior | 26 | Aprobadas |
| Equipos fase 1 | 19 | Aprobadas |
| Motor de concurso | 26 | Aprobadas |
| LAN original + concurso | 14 | Aprobadas |
| Navegación sin dependencias | 2 | Aprobadas |
| Escenarios Chromium/Playwright | 4 | Aprobados |

Los 85 casos anteriores se ejecutaron antes y después del cambio. No se modificaron ni eliminaron sus pruebas. Salidas finales: [unitarias](evidencia/navegacion/pruebas-unitarias.txt) y [navegador](evidencia/navegacion/pruebas-navegador.txt).

### Escenarios de navegador

1. **Escritorio 1440×1000:** recorrer las seis secciones deja la sesión idéntica; un borrador sobrevive a navegación; solo un paso de equipos visible; ronda desde Concurso con sorteo, representantes, reglas, frase privada personalizada, inicio/pausa/reanudación, cuatro turnos, revisión y confirmación. Un acierto produce exactamente 100 puntos. Navegar y recargar durante el reloj conserva el plazo absoluto. Uso de Enter en el menú. TV separada sin tarjeta privada.
2. **Celular 390×844 y 320×740:** menú compacto, seis secciones, sin desbordamiento horizontal, conservación de tarjeta sin enviar al navegar y reloj activo sin cambios; cierre de la tarjeta al salir de Concurso. Las capturas se producen a 390×844.
3. **Wi-Fi, contextos de navegador separados:** anfitrión y segundo conductor móvil autenticado contra un servidor temporal. Navegar no modifica el estado ni la revisión. El segundo conductor opera la ronda; el anfitrión y la API pública reciben el reloj activo. Recargar conserva Concurso y el reloj. La TV abre su documento independiente.
4. **Offline:** tras preparar la caché, se simula pérdida total de conexión. Recargar recupera estilos, módulos, sección y paso de equipos; navegación posterior conserva la sesión.

Los servidores se crean en puertos temporales con datos ficticios Prueba 01–17. No se usó ni modificó la partida real. La prueba Wi-Fi reproduce clientes separados, sin afirmar uso de un celular físico ni conexión por radio.

El primer intento con el ejecutable Chromium del sistema no pudo arrancar por restricciones de sockets del entorno. Se ejecutó la suite con Chromium Headless Shell (`@sparticuz/chromium` 153) y Playwright 1.62.1; todos los escenarios finales pasaron. No se cambió la seguridad de la aplicación para probarla. Un selector ambiguo en la primera versión del test de pasos se corrigió antes de la ejecución final.

## Código y límites

No se modificaron `contest-core.js`, `teams-core.js`, `clock-sync.js`, `lan-host.js`, `lan-public.js`, `concurso_publico.py`, `publico.js` ni el catálogo. En `servidor_local.py` solo se añadió el CSS nuevo a los recursos estáticos permitidos; revisiones, autenticación y persistencia permanecen iguales.

La navegación usa `hidden` para excluir paneles del diseño y del foco. No se limita a anclas de desplazamiento. La preferencia de sección se guarda en sessionStorage y no se exporta como resultado del evento. Los campos sin enviar se conservan al navegar; aplicar otra operación que vuelva a renderizar el panel o recargar conserva los datos guardados, no promete persistir borradores sin enviar.

## Pendiente de validación manual

- Aprobación visual y operativa del usuario.
- Teléfono y TV físicos, Safari/iOS, lector de pantalla y pruebas con adultos mayores.
- Audio en altavoces reales y todas las combinaciones de resolución/zoom.

## Diseñado pero no implementado

Administrador de biblioteca 2B, Duelo de Generaciones 2C y ceremonia 2D. No se inició ninguna de esas etapas. Main no se modifica ni se integra sin aprobación.

## Reproducir y revisar

```sh
git fetch origin
git switch fase2-motor-concurso
git pull --ff-only origin fase2-motor-concurso
npm test
python3 servidor_local.py --port 8094 --data-dir .datos-locales-revision-ux
```

En Windows usa `py` en lugar de `python3`. Abre `http://127.0.0.1:8094/index.html`. En **Inicio → Importar sesión** restaura `evidencia/sesion-demo-exportada.json` y confirma. En **Nueva reunión**, acepta la propuesta y crea el evento. Se abrirá **Concurso**: completa los cuatro turnos sin entrar a Participantes o Equipos. Abre la TV en `publico.html`. La carpeta y el puerto distintos aíslan este ensayo de la sesión habitual.

Para repetir la suite visual, instala Playwright opcionalmente como indica README y ejecuta `npm run test:navigation`. Las capturas se regeneran en `evidencia/navegacion/`.

Galería: [evidencia/navegacion/README.md](evidencia/navegacion/README.md).
