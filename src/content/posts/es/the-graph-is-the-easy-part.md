---
title: "El grafo es la parte fácil"
summary: "Una breve entrevista produjo dos registros incompatibles, y ambos pasaron cada verificación. Lo que dos semanas de fallos me enseñaron sobre un grafo que conoce sus límites."
date: "28 ago 2026"
readTime: "13 min"
lede: "El escáner de patio, el lector de portón y «el arco» eran el mismo dispositivo. Dos extracciones de las mismas siete intervenciones no coincidieron. Ambas pasaron cada verificación."
order: 1
---

![Un grafo ordenado de nodos y aristas en tinta negra sobre papel cuadriculado, con una arista roja punteada que lleva a un nodo apenas perfilado abajo a la derecha](/assets/posts/the-graph-is-the-easy-part/hero-graph.png)

El ingeniero lo llamaba el escáner de patio. Era un Zebra FX9600 en el portón, leyendo las
etiquetas de cada palé que salía. El dueño lo llamaba el lector de portón. Parte del
equipo del almacén lo llamaba «el arco». La entrevista dejó un punto inusualmente claro: los
tres nombres se referían al mismo dispositivo.

Usé esa entrevista de siete intervenciones para probar un sistema que había construido en una tarde.
Tenía registros, nodos, aristas, un índice vectorial y una consulta que devolvía una respuesta plausible.
Luego pasé la entrevista por el proceso de extracción dos veces.

Las dos corridas discreparon siete veces a lo largo de tres registros. Dos afirmaciones estaban
redactadas de forma distinta, y cada corrida encontró afirmaciones que la otra omitió. Una dividió una
idea que la otra mantuvo entera. Una creó un registro y un enlace que no existían en la otra corrida.
La diferencia más grave era menor: una sola cosa había entrado con dos nombres.

Ambas versiones se ajustaban al mismo registro y cada una era internamente consistente.
Cada verificación estaba en verde.

Estoy construyendo algo que llamaré el registro: un sistema que entrevista a personas, contrasta
afirmaciones contra sus fuentes y responde preguntas sobre lo que ha aprendido. Los modelos ayudan a
extraer afirmaciones, buscar evidencia y juzgar si una fuente las respalda. Nunca escriben directamente
la respuesta que ve un lector. Cada valor impreso proviene de un resolvedor determinista que lee el
frontmatter registrado.

Esa separación buscaba hacer fiables las respuestas. La doble extracción demostró lo que no podía
hacer. Cualquiera de los dos conjuntos de registros viajaría por el resto del sistema limpiamente,
aun cuando describían la conversación de manera diferente. El determinismo podía preservar un error
con la misma fidelidad con la que preservaba un hecho.

## Lo que las verificaciones nunca preguntaron

Los grafos son generosos. Dales un nodo, una arista o una propiedad válida y la almacenarán. No saben
que dos identificadores nombran la misma cosa, que cinco fuentes se copiaron entre sí, o que una nueva
afirmación heredó una fecha antigua. Esos son hechos sobre el mundo exterior al grafo.

Mis verificaciones conocían el registro y rechazaban predicados desconocidos, evidencia malformada,
relaciones ilegales y afirmaciones contradictorias activas en una misma ranura. Podían determinar si
un registro tenía una estructura válida. El experimento de extracción planteó una pregunta distinta:
¿seguía esa estructura haciendo referencia al mundo del que provenía?

La respuesta era imposible de saber a partir de cualquiera de los dos grafos por separado. La herramienta
de convergencia podía señalar que las dos corridas diferían, pero no podía elegir la correcta. Esa
elección exige conocimiento del dominio o de otra fuente, por lo que le corresponde a una persona.

Esta se convirtió en la prueba para cada fallo posterior. Observé qué había pasado, qué seguía mal y
qué decisión había tomado silenciosamente la maquinaria sin tener autoridad para hacerlo.

## Una sola cosa ingresó dos veces

Un nodo duplicado es un fallo peculiar porque nada tiene por qué romperse. Busca cualquiera de las
dos versiones y el resultado parece razonable. Recorre el grafo desde cualquiera de ellas y sus vecinos
tienen sentido. El corpus simplemente está equivocado sobre cuántas cosas existen.

La literatura sobre extracción llama a esto canonicalización. Una base de conocimiento abierta no sabe
por defecto que «Barack Obama» y «Obama» se refieren a una misma persona, por lo que puede almacenar a
ambos como entidades separadas [[6]](https://arxiv.org/abs/1902.00172). Métodos más recientes mejoran
la agrupación en algunos conjuntos de datos y empatan con métodos anteriores en otros
[[7]](https://aclanthology.org/2021.emnlp-main.811/). Esos resultados miden qué tan bien se agrupan
los nombres. No demuestran que las respuestas resultantes mejoren.

Los sistemas en producción toman decisiones distintas. Un método de memoria en grafo le indica en su
prompt de resolución que los duplicados pueden tener nombres diferentes
[[8]](https://arxiv.org/abs/2501.13956). GraphRAG de Microsoft fusiona entidades con el mismo título y
tipo, y su artículo describe coincidencias exactas de cadenas
[[9]](https://microsoft.github.io/graphrag/index/default_dataflow/)
[[4]](https://arxiv.org/abs/2404.16130). El artículo de Mem0 describe el emparejamiento de nodos mediante
similitud de incrustaciones [[22]](https://arxiv.org/abs/2504.19413), mientras que su documentación
actual de código abierto describe un hash de contenido para duplicados exactos y señala que la memoria de
grafo se eliminó de esa edición
[[23]](https://docs.mem0.ai/migration/oss-v2-to-v3). Las cadenas exactas pueden omitir alias, mientras que
la similitud puede unir dos cosas distintas; cualquiera de los dos errores puede permanecer invisible.

La medicina y la biología me ofrecieron un mejor modelo. El Metatesauro UMLS está organizado en torno
a conceptos y conecta los múltiples nombres usados para un mismo significado a través de casi doscientos
vocabularios
[[10]](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/index.html).
SNOMED CT mantiene un concepto estable separado de su nombre completo, término preferido y sinónimos; el
término preferido puede variar según el idioma
[[11]](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/synonym).
La Gene Ontology va más allá y tipifica un sinónimo como exacto, amplio, restringido o relacionado
[[12]](https://geneontology.org/docs/ontology-documentation/).

![Dos nodos circulares con el mismo abanico de aristas, unidos por una llave en lápiz gris y un signo de interrogación](/assets/posts/the-graph-is-the-easy-part/two-nodes-one-thing.png)

La distinción útil es sencilla: un concepto tiene una identidad; un nombre es una de las formas en que
la gente se refiere a él. El modelado es maduro, pero la resolución automática sigue siendo incierta.

Tomé el camino conservador. Antes de crear un concepto nuevo, una comprobación léxica compara su nombre,
sus alias y su resumen con los conceptos que ya existen en el registro. Un alias exacto siempre se propone
como coincidencia; la superposición en nombres o resúmenes puede sugerir otro candidato. La comprobación
advierte sin bloquear ni fusionar. Una persona toma y registra la decisión.

Fellegi y Sunter llamaron a esto la clase de «posible enlace» en su teoría de vinculación de registros de
1969 [[13]](https://www.cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf). Mi comprobación es solo
un sensor para ese estado. Todavía puede pasar por alto dos sinónimos sin coincidencia léxica, incluidos
«escáner de patio» y «lector de portón» si sus resúmenes no revelan la conexión. La incertidumbre queda a
la vista, pero la resolución de entidades sigue siendo una tarea abierta.

## El detector que eliminé

La identidad volvió a fallar cuando hice el esquema más expresivo.

En su diseño original, un sujeto contenía una sola afirmación activa por cada predicado. Necesitaba que
un mismo sujeto albergara varias facetas de un predicado, de modo que añadí un valor `aspect` dentro de su
ámbito. La primera modificación tomó cerca de una hora. Registros que antes habrían colisionado ahora podían
coexistir bajo distintos valores de aspecto, tal como se esperaba.

Una de esas colisiones había estado cumpliendo una función extra. Dos reglas no relacionadas habían caído
en un mismo registro. Sin un aspecto que las separara, la restricción de unicidad rechazó el par como una
contradicción no declarada. Ese rechazo era la única señal de que el registro podía contener dos conceptos.
Una vez que cada regla tuvo su propio aspecto, ambas superaron la validación.

Todo seguía en verde.

Dejé una nota en la restricción porque su segundo trabajo era fácil de pasar por alto:

> Una clave de aspecto compra la capacidad de sostener varias facetas de un sujeto y la paga apagando la señal
> de que el sujeto estaba sobrecargado.

Una restricción puede aplicar la regla que diseñaste y exponer un error de modelado que nunca nombraste.
Ese segundo servicio es frágil porque nadie lo posee. Agregas un discriminador y la colisión desaparece;
meses después, el costo puede ser un corpus de conceptos divididos o combinados de formas que ninguna
consulta puede detectar.

Conservé el campo de ámbito, cerré la lista de valores de aspecto permitidos y agregué una comprobación
independiente que compara afirmaciones entre ellos. La restricción original había provisto ambos comportamientos
de forma gratuita. Hacerlos explícitos costó más código, pero también le dio a cada uno un nombre y un responsable.

![Un molinete con un contador inalterado junto a un portón lateral de madera abierto etiquetado scope, con figuras caminando a través de él](/assets/posts/the-graph-is-the-easy-part/the-side-gate.png)

## Noventa segundos se convirtieron en dos días

El siguiente fallo apareció en la frase que lee una persona.

Registré una decisión que reemplazaba una afirmación anterior en la misma ranura. Noventa segundos después,
le pregunté al registro al respecto. La respuesta contenía el texto de la nueva afirmación seguido de
«Registrado hace 2 días». La vista de traza mostraba la afirmación correcta y la hora correcta.

El resolvedor había seleccionado la nueva aserción. La interfaz tomó entonces la fecha de registro de la
primera aserción de la ranura, que era la que acababa de ser reemplazada. Los datos almacenados eran correctos
y la resolución era correcta. La respuesta hacía que el conocimiento fresco pareciera obsoleto, que es la forma
en que la información útil termina siendo ignorada.

Los investigadores en bases de datos temporales distinguen dos relojes. El *tiempo válido* indica cuándo un
hecho tiene vigencia en el mundo. El *tiempo de transacción* indica cuándo la base de datos aprendió o registró
ese hecho [[14]](https://www2.cs.arizona.edu/~rts/pubs/TKDEJan99.pdf). Un arancel puede entrar en vigor en
enero y llegar al registro en marzo. Un auditor puede preguntar más adelante qué creía el sistema en febrero
acerca del arancel de enero. Una sola marca de tiempo no puede responder a esa pregunta.

Las bases de datos bitemporales preservan la distinción también durante el borrado. XTDB cierra el intervalo
de tiempo del sistema de la versión anterior para que las versiones previas sigan disponibles
[[15]](https://docs.xtdb.com/about/time-in-xtdb.html). Datomic registra una retractación donde una base de
datos convencional eliminaría datos [[16]](https://docs.datomic.com/datomic-overview.html). El pasado sigue
siendo accesible porque cerrar un intervalo preserva el registro.

![Dos líneas de tiempo superpuestas: un hecho válido desde enero y una barra más delgada para cuando el registro lo aprendió en marzo, cortadas por una línea vertical de auditoría](/assets/posts/the-graph-is-the-easy-part/two-clocks-one-fact.png)

Mi prueba de conformidad no detectó el fallo de visualización. Ejecutó la nueva implementación junto a su
referencia y exigió una salida idéntica. La referencia contenía la misma línea defectuosa, de modo que ambas
implementaciones coincidieron byte por byte. Todo seguía en verde. Una comprobación de divergencia no puede
exponer un defecto compartido por ambas partes.

La respuesta toma ahora `recorded_at` de la aserción devuelta por el resolvedor. Cada marca de tiempo de
transacción proviene del reloj del sistema. El tiempo válido sigue siendo una afirmación independiente sobre
el mundo y proviene de la evidencia sobre cuándo tuvo vigencia el hecho.

## Cinco testigos, una sola fuente

El acuerdo parecía más seguro hasta que seguí las aristas hacia su origen.

Un grafo puede mostrar cinco fuentes que respaldan una misma afirmación. Si cuatro copiaron a la quinta,
hay una sola observación con cinco URLs. Contar las aristas convierte la repetición en una aparente
corroboración.

Los investigadores modelaron la dependencia entre fuentes ya en 2009. Un valor falso puede propagarse
mediante copias, tras lo cual la concordancia aporta mucha menos evidencia
[[19]](http://www.vldb.org/pvldb/vol2/vldb09-pvldb47.pdf). Por lo tanto, el resolvedor cuenta fuentes
independientes detrás del respaldo. Las afirmaciones o enlaces repetidos no aumentan esa cuenta.

![Un nodo central de afirmación con cinco aristas entrantes, cuatro de los nodos de origen dibujados como fotocopias descoloridas del quinto](/assets/posts/the-graph-is-the-easy-part/five-edges-one-source.png)

El mismo problema se vuelve más difícil cuando las fuentes discrepan genuinamente. Una regla de «el último
en escribir gana» descarta una aserción cuando llega un reemplazo. Promediar crea un valor que nadie
proporcionó.
Una puntuación de confianza en la interfaz parece más prudente. En una evaluación, dos métodos consagrados
de descubrimiento de la verdad produjeron una tasa de falsos positivos de 1,0 en ambos conjuntos de datos;
predijeron que cada valor era verdadero [[17]](http://vldb.org/pvldb/vol5/p550_bozhao_vldb2012.pdf).

Convertí la contradicción en un estado dentro del registro. Una ranura contiene una afirmación resuelta o
un resultado explícito `UNKNOWN_CONTRADICTED` con los valores en competencia adjuntos. Los estándares
analíticos de la comunidad de inteligencia exigen que los analistas consideren información contraria y
expongan al lector las diferencias significativas de juicio
[[18]](https://www.dni.gov/files/documents/ICD/ICD-203.pdf).

Esto importa antes de que aparezca un atacante, pero un atacante evidencia el costo con crudeza. Un estudio
sobre envenenamiento de recuperación alcanzó una tasa de éxito de ataque del 90 por ciento con cinco textos
maliciosos por pregunta objetivo en una base de datos de millones
[[21]](https://arxiv.org/abs/2402.07867). Una página descargada, una afirmación de entrevista y una decisión
de esquema ingresan con distinta autoridad. Si se convierten en nodos intercambiables, esa distinción ya se
ha perdido.

## El nodo que nunca se creó

Algunos fallos quedan fuera de cualquier restricción mejorada.

Construí una vista de evaluación que colocaba cada respuesta junto a todos los registros pertinentes para su
pregunta. En la primera lectura, encontró una respuesta que contaba con fuentes, era estable y guardaba
silencio sobre un tercio de lo consultado. La pregunta solicitaba qué se había respondido o descartado desde un
punto anterior en el tiempo. La respuesta solo informaba el estado actual. Nada en ella era falso. Faltaba una
parte necesaria, y cada verificación mecánica dio el visto bueno.

Puedo consultar afirmaciones marcadas como no verificadas, contradictorias u obsoletas. No puedo consultar un
nodo que nunca se creó. Los investigadores en bases de conocimiento describen la exhaustividad como una
propiedad de una pregunta concreta, porque ninguna base de conocimiento práctica puede abarcar la verdad
completa [[20]](https://www.akbc.ws/2016/papers/10_Paper.pdf).

Esto significa que una métrica de cobertura necesita un conjunto esperado proveniente de fuera del grafo. Sin
ese denominador, el sistema compara lo que encontró con lo que encontró. Un porcentaje alto no dice nada sobre
el tercio ausente.

## El límite que dejé de intentar borrar

Los fallos empezaron a tener sentido cuando le resté autoridad al grafo.

El registro canónico reside ahora en archivos de texto plano. Las afirmaciones conservan su evidencia, su
estado de revisión, su intervalo de validez y su hora de registro. Una afirmación modificada se convierte en
una nueva aserción vinculada a la anterior. Los sistemas de preservación han utilizado este modelo de objetos
y relaciones durante décadas [[1]](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf).

El registro también puede retener una afirmación que no ha sido verificada. Marca la evidencia como no
comprobada o no verificada y se lo comunica al lector. Esta negativa es más precisa y más útil que el borrado:
una afirmación sin comprobar no puede adquirir silenciosamente el estatus de un hecho.

El grafo es una proyección de esos archivos. Puede descartarse y reconstruirse, partición por partición. Cuando
una afirmación se retira, la reconstrucción elimina su arista proyectada sin reescribir el registro histórico.

![Un grafo translúcido flotando sobre una fila de archivos de texto sólidos, con una sola flecha de reconstrucción que apunta hacia arriba desde los archivos](/assets/posts/the-graph-is-the-easy-part/two-layer-diagram.png)

El límite se mantiene a lo largo del proceso de respuesta. El índice devuelve claves de registros al
resolvedor, que lee los registros y selecciona las afirmaciones activas de acuerdo con su evidencia y su
tiempo. Una vez seleccionadas las mismas claves, su salida es idéntica byte a byte tanto si el grafo está
disponible como si está detenido. El índice puede modificar qué registros se encuentran; no puede alterar lo
que dice un registro seleccionado.

Ese rol más acotado para el grafo también transformó la recuperación. Había planeado comenzar cada búsqueda
recorriendo el grafo. Los resultados publicados desaconsejaban convertir eso en el estándar universal. En
LoCoMo, una prueba de referencia para memoria en conversaciones largas, los sistemas que consultaban el
grafo primero obtuvieron entre un 55 y un 56 por ciento de precisión, mientras que la recuperación ordinaria,
Mem0 y los enfoques de contexto completo alcanzaron entre un 77 y un 81 por ciento
[[2]](https://arxiv.org/abs/2601.07978). Los autores de HippoRAG 2 informan asimismo que los enfoques de
grafos anteriores caen por debajo del RAG estándar en memoria factual básica
[[3]](https://arxiv.org/abs/2502.14802).

Los grafos se ganan su lugar en una categoría distinta de preguntas. Los resultados más sólidos de GraphRAG
corresponden a preguntas globales sobre un corpus, evaluadas por amplitud y diversidad
[[4]](https://arxiv.org/abs/2404.16130). Ahora clasifico las preguntas en precisas, multi-hop o globales. En el
diseño actual, la recuperación directa inicia las tres clases. El recorrido del grafo puede aportar a las dos
últimas, y las listas ordenadas se combinan mediante fusión de rangos recíproca. Ese método no requiere
entrenamiento, y su evaluación original constató que la constante exacta no resultaba crítica
[[5]](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf).

Los límites son deliberadamente sencillos. La extracción propone afirmaciones y la evidencia las respalda.
Una persona resuelve la identidad ambigua tras revisar la evidencia. El resolvedor gestiona el tiempo y la
autoridad, el grafo encuentra caminos y la interfaz representa la afirmación elegida. Cada componente puede
ponerse a prueba frente a la clase de hecho que es capaz de conocer.

## Lo que significa estar en verde ahora

La herramienta de convergencia todavía no unificará las dos versiones de esa entrevista de siete intervenciones
en una sola. Informa las divergencias, señala el caso en que una sola cosa recibió dos identificadores y se
niega a decidir qué extracción era la correcta. Ese último paso sigue siendo una decisión del dominio.

Un resultado en verde ahora significa que los registros tienen una estructura válida, su evidencia puede
rastrearse y el sistema mantuvo visibles las contradicciones y las decisiones dentro de su ámbito de autoridad.
La exhaustividad aún debe medirse para cada pregunta. La repetición sigue requiriendo procedencia, y una
afirmación no revisada permanece sin confirmar.

El grafo tomó una tarde. Enseñar al sistema circundante dónde detenerse llevó dos semanas.

Un grafo te permitirá decir más de lo que sabes. El trabajo consiste en no decirlo.

## Fuentes

1. Library of Congress. [PREMIS Data Dictionary for Preservation Metadata, v3.0](https://www.loc.gov/standards/premis/v3/premis-3-0-final.pdf).
2. Wolff & Bennati. [Cost and Accuracy of Long-Term Memory in Distributed Multi-Agent Systems Based on Large Language Models](https://arxiv.org/abs/2601.07978), 2026.
3. Gutiérrez et al. [From RAG to Memory: Non-Parametric Continual Learning for Large Language Models (HippoRAG 2)](https://arxiv.org/abs/2502.14802), 2025.
4. Edge et al. [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130), 2024.
5. Cormack, Clarke & Büttcher. [Reciprocal Rank Fusion Outperforms Condorcet and Individual Rank Learning Methods](https://cormack.uwaterloo.ca/cormacksigir09-rrf.pdf), SIGIR 2009.
6. Vashishth, Jain & Talukdar. [CESI: Canonicalizing Open Knowledge Bases using Embeddings and Side Information](https://arxiv.org/abs/1902.00172), WWW 2018.
7. Dash et al. [Open Knowledge Graphs Canonicalization using Variational Autoencoders](https://aclanthology.org/2021.emnlp-main.811/), EMNLP 2021.
8. Rasmussen et al. [Zep: A Temporal Knowledge Graph Architecture for Agent Memory](https://arxiv.org/abs/2501.13956), 2025.
9. Microsoft. [GraphRAG indexing dataflow](https://microsoft.github.io/graphrag/index/default_dataflow/).
10. National Library of Medicine. [UMLS Metathesaurus](https://www.nlm.nih.gov/research/umls/knowledge_sources/metathesaurus/index.html).
11. SNOMED International. [SNOMED CT Editorial Guide: preferred term](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/preferred-term) y [synonym](https://docs.snomed.org/snomed-ct-specifications/snomed-ct-editorial-guide/readme/authoring/general-naming-conventions/descriptions/synonym).
12. Gene Ontology Consortium. [Ontology documentation: synonym scopes](https://geneontology.org/docs/ontology-documentation/).
13. Fellegi & Sunter. [A Theory for Record Linkage](https://www.cs.cornell.edu/~shmat/courses/cs6434/fellegi-sunter.pdf), JASA 1969.
14. Jensen & Snodgrass. [Temporal Data Management](https://www2.cs.arizona.edu/~rts/pubs/TKDEJan99.pdf), IEEE TKDE 1999.
15. XTDB. [Time in XTDB: bitemporality](https://docs.xtdb.com/about/time-in-xtdb.html).
16. Datomic. [Overview: retractions as facts](https://docs.datomic.com/datomic-overview.html).
17. Zhao et al. [A Bayesian Approach to Discovering Truth from Conflicting Sources for Data Integration](http://vldb.org/pvldb/vol5/p550_bozhao_vldb2012.pdf), VLDB 2012.
18. ODNI. [Intelligence Community Directive 203: Analytic Standards](https://www.dni.gov/files/documents/ICD/ICD-203.pdf).
19. Dong, Berti-Équille & Srivastava. [Integrating Conflicting Data: The Role of Source Dependence](http://www.vldb.org/pvldb/vol2/vldb09-pvldb47.pdf), VLDB 2009.
20. Razniewski, Suchanek & Nutt. [But What Do We Actually Know?](https://www.akbc.ws/2016/papers/10_Paper.pdf), AKBC 2016.
21. Zou et al. [PoisonedRAG: Knowledge Corruption Attacks to Retrieval-Augmented Generation of Large Language Models](https://arxiv.org/abs/2402.07867), 2024.
22. Chhikara et al. [Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory](https://arxiv.org/abs/2504.19413), 2025.
23. Mem0. [Open Source: Migrating to the New Memory Algorithm](https://docs.mem0.ai/migration/oss-v2-to-v3).

*Cada una de las fuentes anteriores fue consultada y leída en su origen durante este trabajo. Cada oración citada se verificó contra la propia página. Se omitieron afirmaciones procedentes de fuentes bloqueadas.*
