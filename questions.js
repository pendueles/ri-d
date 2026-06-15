// data/questions.js
import { flattenQuestions } from "../utils/helpers";

const QUESTION_HINTS = {
  // RIGHTS
  s_001: "SGAE gestiona derechos de autor relacionados con composición y obra musical. Registrar correctamente la canción ayuda a garantizar identificación, trazabilidad y correcta gestión de derechos de explotación y comunicación pública.",
  s_002: "Definir correctamente los porcentajes de composición es fundamental para asegurar un reparto transparente y preciso de los derechos generados por la obra. Errores aquí pueden derivar en conflictos administrativos, bloqueos o repartos incorrectos de royalties.",
  s_003: "La metadata asociada a la obra —título, autores, editores— debe mantenerse precisa y consistente dentro del sistema de gestión. Una metadata correcta ayuda a evitar errores de identificación y mejora trazabilidad.",
  s_004: "SoundExchange gestiona determinados derechos de ejecución digital en EE.UU. Registrar correctamente el track como Rights Owner ayuda a asegurar que los titulares del master puedan recibir los ingresos correspondientes.",
  s_005: "SoundExchange también gestiona ingresos relacionados con intérpretes. Mantener correctamente atribuidos estos roles ayuda a asegurar una distribución adecuada de derechos y royalties.",
  s_006: "Una metadata precisa dentro de SoundExchange ayuda a garantizar correcta identificación del track y evita conflictos relacionados con reporting y pagos.",
  s_007: "AIE gestiona derechos relacionados con artistas intérpretes y ejecutantes. Registrar correctamente la canción ayuda a garantizar que los intérpretes puedan percibir los ingresos correspondientes.",
  s_008: "Asignar correctamente los intérpretes dentro del sistema ayuda a asegurar una distribución adecuada de derechos y reconocimiento profesional de todos los participantes.",
  s_009: "Mantener correctamente configurada la metadata dentro de AIE ayuda a evitar errores administrativos y mejora la identificación de la grabación.",
  s_010: "AGEDI gestiona derechos relacionados con productores fonográficos y titulares de grabaciones. Declarar correctamente la grabación ayuda a garantizar la correcta gestión de derechos y monetización del master.",
  s_011: "Identificar correctamente al titular fonográfico es fundamental para asegurar que los ingresos derivados del master se asignen adecuadamente.",
  s_012: "Una metadata correcta ayuda a garantizar identificación precisa de la grabación y coherencia entre distintos sistemas de gestión colectiva.",
  s_013: "Cualquier sample utilizado debe contar con los permisos y autorizaciones correspondientes antes de su explotación comercial. Mantener correctamente documentados estos acuerdos ayuda a evitar conflictos legales, reclamaciones o bloqueos relacionados con el lanzamiento.",
  // AUTHORITY - Google Panel
  s_020: "La correcta vinculación dentro del Google Knowledge Panel ayuda a que la canción aparezca asociada al artista oficial dentro de búsquedas y superficies de descubrimiento de Google.",
  s_021: "Datos como nombre de la canción, álbum, fecha de lanzamiento o género deben mostrarse correctamente dentro del ecosistema Google para asegurar una representación profesional y consistente del release.",
  s_022: "Los enlaces a plataformas digitales permiten transformar búsquedas en reproducciones directas dentro de las DSPs oficiales del lanzamiento.",
  s_023: "Vincular correctamente el ecosistema audiovisual de la canción ayuda a consolidar relación entre audio, videoclip y canal oficial del artista dentro de Google y YouTube.",
  s_024: "La integración de letras dentro del ecosistema Google ayuda a mejorar descubrimiento, accesibilidad y experiencia de búsqueda alrededor del release.",
  s_025: "Además de DSPs y YouTube, Google puede mostrar enlaces adicionales relacionados con el release. Mantener estos activos correctamente configurados ayuda a construir una presencia digital sólida.",
  // AUTHORITY - Wikipedia
  s_026: "Incluir la canción dentro de la discografía oficial en Wikipedia ayuda a consolidar la trazabilidad histórica y cultural del catálogo del artista.",
  s_027: "Disponer de un artículo propio permite desarrollar contexto cultural, histórico y mediático alrededor de la canción más allá de la simple metadata de plataformas musicales.",
  s_028: "Un artículo completo debe incluir información clave como lanzamiento, composición, producción, contexto, recepción, videoclip, charts y certificaciones.",
  s_029: "Wikipedia depende directamente de la calidad y verificabilidad de sus referencias. Contar con fuentes fiables y correctamente citadas ayuda a mantener estabilidad y credibilidad del artículo.",
  // AUTHORITY - Composser
  s_030: "Todos los compositores deben aparecer con sus datos correctos y sus roles bien definidos en distribución. Un error puede generar conflictos legales, problemas de publishing y bloqueos de pagos.",
  s_031: "Spotify DNA permite vincular correctamente la autoría compositiva dentro de la plataforma, mejorando trazabilidad y transparencia.",
  s_032: "Apple Music muestra créditos de compositores de forma destacada. Una correcta vinculación mejora la percepción profesional del lanzamiento.",
  s_033: "YouTube conecta datos de composición con ContentID y con la distribución de derechos, por lo que la vinculación correcta es fundamental.",
  s_034: "El resto de plataformas también consultan bases de datos de compositores. Mantener esta información correcta en todas ellas asegura consistencia y correcta atribución.",
  // AUTHORITY - MusicBrainz
  s_035: "MusicBrainz funciona como una de las principales bases de datos abiertas de metadata musical. Crear correctamente el recording ayuda a consolidar trazabilidad y estructura de catálogo.",
  s_036: "Vincular correctamente el ISRC dentro de MusicBrainz ayuda a identificar de forma precisa la grabación y evita conflictos de metadata o duplicidades.",
  s_037: "Una correcta vinculación del artista asegura que el recording aparezca asociado al perfil adecuado y que el catálogo permanezca organizado correctamente.",
  s_038: "Relacionar correctamente la canción con su release permite mantener coherencia estructural dentro del catálogo.",
  s_039: "Evitar duplicados es fundamental para mantener una base de datos limpia y precisa dentro de MusicBrainz.",
  s_040: "Gracenote es una de las principales infraestructuras de metadata utilizadas por automóviles, televisiones y dispositivos inteligentes. Verificar correctamente la presencia de la canción asegura coherencia en múltiples entornos.",
  s_041: "Luminate recopila y estructura información de consumo musical utilizada ampliamente por la industria para análisis y reporting.",
  s_042: "Discogs funciona como una de las principales bases de datos culturales y documentales relacionadas con lanzamientos musicales y coleccionismo.",
  // AUTHORITY - Lyrics
  s_043: "Musixmatch es una de las principales infraestructuras de letras dentro del ecosistema musical digital y alimenta plataformas como Spotify, Instagram o Google.",
  s_044: "Una letra bien sincronizada y revisada mejora significativamente la experiencia de escucha y evita errores que puedan afectar percepción profesional del release.",
  s_045: "Genius funciona como una de las principales plataformas culturales y documentales alrededor de letras y narrativa musical.",
  s_046: "Revisar correctamente la letra en Genius garantiza precisión, coherencia y correcta atribución del contenido dentro de la plataforma.",
  s_047: "Las traducciones ayudan a ampliar alcance internacional y permiten que audiencias de otros idiomas conecten con el contenido narrativo de la canción.",
  s_048: "La validación dentro de Genius confirma que la letra ha sido revisada y aprobada correctamente dentro del sistema editorial de la plataforma.",
  s_049: "Las anotaciones permiten contextualizar frases, referencias culturales, dobles sentidos y elementos narrativos presentes dentro de la canción.",
  // AUTHORITY - OOH
  s_050: "Los eventos físicos permiten transformar el lanzamiento en una experiencia real y conectar directamente con la comunidad del artista.",
  s_051: "Las vallas funcionan como uno de los formatos OOH más visibles y ayudan a posicionar el lanzamiento dentro del imaginario urbano y cultural.",
  s_052: "Las pantallas digitales permiten amplificar el impacto visual del release en espacios de alto tráfico como calles, centros comerciales o venues.",
  s_053: "La cartelería permite amplificar la presencia física del lanzamiento mediante posters, flyering y soportes impresos distribuidos estratégicamente.",
  s_054: "Los stickers funcionan como una herramienta de intervención urbana y expansión visual del universo del release dentro del espacio físico.",
  // YT&VIDEO - Upload Assets
  s_060: "El master de vídeo es la versión final que se publica en YouTube y debe representar correctamente la calidad visual y técnica del lanzamiento.",
  s_061: "La miniatura funciona como la principal puerta de entrada visual al videoclip y tiene un impacto directo sobre el CTR y el rendimiento del contenido.",
  s_062: "Los tags ayudan a contextualizar el contenido dentro del ecosistema de búsqueda y recomendación de YouTube.",
  s_063: "La descripción del vídeo cumple una función clave a nivel informativo, SEO y navegación dentro de YouTube.",
  s_064: "Los subtítulos ayudan a mejorar accesibilidad, comprensión y retención dentro de YouTube, además de aportar señales adicionales al algoritmo.",
  s_065: "Traducir correctamente los subtítulos permite ampliar alcance internacional y conectar el contenido con audiencias de distintos idiomas.",
  s_066: "Vincular correctamente el videoclip al ISRC ayuda a consolidar la relación entre contenido audiovisual y grabación sonora dentro del ecosistema YouTube.",
  s_067: "Los canales Topic agrupan automáticamente contenido distribuido musicalmente dentro de YouTube. Vincular correctamente el Topic al vídeo oficial ayuda a consolidar reproducciones.",
  s_068: "El Music Tab organiza oficialmente el catálogo musical dentro del canal del artista y facilita navegación estructurada entre canciones, álbumes y vídeos.",
  s_069: "La sección Releases agrupa los lanzamientos oficiales del artista dentro del ecosistema YouTube Music. Verificar que el release aparece correctamente ayuda a mantener el catálogo organizado.",
  // YT&VIDEO - Content ID
  s_070: "Los Shorts son uno de los principales motores de descubrimiento dentro de YouTube y permiten amplificar rápidamente el alcance de un lanzamiento.",
  s_071: "Content ID es el sistema de identificación y gestión de derechos de YouTube. Una revisión correcta permite detectar conflictos, reclamaciones erróneas o problemas de ownership.",
  s_072: "Los clips permiten reutilizar momentos concretos del ecosistema audiovisual del artista para generar contenido adicional optimizado para circulación orgánica.",
  s_073: "El contenido Live permite mostrar una dimensión más cercana, energética o performativa del artista dentro de YouTube.",
  s_074: "Los lyric videos funcionan como una herramienta híbrida entre contenido visual y experiencia musical.",
  // YT&VIDEO - Internal Connection
  s_075: "Las campañas de Ads internos permiten amplificar estratégicamente el alcance del lanzamiento dentro del propio ecosistema YouTube.",
  s_076: "Los endscreens son las pantallas finales que permiten redirigir tráfico hacia otros vídeos, playlists, canales o acciones específicas.",
  s_077: "Las secciones del canal ayudan a estructurar visualmente el ecosistema del artista dentro de YouTube y permiten destacar estratégicamente contenido prioritario.",
  s_078: "El trailer del canal funciona como una de las principales piezas de bienvenida para nuevos usuarios dentro del Official Artist Channel.",
  s_079: "Las playlists internas permiten organizar estratégicamente el contenido del artista y generar recorridos de consumo más largos dentro del canal.",
  s_080: "Las playlists externas ayudan a ampliar alcance más allá del ecosistema propio del artista y permiten conectar el lanzamiento con nuevas audiencias.",
  s_081: "Las tarjetas funcionan como herramientas internas de navegación que permiten insertar recomendaciones y enlaces contextuales durante la reproducción.",
  // YT&VIDEO - External Connection
  s_082: "Las fuentes externas de tráfico orgánico ayudan a llevar audiencia hacia el lanzamiento desde fuera del ecosistema nativo de YouTube.",
  s_083: "Los Ads externos permiten atraer tráfico hacia el lanzamiento desde plataformas ajenas a YouTube mediante campañas pagadas segmentadas.",
  // YT&VIDEO - Otras DVPs
  s_084: "Apple mantiene una fuerte integración entre música y contenido audiovisual, por lo que una correcta distribución del videoclip ayuda a reforzar el posicionamiento visual del lanzamiento.",
  s_085: "La distribución de vídeo hacia Spotify permite ampliar el ecosistema visual del lanzamiento dentro de la plataforma.",
  s_086: "La distribución audiovisual dentro de Tidal ayuda a consolidar el catálogo multimedia del artista y ofrecer una experiencia más premium.",
  s_087: "Distribuir correctamente el videoclip hacia Amazon permite mantener consistencia audiovisual dentro de todo el ecosistema digital del artista.",
  // YT&VIDEO - Otras Integraciones
  s_088: "La presencia en canales de televisión musicales sigue siendo una herramienta relevante para ampliar alcance y reforzar percepción cultural.",
  s_089: "Existen múltiples entornos de reproducción audiovisual más allá de plataformas tradicionales: gimnasios, transporte público, espacios comerciales, hospitality.",
  // SOCIAL - Instagram
  s_090: "UGC (User Generated Content) hace referencia al contenido creado orgánicamente por usuarios utilizando la canción dentro de Reels, Stories o publicaciones.",
  s_091: "El audio disponible en Instagram debe corresponder exactamente a la versión oficial del lanzamiento y reproducirse correctamente.",
  s_092: "La integración de letras dentro de Instagram permite que usuarios interactúen de forma más profunda con la canción en Stories y otros formatos sociales.",
  s_093: "La correcta vinculación entre el release y el perfil del artista ayuda a consolidar identidad dentro del ecosistema Meta.",
  // SOCIAL - TikTok
  s_094: "UGC en TikTok es uno de los principales motores de descubrimiento musical. Una estrategia UGC sólida puede incluir creators, trends, challenges y dinámicas culturales.",
  s_095: "En TikTok, el fragmento exacto disponible de una canción tiene un impacto enorme sobre su potencial viral. Optimizar el corte implica seleccionar la parte más reconocible del track.",
  s_096: "El audio oficial dentro de TikTok es la base de toda estrategia orgánica y UGC alrededor de un lanzamiento.",
  s_097: "El Music Tab funciona como el espacio donde TikTok agrupa oficialmente los sonidos asociados a un artista dentro de su perfil.",
  // SOCIAL - X
  s_098: "Una campaña UGC en X puede incluir memes, frases de canciones, clips, edits, comunidades, reposts, debates y fan content.",
  // DSPs - Spotify
  s_100: "El archivo de audio debe ser la versión final aprobada, sin errores de mezcla, exportación, volumen, cortes o versiones antiguas. Un máster incorrecto puede arruinar el lanzamiento desde el primer minuto.",
  s_101: "La letra debe estar bien escrita, completa y alineada con la versión final de la canción. Una letra correcta mejora la experiencia del usuario y facilita la sincronización en Spotify.",
  s_102: "El ISRC debe identificar correctamente la grabación concreta que se está lanzando. Este código conecta consumo, reporting, monetización y trazabilidad.",
  s_103: "El pitch editorial es el proceso mediante el cual se presenta una canción inédita al equipo de editores de Spotify a través de Spotify for Artists antes de su lanzamiento.",
  s_104: "La portada debe coincidir exactamente con la versión oficial del lanzamiento: diseño final, formato correcto, buena resolución y sin errores visuales.",
  s_105: "La canción debe salir en una fecha y hora pensadas estratégicamente. Una buena planificación permite llegar con tiempo a Spotify for Artists y activar herramientas internas.",
  s_106: "El lanzamiento debe aparecer en el perfil correcto del artista principal. Es fundamental evitar errores de vinculación con artistas de nombre similar o perfiles duplicados.",
  s_107: "Los artistas invitados deben aparecer correctamente como featuring, con su perfil bien vinculado y el naming oficial respetado.",
  s_108: "El Canvas es el vídeo vertical en loop que aparece en Spotify mientras suena una canción. Un Canvas optimizado debe ser coherente con el universo visual del lanzamiento.",
  s_109: "Spotify DNA permite optimizar la vinculación entre la canción y su contexto compositivo, editorial y artístico dentro del ecosistema Spotify.",
  s_110: "El ecosistema de playlists propias engloba todas las playlists controladas directa o indirectamente por el artista, sello o equipo de trabajo.",
  s_111: "Artist's Pick es el espacio destacado situado en la parte superior del perfil de Spotify. Mantenerlo actualizado demuestra actividad y puede aumentar conversión hacia el release destacado.",
  s_112: "El género principal debe representar de forma precisa el sonido de la canción. Un género mal elegido puede enviar señales equivocadas al algoritmo.",
  s_113: "El subgénero permite afinar mucho más el posicionamiento de la canción. Cuanto mejor definido esté, más fácil será que Spotify entienda el contexto real del track.",
  s_114: "Todos los compositores deben aparecer con sus datos correctos y sus roles bien definidos. Un error puede generar conflictos legales y problemas de publishing.",
  s_115: "Los productores deben figurar correctamente en los créditos del tema, respetando nombres artísticos y roles reales dentro de la grabación.",
  s_116: "Si participan músicos, arreglistas, ingenieros u otros perfiles creativos, deben aparecer reflejados correctamente.",
  s_117: "Los créditos de copyright y fonograma deben estar bien escritos: quién controla el máster, quién publica y bajo qué entidad aparece el lanzamiento.",
  s_118: "El Double Check en Spotify CMS consiste en revisar directamente dentro del sistema interno cómo se está mostrando y procesando el lanzamiento antes de su publicación.",
  // DSPs - Apple Music
  s_120: "Dolby Atmos permite una experiencia de audio espacial inmersiva. Apple Music da una gran visibilidad a los lanzamientos compatibles con Spatial Audio y Dolby Atmos.",
  s_121: "El pitch editorial permite presentar el lanzamiento al equipo de Apple Music para contextualizar la canción y aumentar posibilidades de apoyo editorial.",
  s_122: "La sincronización de letras permite que el texto avance en tiempo real junto a la canción. Una sincronización precisa transmite profesionalidad y mejora la experiencia del oyente.",
  s_123: "La correcta vinculación del artista garantiza que el lanzamiento aparezca dentro del perfil oficial adecuado. Errores de vinculación pueden fragmentar audiencias.",
  s_124: "Apple Music permite distribuir audio en formatos Lossless y Hi-Res Lossless, ofreciendo una calidad superior respecto al streaming comprimido tradicional.",
  s_125: "Apple Music da una gran importancia a las letras dentro de la experiencia de usuario. Tener la letra correctamente cargada mejora engagement y conexión emocional.",
  s_126: "Los featurings ayudan a contextualizar colaboraciones y permiten que los lanzamientos aparezcan asociados a todos los artistas participantes.",
  s_127: "Apple Motion Artwork es el formato animado que Apple Music utiliza para dar vida visual a álbumes y singles dentro de la plataforma.",
  s_128: "Los créditos de producción son fundamentales para reconocer la autoría creativa y técnica. Apple Music muestra cada vez más información de créditos.",
  s_129: "Los créditos de composición permiten identificar correctamente a las personas responsables de la obra musical y son clave para gestión de derechos.",
  s_130: "Acreditar músicos y arreglistas ayuda a documentar correctamente el proceso creativo y técnico detrás de una grabación.",
  s_131: "Shazam forma parte del ecosistema Apple. Una correcta integración asegura que las canciones sean identificadas correctamente y redirijan al release adecuado.",
  // DSPs - YouTube Music
  s_140: "Una correcta vinculación garantiza que el lanzamiento aparezca asociado al perfil oficial del artista y que el catálogo permanezca consolidado correctamente.",
  s_141: "Los Art Tracks son las versiones automáticas generadas por distribución. Vincularlos correctamente al Official Artist Channel permite consolidar el catálogo.",
  s_142: "Vincular correctamente el videoclip oficial al track permite que YouTube conecte ambas piezas y consolide reproducciones, descubrimiento y navegación.",
  s_143: "Habilitar el audio para Shorts permite que usuarios y creadores utilicen oficialmente la canción dentro de contenido corto en YouTube.",
  s_144: "Configurar correctamente los colaboradores ayuda a conectar el lanzamiento con todos los artistas participantes y mejora descubrimiento cruzado.",
  // DSPs - Other DSPs
  s_150: "Mantener correctamente ubicado el catálogo dentro de Amazon ayuda a consolidar la identidad digital del artista y asegura una navegación coherente.",
  s_151: "Una correcta ubicación dentro de Tidal garantiza que el lanzamiento aparezca asociado al perfil adecuado y que el catálogo permanezca organizado.",
  s_152: "Una correcta ubicación dentro de Deezer asegura que el catálogo esté asociado correctamente al artista y mejora consistencia del ecosistema digital.",
  // DSPs - SoundCloud
  s_160: "Una correcta ubicación dentro de SoundCloud asegura que el release esté asociado al perfil oficial del artista.",
  s_161: "En SoundCloud es habitual que convivan lanzamientos distribuidos automáticamente con contenido subido manualmente. Un merge correcto evita duplicidades.",
  s_162: "Los tags funcionan como herramientas de clasificación y descubrimiento dentro de SoundCloud. Utilizar tags precisos y relevantes mejora la búsqueda.",
  s_163: "Configurar correctamente los colaboradores mejora la capacidad de descubrimiento cruzado entre audiencias.",
  // DSPs - Beatport
  s_170: "El BPM es una de las variables más utilizadas por DJs para buscar y seleccionar música dentro de Beatport. Un BPM incorrecto puede dificultar descubrimiento.",
  s_171: "La tonalidad (key) ayuda a DJs y productores a mezclar canciones armónicamente y es una de las herramientas más utilizadas dentro de Beatport.",
  s_172: "Una correcta vinculación garantiza que el lanzamiento aparezca dentro del perfil oficial adecuado y que el catálogo permanezca consolidado en Beatport.",
  s_173: "Las versiones extended o club suelen tener un valor especialmente alto en Beatport. Incluirlas mejora utilidad para DJs y puede aumentar alcance del release.",
  s_174: "El imprint identifica el sello o sublabel responsable del lanzamiento y ayuda a contextualizar el release dentro de una línea editorial concreta.",
  s_175: "En Beatport los remixers tienen un peso especialmente importante, ya que muchas búsquedas se producen a través de nombres asociados a remixes.",
  s_176: "El pitch editorial permite contextualizar el lanzamiento ante el equipo de Beatport y aumentar posibilidades de aparecer en playlists, charts o banners.",
};


// ═══════════════════════════════════════════
// ARTIST BLOCKS — v2.0 (updated from Excel)
// ═══════════════════════════════════════════
const ARTIST_BLOCKS = [
  {
    id: "dsps", label: "DSPs", blockWeight: 0.30,
    subcats: [
      {
        id: "spotify", label: "Spotify", subcatWeight: 30,
        items: [
          { id: "a_sp_1", w: 10, q: "¿La foto de perfil representa la etapa actual?" },
          { id: "a_sp_2", w: 5,  q: "¿El header refleja la identidad actual del proyecto?" },
          { id: "a_sp_3", w: 10, q: "¿La galería está activa?" },
          { id: "a_sp_4", w: 5,  q: "¿Hay una estrategia de clips?" },
          { id: "a_sp_5", w: 10, q: "¿La biografía comunica el momento actual?" },
          { id: "a_sp_6", w: 10, q: "¿Existe un ecosistema de playlists?" },
          { id: "a_sp_7", w: 10, q: "¿El Artist's Pick ha sido actualizado esta semana?" },
          { id: "a_sp_8", w: 10, q: "¿Están todas las RRSS conectadas?" },
          { id: "a_sp_9", w: 10, q: "¿Bandsintown está integrado?" },
          { id: "a_sp_10", w: 10, q: "¿Shopify está integrado?" },
          { id: "a_sp_11", w: 10, q: "¿El catálogo está optimizado en Spotify?" },
        ]
      },
      {
        id: "apple", label: "Apple Music", subcatWeight: 30,
        items: [
          { id: "a_am_1", w: 15, q: "¿La foto de perfil representa la etapa actual?" },
          { id: "a_am_2", w: 10, q: "¿La biografía en Acerca De es la correcta?" },
          { id: "a_am_3", w: 3,  q: "¿La fecha de nacimiento es correcta?" },
          { id: "a_am_4", w: 2,  q: "¿El lugar de origen es correcto?" },
          { id: "a_am_5", w: 5,  q: "¿El género musical es correcto?" },
          { id: "a_am_6", w: 5,  q: "¿El equipo editorial ha activado el Header?" },
          { id: "a_am_7", w: 5,  q: "¿El equipo editorial ha activado la playlist 'Imprescindibles'?" },
          { id: "a_am_8", w: 5,  q: "¿El equipo editorial ha activado la playlist 'Videos Imprescindibles'?" },
          { id: "a_am_9", w: 5,  q: "¿El equipo editorial ha activado la playlist 'Influencias'?" },
          { id: "a_am_10", w: 5, q: "¿El equipo editorial ha activado la playlist 'En Casa Con'?" },
          { id: "a_am_11", w: 5, q: "¿El equipo editorial ha activado la playlist 'Setlist'?" },
          { id: "a_am_12", w: 10, q: "¿Apple Music For Artists está activado?" },
          { id: "a_am_13", w: 10, q: "¿El equipo tiene acceso a Apple Music For Artists?" },
          { id: "a_am_14", w: 15, q: "¿El catálogo está optimizado en Apple Music?" },
        ]
      },
      {
        id: "ytmusic", label: "YouTube Music", subcatWeight: 20,
        items: [
          { id: "a_ym_1", w: 50, q: "¿El canal está correctamente vinculado a un Official Artist Channel (OAC)?" },
          { id: "a_ym_2", w: 15, q: "¿La foto de perfil representa la identidad actual del artista?" },
          { id: "a_ym_3", w: 15, q: "¿La biografía del canal comunica correctamente el proyecto?" },
          { id: "a_ym_4", w: 20, q: "¿El catálogo está optimizado en YouTube Music?" },
        ]
      },
      {
        id: "otherdsps", label: "Other DSPs", subcatWeight: 10,
        items: [
          { id: "a_od_1", w: 10, q: "¿Hay acceso a TIDAL Artist Home?" },
          { id: "a_od_2", w: 10, q: "¿La imagen del artista en TIDAL representa la etapa actual?" },
          { id: "a_od_3", w: 15, q: "¿El catálogo está optimizado en TIDAL?" },
          { id: "a_od_4", w: 10, q: "¿Hay acceso a Amazon Music for Artists?" },
          { id: "a_od_5", w: 10, q: "¿La imagen del artista en Amazon Music representa la etapa actual?" },
          { id: "a_od_6", w: 15, q: "¿El catálogo está optimizado en Amazon Music?" },
          { id: "a_od_7", w: 10, q: "¿Hay acceso a Deezer for Artists?" },
          { id: "a_od_8", w: 5,  q: "¿La imagen del artista en Deezer representa la etapa actual?" },
          { id: "a_od_9", w: 15, q: "¿El catálogo está optimizado en Deezer?" },
        ]
      },
      {
        id: "soundcloud", label: "SoundCloud & Beatport", subcatWeight: 10,
        items: [
          { id: "a_sc_1", w: 10, q: "¿El perfil está verificado o cuenta con SoundCloud Pro?" },
          { id: "a_sc_2", w: 5,  q: "¿La foto de perfil representa la etapa actual del artista?" },
          { id: "a_sc_3", w: 5,  q: "¿El header refleja la identidad actual del proyecto?" },
          { id: "a_sc_4", w: 5,  q: "¿La biografía comunica correctamente el proyecto?" },
          { id: "a_sc_5", w: 15, q: "¿Los enlaces del perfil están completos y actualizados?" },
          { id: "a_sc_6", w: 10, q: "¿El catálogo está optimizado en SoundCloud?" },
          { id: "a_sc_7", w: 17, q: "¿El perfil del artista está creado en Beatport?" },
          { id: "a_sc_8", w: 16, q: "¿La imagen del artista en Beatport representa la etapa actual?" },
          { id: "a_sc_9", w: 17, q: "¿El catálogo está optimizado en Beatport?" },
        ]
      },
    ]
  },
  {
    id: "social", label: "Social", blockWeight: 0.25,
    subcats: [
      {
        id: "instagram", label: "Instagram", subcatWeight: 25,
        items: [
          { id: "a_ig_1", w: 20, q: "¿El perfil está verificado?" },
          { id: "a_ig_2", w: 20, q: "¿El perfil está conectado a IG Music?" },
          { id: "a_ig_3", w: 15, q: "¿Se ha creado un ecosistema META?" },
          { id: "a_ig_4", w: 15, q: "¿El equipo tiene acceso al ecosistema META?" },
          { id: "a_ig_5", w: 10, q: "¿Tenemos un link destacado en el perfil?" },
          { id: "a_ig_6", w: 10, q: "¿Se utiliza la BIO de Instagram?" },
          { id: "a_ig_7", w: 10, q: "¿El handle es el mejor que podemos conseguir?" },
        ]
      },
      {
        id: "tiktok", label: "TikTok", subcatWeight: 50,
        items: [
          { id: "a_tt_1", w: 20, q: "¿El perfil está verificado?" },
          { id: "a_tt_2", w: 25, q: "¿Está activado el perfil de artista con Music Tab?" },
          { id: "a_tt_3", w: 20, q: "¿El catálogo está optimizado en el Music Tab?" },
          { id: "a_tt_4", w: 15, q: "¿Hay acceso a TikTok for Artists?" },
          { id: "a_tt_5", w: 15, q: "¿El equipo tiene acceso a TikTok for Artists?" },
          { id: "a_tt_6", w: 10, q: "¿Tenemos un link destacado en el perfil?" },
          { id: "a_tt_7", w: 10, q: "¿Estamos utilizando la BIO de TikTok?" },
          { id: "a_tt_8", w: 10, q: "¿El handle es el mejor que podemos conseguir?" },
        ]
      },
      {
        id: "x", label: "X (Twitter)", subcatWeight: 10,
        items: [
          { id: "a_x_1", w: 30, q: "¿El perfil está verificado?" },
          { id: "a_x_2", w: 30, q: "¿El handle es el mejor que podemos conseguir?" },
          { id: "a_x_3", w: 20, q: "¿Estamos utilizando la BIO de X?" },
          { id: "a_x_4", w: 20, q: "¿Tenemos un link destacado en el perfil?" },
        ]
      },
      {
        id: "web", label: "Web", subcatWeight: 10,
        items: [
          { id: "a_wb_1", w: 50, q: "¿Tenemos web del artista?" },
          { id: "a_wb_2", w: 15, q: "¿La web dirige a las DSPs del artista?" },
          { id: "a_wb_3", w: 15, q: "¿La web dirige a las RRSS del artista?" },
          { id: "a_wb_4", w: 20, q: "¿La web está actualizada?" },
        ]
      },
      {
        id: "rrss_alt", label: "RRSS Alternativas", subcatWeight: 5,
        items: [
          { id: "a_ra_1", w: 100, q: "¿Tenemos una estrategia en RRSS alternativas?" },
        ]
      },
    ]
  },
  {
    id: "ytvideo", label: "YT&Video", blockWeight: 0.20,
    subcats: [
      {
        id: "accesos", label: "Accesos", subcatWeight: 20,
        items: [
          { id: "a_ya_1", w: 70, q: "¿El equipo tiene acceso como editor al canal de YouTube?" },
          { id: "a_ya_2", w: 30, q: "¿El canal está incluido en la MCN?" },
        ]
      },
      {
        id: "configuracion", label: "Configuración", subcatWeight: 30,
        items: [
          { id: "a_yc_1", w: 20, q: "¿El canal está verificado?" },
          { id: "a_yc_2", w: 60, q: "¿El canal está vinculado a un Official Artist Channel (OAC)?" },
          { id: "a_yc_3", w: 20, q: "¿El canal está monetizado?" },
        ]
      },
      {
        id: "diseno", label: "Diseño", subcatWeight: 20,
        items: [
          { id: "a_yd_1", w: 40, q: "¿La foto de perfil representa la etapa actual del artista?" },
          { id: "a_yd_2", w: 40, q: "¿El banner refleja la identidad actual del proyecto?" },
          { id: "a_yd_3", w: 20, q: "¿La marca de agua está optimizada?" },
        ]
      },
      {
        id: "organizacion", label: "Organización", subcatWeight: 15,
        items: [
          { id: "a_yo_1", w: 20, q: "¿La home del canal está estructurada en secciones?" },
          { id: "a_yo_2", w: 15, q: "¿El canal tiene un tráiler activo?" },
          { id: "a_yo_3", w: 10, q: "¿Existen playlists propias creadas?" },
          { id: "a_yo_4", w: 10, q: "¿Hay enlaces a RRSS en el canal?" },
          { id: "a_yo_5", w: 10, q: "¿El email de contacto está visible?" },
          { id: "a_yo_6", w: 10, q: "¿La descripción del canal está clara y actualizada?" },
          { id: "a_yo_7", w: 5,  q: "¿Las keywords por defecto están optimizadas?" },
          { id: "a_yo_8", w: 20, q: "¿Shopify está conectado y operativo en el canal?" },
        ]
      },
      {
        id: "contenido", label: "Contenido", subcatWeight: 15,
        items: [
          { id: "a_yv_1", w: 25, q: "¿Existe una estrategia activa de Shorts?" },
          { id: "a_yv_2", w: 25, q: "¿Existe una estrategia activa de comunidad?" },
          { id: "a_yv_3", w: 50, q: "¿El catálogo está optimizado en el canal?" },
        ]
      },
    ]
  },
  {
    id: "authority", label: "Authority", blockWeight: 0.15,
    subcats: [
      {
        id: "googlepanel", label: "Google Panel", subcatWeight: 25,
        items: [
          { id: "a_gp_1", w: 40, q: "¿El Google Knowledge Panel está reclamado?" },
          { id: "a_gp_2", w: 20, q: "¿El panel está correctamente vinculado al artista?" },
          { id: "a_gp_3", w: 10, q: "¿La información principal es correcta?" },
          { id: "a_gp_4", w: 10, q: "¿Están bien integrados los links a DSPs?" },
          { id: "a_gp_5", w: 10, q: "¿Está vinculado el canal de YouTube OAC?" },
          { id: "a_gp_6", w: 5,  q: "¿Incluye otros links relevantes?" },
          { id: "a_gp_7", w: 5,  q: "¿Las letras están disponibles y correctas?" },
        ]
      },
      {
        id: "wikipedia", label: "Wikipedia", subcatWeight: 20,
        items: [
          { id: "a_wp_1", w: 50, q: "¿La página de Wikipedia está creada?" },
          { id: "a_wp_2", w: 30, q: "¿El catálogo está correctamente reflejado?" },
          { id: "a_wp_3", w: 10, q: "¿La página tiene referencias fiables y suficientes?" },
          { id: "a_wp_4", w: 10, q: "¿La narrativa biográfica está bien construida?" },
        ]
      },
      {
        id: "composer", label: "Composer", subcatWeight: 10,
        items: [
          { id: "a_co_1", w: 50, q: "¿El perfil está optimizado en Spotify DNA?" },
          { id: "a_co_2", w: 50, q: "¿El catálogo está limpio en Spotify DNA?" },
        ]
      },
      {
        id: "lyrics", label: "Lyrics", subcatWeight: 40,
        items: [
          { id: "a_ly_1", w: 30, q: "¿El perfil está reclamado en Musixmatch?" },
          { id: "a_ly_2", w: 30, q: "¿El catálogo está optimizado en Musixmatch?" },
          { id: "a_ly_3", w: 20, q: "¿El perfil está reclamado en Genius?" },
          { id: "a_ly_4", w: 20, q: "¿El catálogo está optimizado en Genius?" },
        ]
      },
      {
        id: "musicbrainz", label: "MusicBrainz & Co", subcatWeight: 5,
        items: [
          { id: "a_mb_1", w: 34, q: "¿El perfil está creado y optimizado en MusicBrainz?" },
          { id: "a_mb_2", w: 33, q: "¿El perfil está creado y optimizado en Luminate?" },
          { id: "a_mb_3", w: 33, q: "¿El perfil está creado y optimizado en Discogs?" },
        ]
      },
    ]
  },
  {
    id: "rights", label: "Rights", blockWeight: 0.10,
    subcats: [
      {
        id: "sgae", label: "SGAE", subcatWeight: 40,
        items: [
          { id: "a_sg_1", w: 100, q: "¿El autor está dado de alta en SGAE?" },
        ]
      },
      {
        id: "soundexchange", label: "SoundExchange", subcatWeight: 10,
        items: [
          { id: "a_se_1", w: 50, q: "¿Está dado de alta como Rights Owner en SoundExchange?" },
          { id: "a_se_2", w: 50, q: "¿Está dado de alta como intérprete en SoundExchange?" },
        ]
      },
      {
        id: "aie", label: "AIE", subcatWeight: 20,
        items: [
          { id: "a_ai_1", w: 100, q: "¿Está dado de alta en AIE?" },
        ]
      },
      {
        id: "agedi", label: "AGEDI", subcatWeight: 20,
        items: [
          { id: "a_ag_1", w: 100, q: "¿Está dado de alta en AGEDI?" },
        ]
      },
      {
        id: "publishing", label: "Publishing", subcatWeight: 10,
        items: [
          { id: "a_pb_1", w: 100, q: "¿El artista tiene Publishing?" },
        ]
      },
    ]
  },
];

// Build flat question list
const ARTIST_QUESTIONS = ARTIST_BLOCKS.flatMap(block =>
  block.subcats.flatMap(sub =>
    sub.items.map(item => ({
      ...item,
      blockId: block.id,
      blockLabel: block.label,
      subcatId: sub.id,
      subcatLabel: sub.label,
    }))
  )
);

// ═══════════════════════════════════════════
// SONG BLOCKS (same structure as artist)
// ═══════════════════════════════════════════
const SONG_BLOCKS = [

// ═══════════════════════════════════════════
// SONG BLOCKS (same structure as artist)
// ═══════════════════════════════════════════
  {
    id: "rights", label: "RIGHTS", blockWeight: 0.10,
    subcats: [
      { id: "sgae", label: "SGAE", subcatWeight: 50, items: [
        { id: "s_001", w: 40, q: "¿La canción está correctamente registrada en SGAE?" },
        { id: "s_002", w: 30, q: "¿Los porcentajes de autoría están correctamente configurados en SGAE?" },
        { id: "s_003", w: 30, q: "¿La metadata está correctamente configurada en SGAE?" },
      ]},
      { id: "soundexchange", label: "SOUNDEXCHANGE", subcatWeight: 10, items: [
        { id: "s_004", w: 34, q: "¿El track está correctamente registrado como Rights Owner en SoundExchange?" },
        { id: "s_005", w: 33, q: "¿El track está correctamente atribuido a los intérpretes en SoundExchange?" },
        { id: "s_006", w: 33, q: "¿La metadata está correctamente configurada en SoundExchange?" },
      ]},
      { id: "aie", label: "AIE", subcatWeight: 10, items: [
        { id: "s_007", w: 34, q: "¿La canción está correctamente registrada en AIE?" },
        { id: "s_008", w: 33, q: "¿Los intérpretes están correctamente configurados en AIE?" },
        { id: "s_009", w: 33, q: "¿La metadata está correctamente configurada en AIE?" },
      ]},
      { id: "agedi", label: "AGEDI", subcatWeight: 10, items: [
        { id: "s_010", w: 34, q: "¿La grabación está correctamente declarada en AGEDI?" },
        { id: "s_011", w: 33, q: "¿El titular del master está correctamente configurado en AGEDI?" },
        { id: "s_012", w: 33, q: "¿Los metadatos están correctamente configurados en AGEDI?" },
      ]},
      { id: "samples", label: "SAMPLES", subcatWeight: 20, items: [
        { id: "s_013", w: 100, q: "¿Los permisos de samples están correctamente firmados y documentados?" },
      ]},
    ]
  },
  {
    id: "authority", label: "AUTHORITY", blockWeight: 0.15,
    subcats: [
      { id: "google_panel", label: "GOOGLE PANEL", subcatWeight: 15, items: [
        { id: "s_020", w: 25, q: "¿La canción está correctamente vinculada al artista dentro del Google Knowledge Panel?" },
        { id: "s_021", w: 20, q: "¿La información de la canción es correcta dentro del panel?" },
        { id: "s_022", w: 15, q: "¿Los links a DSPs de la canción están correctamente configurados?" },
        { id: "s_023", w: 15, q: "¿El link al videoclip o Official Artist Channel está correctamente configurado?" },
        { id: "s_024", w: 15, q: "¿La letra de la canción está correctamente integrada en Google?" },
        { id: "s_025", w: 10, q: "¿Los otros enlaces relacionados con la canción están correctamente optimizados?" },
      ]},
      { id: "wikipedia", label: "WIKIPEDIA", subcatWeight: 15, items: [
        { id: "s_026", w: 30, q: "¿La canción aparece correctamente dentro de la discografía del artista en Wikipedia?" },
        { id: "s_027", w: 25, q: "¿La canción cuenta con un artículo propio en Wikipedia?" },
        { id: "s_028", w: 25, q: "¿El artículo de la canción contiene toda la información relevante?" },
        { id: "s_029", w: 20, q: "¿Las fuentes y referencias del artículo están correctamente citadas?" },
      ]},
      { id: "composser", label: "COMPOSSER", subcatWeight: 15, items: [
        { id: "s_030", w: 50, q: "¿El registro de compositores en distribución es correcto?" },
        { id: "s_031", w: 15, q: "¿La vinculación de compositores en Spotify DNA es correcta?" },
        { id: "s_032", w: 10, q: "¿La vinculación de compositores en Apple Music es correcta?" },
        { id: "s_033", w: 15, q: "¿La vinculación de compositores en YouTube es correcta?" },
        { id: "s_034", w: 10, q: "¿La vinculación de compositores en el resto de plataformas es correcta?" },
      ]},
      { id: "musicbrainzco", label: "MUSICBRAINZ&CO", subcatWeight: 5, items: [
        { id: "s_035", w: 10, q: "¿El recording está correctamente creado en MusicBrainz?" },
        { id: "s_036", w: 10, q: "¿El ISRC está correctamente vinculado en MusicBrainz?" },
        { id: "s_037", w: 10, q: "¿El artista está correctamente vinculado en MusicBrainz?" },
        { id: "s_038", w: 10, q: "¿El release está correctamente vinculado en MusicBrainz?" },
        { id: "s_039", w: 10, q: "¿El recording evita duplicidades en MusicBrainz?" },
        { id: "s_040", w: 15, q: "¿El recording aparece correctamente en Gracenote?" },
        { id: "s_041", w: 15, q: "¿El recording aparece correctamente en Luminate?" },
        { id: "s_042", w: 20, q: "¿El recording aparece correctamente en Discogs?" },
      ]},
      { id: "lyrics", label: "LYRICS", subcatWeight: 30, items: [
        { id: "s_043", w: 20, q: "¿La letra está correctamente subida a Musixmatch?" },
        { id: "s_044", w: 30, q: "¿La letra en Musixmatch está correctamente revisada, asignada y sincronizada?" },
        { id: "s_045", w: 10, q: "¿La letra está correctamente subida a Genius?" },
        { id: "s_046", w: 10, q: "¿La letra en Genius está correctamente revisada y asignada?" },
        { id: "s_047", w: 10, q: "¿La letra está correctamente traducida en Genius?" },
        { id: "s_048", w: 10, q: "¿La letra ha sido correctamente validada en Genius?" },
        { id: "s_049", w: 10, q: "¿Existen anotaciones relevantes dentro de Genius?" },
      ]},
      { id: "ooh", label: "OOH", subcatWeight: 20, items: [
        { id: "s_050", w: 40, q: "¿Existe un evento físico asociado al lanzamiento?" },
        { id: "s_051", w: 30, q: "¿Existe una estrategia activa de vallas publicitarias?" },
        { id: "s_052", w: 15, q: "¿El lanzamiento cuenta con presencia en pantallas digitales?" },
        { id: "s_053", w: 10, q: "¿Existe una estrategia activa de cartelería?" },
        { id: "s_054", w: 5,  q: "¿Existe una estrategia activa de stickers para el lanzamiento?" },
      ]},
    ]
  },
  {
    id: "ytvideo", label: "YT&VIDEO", blockWeight: 0.20,
    subcats: [
      { id: "upload_assets", label: "UPLOAD ASSETS", subcatWeight: 25, items: [
        { id: "s_060", w: 15, q: "¿El master de vídeo es correcto?" },
        { id: "s_061", w: 10, q: "¿La miniatura está correctamente optimizada?" },
        { id: "s_062", w: 10, q: "¿Los tags están correctamente optimizados?" },
        { id: "s_063", w: 10, q: "¿La descripción está correctamente optimizada?" },
        { id: "s_064", w: 10, q: "¿Los subtítulos están correctamente optimizados?" },
        { id: "s_065", w: 5,  q: "¿La traducción de subtítulos está correctamente optimizada?" },
        { id: "s_066", w: 10, q: "¿El vídeo está correctamente vinculado al ISRC?" },
        { id: "s_067", w: 10, q: "¿El Topic está correctamente vinculado al vídeo oficial?" },
        { id: "s_068", w: 10, q: "¿El lanzamiento aparece correctamente en el Music Tab?" },
        { id: "s_069", w: 10, q: "¿El lanzamiento aparece correctamente en Releases?" },
      ]},
      { id: "content_id__derivados", label: "CONTENT ID & DERIVADOS", subcatWeight: 20, items: [
        { id: "s_070", w: 30, q: "¿Existe una campaña activa de creación de Shorts?" },
        { id: "s_071", w: 25, q: "¿Se ha realizado una revisión correcta de Content ID?" },
        { id: "s_072", w: 20, q: "¿Existe una campaña activa de creación de clips?" },
        { id: "s_073", w: 10, q: "¿Existe una campaña activa de vídeo Live?" },
        { id: "s_074", w: 15, q: "¿Existe una campaña activa de vídeos Lyrics?" },
      ]},
      { id: "internal_connection", label: "INTERNAL CONNECTION", subcatWeight: 20, items: [
        { id: "s_075", w: 30, q: "¿Existe una campaña activa de Ads internos en YouTube?" },
        { id: "s_076", w: 20, q: "¿Los endscreens están correctamente optimizados?" },
        { id: "s_077", w: 10, q: "¿El lanzamiento está incluido correctamente en las secciones del canal?" },
        { id: "s_078", w: 10, q: "¿El lanzamiento está fijado como trailer del canal?" },
        { id: "s_079", w: 10, q: "¿El lanzamiento está incluido dentro de playlists internas?" },
        { id: "s_080", w: 10, q: "¿El lanzamiento está incluido dentro de playlists externas?" },
        { id: "s_081", w: 10, q: "¿Las tarjetas están correctamente optimizadas?" },
      ]},
      { id: "external_connection", label: "EXTERNAL CONNECTION", subcatWeight: 15, items: [
        { id: "s_082", w: 60, q: "¿Existe una estrategia activa de creación de fuentes externas de tráfico orgánico?" },
        { id: "s_083", w: 40, q: "¿Existe una campaña activa de Ads externos?" },
      ]},
      { id: "otras_dvps", label: "OTRAS DVPs", subcatWeight: 10, items: [
        { id: "s_084", w: 25, q: "¿El videoclip está correctamente distribuido a Apple Music?" },
        { id: "s_085", w: 25, q: "¿El videoclip está correctamente distribuido a Spotify?" },
        { id: "s_086", w: 25, q: "¿El videoclip está correctamente distribuido a TIDAL?" },
        { id: "s_087", w: 25, q: "¿El videoclip está correctamente distribuido a Amazon Music?" },
      ]},
      { id: "otras_integraciones", label: "OTRAS INTEGRACIONES", subcatWeight: 10, items: [
        { id: "s_088", w: 60, q: "¿El videoclip ha sido incluido en canales de televisión musicales?" },
        { id: "s_089", w: 40, q: "¿El videoclip ha sido incluido en otras plataformas de vídeo externas?" },
      ]},
    ]
  },
  {
    id: "social", label: "SOCIAL", blockWeight: 0.25,
    subcats: [
      { id: "instagram", label: "INSTAGRAM", subcatWeight: 30, items: [
        { id: "s_090", w: 50, q: "¿Existe una campaña UGC en IG activa alrededor del lanzamiento?" },
        { id: "s_091", w: 20, q: "¿El audio es correcto en Instagram?" },
        { id: "s_092", w: 20, q: "¿La letra está correctamente vinculada?" },
        { id: "s_093", w: 10, q: "¿La canción está correctamente vinculada al perfil de Instagram del artista?" },
      ]},
      { id: "tiktok", label: "TIKTOK", subcatWeight: 60, items: [
        { id: "s_094", w: 30, q: "¿Existe una campaña UGC activa alrededor del lanzamiento?" },
        { id: "s_095", w: 30, q: "¿El corte y time stamp del audio están optimizados?" },
        { id: "s_096", w: 20, q: "¿El audio oficial está correctamente disponible en TikTok?" },
        { id: "s_097", w: 20, q: "¿La canción está correctamente vinculada al Music Tab del artista?" },
      ]},
      { id: "x", label: "X", subcatWeight: 10, items: [
        { id: "s_098", w: 100, q: "¿Existe una campaña UGC activa en X alrededor del lanzamiento?" },
      ]},
    ]
  },
  {
    id: "dsps", label: "DSPs", blockWeight: 0.30,
    subcats: [
      { id: "spotify", label: "SPOTIFY", subcatWeight: 70, items: [
        { id: "s_100", w: 10, q: "¿El máster es correcto?" },
        { id: "s_101", w: 10, q: "¿La letra está corregida?" },
        { id: "s_102", w: 10, q: "¿El ISRC es correcto?" },
        { id: "s_103", w: 10, q: "¿El release ha sido pitcheado?" },
        { id: "s_104", w: 5,  q: "¿La portada es correcta?" },
        { id: "s_105", w: 5,  q: "¿La fecha y hora de release están optimizadas?" },
        { id: "s_106", w: 5,  q: "¿La vinculación al perfil es correcta?" },
        { id: "s_107", w: 5,  q: "¿Los feats están correctamente acreditados?" },
        { id: "s_108", w: 5,  q: "¿La canción tiene Canvas?" },
        { id: "s_109", w: 5,  q: "¿El Spotify DNA está optimizado?" },
        { id: "s_110", w: 5,  q: "¿La canción está incluida dentro del ecosistema de playlists propias?" },
        { id: "s_111", w: 5,  q: "¿La canción está destacada en el Artist's Pick?" },
        { id: "s_112", w: 4,  q: "¿El género es correcto?" },
        { id: "s_113", w: 4,  q: "¿El subgénero es correcto?" },
        { id: "s_114", w: 3,  q: "¿Los compositores están correctamente acreditados?" },
        { id: "s_115", w: 3,  q: "¿Los productores están correctamente acreditados?" },
        { id: "s_116", w: 2,  q: "¿Los músicos y arreglistas están correctamente acreditados?" },
        { id: "s_117", w: 2,  q: "¿El P&C es correcto?" },
        { id: "s_118", w: 2,  q: "¿Se ha realizado un Double Check en Spotify CMS?" },
      ]},
      { id: "apple_music", label: "APPLE MUSIC", subcatWeight: 10, items: [
        { id: "s_120", w: 16, q: "¿La canción cuenta con una versión Dolby Atmos?" },
        { id: "s_121", w: 13, q: "¿La canción ha sido correctamente pitcheada al equipo editorial de Apple Music?" },
        { id: "s_122", w: 14, q: "¿La letra está correctamente sincronizada?" },
        { id: "s_123", w: 12, q: "¿La ubicación del release es correcta en Apple Music?" },
        { id: "s_124", w: 7,  q: "¿El lanzamiento cuenta con master Apple Lossless / Hi-Res optimizado?" },
        { id: "s_125", w: 7,  q: "¿La letra ha sido correctamente agregada?" },
        { id: "s_126", w: 7,  q: "¿Los featurings están correctamente configurados?" },
        { id: "s_127", w: 6,  q: "¿La canción cuenta con Apple Motion Artwork?" },
        { id: "s_128", w: 4,  q: "¿Los productores están correctamente acreditados?" },
        { id: "s_129", w: 4,  q: "¿Los compositores están correctamente acreditados?" },
        { id: "s_130", w: 2,  q: "¿Los músicos y arreglistas están correctamente acreditados?" },
        { id: "s_131", w: 8,  q: "¿La integración con Shazam está correctamente configurada?" },
      ]},
      { id: "youtube_music", label: "YOUTUBE MUSIC", subcatWeight: 10, items: [
        { id: "s_140", w: 25, q: "¿La ubicación del release es correcta en YouTube Music?" },
        { id: "s_141", w: 25, q: "¿El Art Track está correctamente vinculado al Official Artist Channel (OAC)?" },
        { id: "s_142", w: 25, q: "¿El videoclip está correctamente vinculado al track?" },
        { id: "s_143", w: 15, q: "¿El audio está disponible para Shorts?" },
        { id: "s_144", w: 10, q: "¿Los featurings están correctamente configurados?" },
      ]},
      { id: "other_dsps", label: "OTHER DSPs", subcatWeight: 6, items: [
        { id: "s_150", w: 40, q: "¿La ubicación del release es correcta en Amazon Music?" },
        { id: "s_151", w: 30, q: "¿La ubicación del release es correcta en TIDAL?" },
        { id: "s_152", w: 30, q: "¿La ubicación del release es correcta en Deezer?" },
      ]},
      { id: "soundcloud", label: "SOUNDCLOUD", subcatWeight: 2, items: [
        { id: "s_160", w: 35, q: "¿La ubicación del release es correcta en Soundcloud?" },
        { id: "s_161", w: 25, q: "¿El release está correctamente mergeado entre distribución y perfil manual?" },
        { id: "s_162", w: 25, q: "¿Los tags están correctamente optimizados?" },
        { id: "s_163", w: 15, q: "¿Los featurings están correctamente configurados?" },
      ]},
      { id: "beatport", label: "BEATPORT", subcatWeight: 2, items: [
        { id: "s_170", w: 20, q: "¿El BPM está correctamente configurado?" },
        { id: "s_171", w: 18, q: "¿La key está correctamente configurada?" },
        { id: "s_172", w: 15, q: "¿La ubicación es correcta en Beatport?" },
        { id: "s_173", w: 15, q: "¿El lanzamiento incluye versiones alternativas (Extended, Club Mix, etc.)?" },
        { id: "s_174", w: 12, q: "¿El imprint está correctamente configurado?" },
        { id: "s_175", w: 10, q: "¿Los remixers están correctamente acreditados?" },
        { id: "s_176", w: 10, q: "¿La canción ha sido correctamente pitcheada al equipo editorial de Beatport?" },
      ]},
    ]
  },
];


const SONG_QUESTIONS = flattenQuestions(SONG_BLOCKS);

export { QUESTION_HINTS, ARTIST_BLOCKS, ARTIST_QUESTIONS, SONG_BLOCKS, SONG_QUESTIONS };
