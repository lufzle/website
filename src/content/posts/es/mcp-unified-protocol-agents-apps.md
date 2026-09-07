---
title: "MCP como protocolo unificado para agentes y apps"
summary: "Cómo MCP conecta agentes y apps, qué cambió en la especificación de julio, y si un solo protocolo puede servir a ambos."
date: "6 ago 2026"
readTime: "12 min"
lede: "Hace dos años argumenté que las APIs, las UIs y las CLIs convergían en una sola superficie orientada al agente. La spec MCP de julio es lo más cerca que hemos estado de esa superficie."
order: 2
---

![Un diagrama arquitectónico en papel cuadriculado que muestra la entrada natural de usuario, la terminal CLI y el código convergiendo en un rombo ACI, que conecta hacia el sur mediante tuberías estructuradas con protocolos, herramientas y servicios de dominio](/assets/posts/mcp-unified-protocol-agents-apps/hero-architecture.jpg)


Publiqué ese argumento en septiembre de 2024
[[1]](https://dev.to/dariofarzati/from-apis-to-acis-the-next-evolution-in-software-interaction-4d39),
dos meses antes de que Anthropic lanzara el Model Context Protocol. Llamé a esa superficie
una Interfaz Conversacional de Aplicación: una única puerta basada en intención para desarrolladores,
usuarios finales y agentes, donde los consumidores llegan al dominio subyacente sin tener que
lidiar con tres pilas de integración separadas. MCP es lo que el ecosistema construyó, y su trayectoria
es evidencia práctica de que esta convergencia está en marcha.

## Dónde pertenece realmente el contrato

La afirmación de 2024 apuntaba a la fricción de las capas de traducción. En el software tradicional,
escribes un dominio, luego una API encima de él, luego una interfaz de usuario que llama a la API,
y a menudo una CLI para tareas operativas. Cada capa tiene sus propios autores, sintaxis y
complejidad accidental. Una porción significativa del tiempo de ingeniería se va en traducir
datos entre estas capas, un ejercicio que con frecuencia resulta más tedioso que la lógica de dominio
misma.

Los modelos de lenguaje comenzaron a colapsar ambos extremos de esa tubería. Un modelo podía aceptar
lenguaje natural no estructurado y emitir JSON estructurado, una tabla HTML o un formulario interactivo.
Eso parecía una interfaz capaz de acuñar otras interfaces bajo demanda. Lo tomé como una señal
de que la capa intermedia desaparecería: expresarías una intención, y el sistema interpretaría
la solicitud y devolvería el resultado en la forma que el llamador necesitara en ese momento.

El matiz que se pierde en esa descripción es dónde vive el contrato. En la arquitectura
tradicional, el contrato está expuesto hacia el norte a cada consumidor. El usuario humano
tiene que completar formularios visuales rígidos. El desarrollador externo tiene que leer
documentación de API, aprender endpoints y escribir SDKs clientes. El operador tiene que
memorizar flags de CLI. Cada llamador está obligado a entender la estructura interna de la
interfaz antes de hacer trabajo útil.

Una Interfaz Conversacional de Aplicación pliega esa exposición hacia el norte. El llamador
ya no necesita estudiar esquemas, endpoints o tipos de parámetros. Ya sea que el consumidor sea
una persona escribiendo una frase, un flujo de trabajo automatizado o un script externo,
la comunicación ocurre mediante intención.

El contrato retrocede hacia el sur. Dentro de los límites del sistema, la lógica de dominio
no puede operar sobre ambigüedad pura. Un libro mayor financiero requiere balances atómicos
de suma cero, las bases de datos requieren invariantes estrictos de esquema, y los sistemas
de seguridad requieren límites explícitos de autorización. El modelo actúa como el adaptador
universal entre los dos mundos, absorbiendo intención de alta entropía desde los llamadores
hacia el norte mientras ejecuta contra contratos deterministas y estructurados hacia el sur.

## El protocolo que apareció

MCP se lanzó en noviembre de 2024 como JSON-RPC para conectar modelos con sistemas externos. La
primera especificación ya tenía tres primitivas de servidor: herramientas que el modelo puede llamar,
recursos que puede leer y prompts que puede completar
[[2]](https://modelcontextprotocol.io/specification/2024-11-05). El ecosistema lo trató
como herramientas: los hosts sumaron una lista de funciones con argumentos en JSON Schema, y por
un año ese fue el producto.

Junio de 2025 agregó elicitación: un servidor, a mitad de llamada, puede pedirle al cliente que
recolecte entrada estructurada de una persona
[[3]](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation).
Noviembre sumó la elicitación en modo URL, para que la parte sensible de esa conversación pueda
salir del cliente y ocurrir en un navegador
[[4]](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation). El
mismo mes, se propuso MCP Apps como extensión: una herramienta puede apuntar a un recurso `ui://`,
y el host renderiza HTML en la conversación
[[5]](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/), lo que significa que
gráficos, formularios y reproductores viajan por la misma tubería que la herramienta.

La especificación de julio de 2026 fue la que hizo que esto pareciera infraestructura
[[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/). Retiraron el handshake de
`initialize` y la cabecera `Mcp-Session-Id`. Cada petición ahora lleva su versión de protocolo,
identidad de cliente y capacidades en `_meta`, de modo que cualquier solicitud puede caer
en cualquier instancia detrás de un balanceador de carga round-robin. Los nombres de método y
herramienta viajan en `Mcp-Method` y `Mcp-Name`, permitiendo que un gateway enrute y mida
sin abrir el cuerpo JSON. Un `tools/call` llamado `search` llega como esas dos cabeceras en un
`POST /mcp`, junto a `MCP-Protocol-Version: 2026-07-28`. Las respuestas de listado de herramientas,
prompts y recursos incluyen `ttlMs` y `cacheScope`. Las peticiones de servidor a cliente que
antes requerían un flujo abierto continuo pasaron a Multi Round-Trip Requests: el servidor
devuelve `resultType: "input_required"` con las preguntas que necesita responder, y el cliente
reintenta la llamada original adjuntando las respuestas.

Eso es un protocolo de petición/respuesta con cabeceras, sugerencias de caché y una llamada
opcional `server/discover`, lo que equivale a decir que es la web orientada a agentes. El blog
de MCP sitúa el tráfico del SDK de Nivel 1 cerca de quinientos millones de descargas mensuales,
con los SDKs de TypeScript y Python superando cada uno los mil millones en total
[[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/). Esos son sus números, y lo que
puedo ver sin ellos es la forma de la especificación: puedes poner esto detrás de un balanceador
de carga a propósito, algo que no podías decir con honestidad sobre un flujo de JSON-RPC con estado.

![Un diagrama arquitectónico en papel cuadriculado que muestra el estado actual de MCP: usuarios, agentes de IA y sistemas externos interactúan con el runtime del modelo y host mediante intención, mientras el backend del sistema declara herramientas y plantillas ui predeclaradas mediante un servidor MCP](/assets/posts/mcp-unified-protocol-agents-apps/the-present-mcp.jpg)

Esta arquitectura proporciona la tubería estandarizada hacia el sur que permite que una ACI
funcione. Las herramientas representan capacidades ejecutables, los recursos aportan documentos,
los prompts almacenan flujos de trabajo reutilizables, la elicitación maneja la clarificación
interactiva, y MCP Apps entrega pantallas visuales. El llamador nunca toca estos contratos
directamente; el modelo inspecciona el catálogo y traduce la intención en una ejecución precisa.
Lo que en 2024 parecía la eliminación de los contratos era en realidad su reubicación: ocultos
del llamador, estandarizados para el modelo y aplicados por el dominio.

## La autenticación sigue al lado

El post de julio es directo: la autorización es donde los implementadores pasan la mayor parte
de su tiempo de integración [[6]](https://blog.modelcontextprotocol.io/posts/2026-07-28/). La
revisión endurece el esquema de OAuth: los clientes deben validar el parámetro `iss` antes de
canjear un código, cerrando una confusión de servidores de autorización. Las credenciales quedan
vinculadas al emisor que las emitió. El Registro Dinámico de Clientes queda en desuso en favor
de Documentos de Metadatos de ID de Cliente, manteniendo DCR por un tiempo para que los clientes
existentes no fallen. Ese es trabajo real, y nada de eso es conversacional: el agente no se abre
paso conversando para obtener un token, y la autenticación sigue siendo un protocolo vecino
que completas antes de llamar herramientas.

La elicitación en modo URL admite la misma división. La especificación prohíbe usar la ruta de
formulario para contraseñas, claves de API, tokens o credenciales de pago. El usuario sale de
la superficie conversacional, hace la parte sensible en un navegador y regresa, lo cual es
la decisión de seguridad correcta y también la interfaz negándose a plegarse.

Escribí en 2024 sobre la privacidad como una pregunta abierta para los sistemas basados en
intención. Dos años después, las operaciones sensibles siguen canalizándose a través de URLs
estándar, y el protocolo está diseñado para mantener las credenciales completamente fuera del flujo
del agente.

## Estado que puedes ver

Descartar la sesión no vuelve a la aplicación sin estado. El consejo de la especificación es
acuñar un handle explícito desde una herramienta y hacer que el modelo lo devuelva como argumento.
El modelo puede ver el handle, lo cual es mejor que un id de sesión oculto en el transporte, y
también significa que el estado de la aplicación ahora vive en el prompt.

Si el modelo pierde el handle, pierdes el hilo; si alucina uno, obtienes una herramienta
confundida. Un desarrollador depurando esto termina preguntándole al modelo qué cree que es el
handle, algo que parecía impensable en 2024 y hoy es rutinario.

El boceto original de ACI trataba al estado como algo que la interfaz guardaría por ti, del modo
en que lo hace una conversación. MCP trata al estado como datos, lo cual es más predecible,
y también más trabajo, y ese trabajo recae en el modelo, que es la parte menos equipada para
garantizar la retención. Las Tasks, que comenzaron como experimento y ahora viven en una extensión,
son la versión duradera de ese compromiso: un handle duradero, un bucle de consulta periódica y
una actualización que sigue anclando la gestión de estado a un identificador explícito.

## Quién escribe la pantalla

Escribí que cada usuario obtendría la interfaz que necesitara, generada en el momento de la
solicitud, visual, de voz o de texto, con localización, accesibilidad y la elección entre un
panel de control y una frase delegada al modelo.

MCP Apps actualmente adopta un enfoque más controlado: HTML predeclarado donde el servidor
crea un recurso `ui://`, la herramienta lo referencia en sus metadatos y el host lo renderiza.
Los esquemas de elicitación se mantienen como estructuras planas de tipos primitivos para que el
cliente pueda generar formularios de manera confiable. Alguien todavía diseña los componentes,
y el protocolo los transporta.

![Un diagrama arquitectónico en papel cuadriculado que muestra la visión de destino de ACI: usuarios y agentes de IA interactúan con una capa central de Interfaz Conversacional de Aplicación que sintetiza dinámicamente interfaces ad-hoc y APIs ad-hoc en tiempo de ejecución contra la lógica de dominio del backend](/assets/posts/mcp-unified-protocol-agents-apps/the-vision-aci.jpg)

El HTML predeclarado es el escalón necesario. Distribuir recursos `ui://` por la misma tubería
que las herramientas establece la plomería de renderizado mientras los modelos generativos sigan
siendo demasiado lentos y propensos a errores para sintetizar widgets interactivos de manera segura
en cada interacción. La visión de interfaces generativas no estaba equivocada, sino adelantada a
los costos de ejecución. Estandarizar primero la capa de transporte significa que a medida que la
síntesis de UI en tiempo real madure, pasar de plantillas predeclaradas a renderizado sobre la marcha
se convierte en una actualización interna del cliente sin alterar el cable del protocolo.

Un manejador de intención sin métodos nombrados sigue siendo impracticable para producción de alto
volumen. Envolver un modelo alrededor de cada operación de dominio rutinaria agrega costo de cómputo
y latencia que el código determinista evita. MCP ganó adopción porque las herramientas nombradas
con esquemas estructurados se pueden almacenar en caché, enrutar en el borde, autorizar con OAuth
y verificar con pruebas automatizadas. El lanzamiento de julio optimizó esa base para tráfico
de producción sin abandonar el modelo unificado. Las herramientas de terminal y los IDEs tampoco
han desaparecido; sus operadores ahora interactúan con servidores MCP a través de los mismos
endpoints exactos que consumen los agentes remotos.

## Lo que mantendría

Sigo creyendo que una sola superficie es la apuesta correcta. Desarrolladores, usuarios y agentes
no deberían necesitar tres pilas para llegar al mismo dominio. MCP es la versión funcional más
cercana a esa apuesta, y la especificación de julio es la primera que desplegaría del modo en que
despliego una API HTTP.

La lección de los últimos dos años es que los contratos nunca fueron el problema. El desperdicio
provenía de exponer tres contratos duplicados hacia el norte a tres audiencias distintas.
Al mover el contrato hacia el sur hacia un protocolo encapsulado y legible por máquinas, la
superficie orientada hacia afuera se vuelve natural, unificada y guiada por la intención.

Las bajas de funciones de julio son una versión pequeña de la misma lección. Roots, sampling
y logging tienen un reloj de doce meses, y el código nuevo no debería adoptarlos. Se permite que
el protocolo se reduzca a propósito, que es como sabes que alguien realmente lo está usando.

## Fuentes

1. Dario Farzati. [From APIs to ACIs: The Next Evolution in Software Interaction](https://dev.to/dariofarzati/from-apis-to-acis-the-next-evolution-in-software-interaction-4d39), DEV, septiembre de 2024.
2. Model Context Protocol. [Specification, 2024-11-05](https://modelcontextprotocol.io/specification/2024-11-05).
3. Model Context Protocol. [Elicitation, 2025-06-18](https://modelcontextprotocol.io/specification/2025-06-18/client/elicitation).
4. Model Context Protocol. [Elicitation, 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25/client/elicitation).
5. Model Context Protocol. [MCP Apps: Extending servers with interactive user interfaces](https://blog.modelcontextprotocol.io/posts/2025-11-21-mcp-apps/), 21 de noviembre de 2025.
6. Model Context Protocol. [The 2026-07-28 Specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/), 28 de julio de 2026.
