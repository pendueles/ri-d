import { useState, useEffect, useRef, useCallback } from "react";
import { RIMAS_LOGO, ICON_ARTISTA, ICON_PROYECTO, ICON_NUEVO, LOGO_B64 } from "./data/assets";
import { useDarkMode, isDark, theme } from "./theme/theme";
import { calcBlockScore, calcTotalScore } from "./utils/scoring";
import { db } from "./firebase/firebase";
import {
  useFirebaseStore, saveState, loadState, clearState,
  getArtists, getFirebaseError, clearFirebaseError,
  saveOneArtist, saveProject, saveArtists, deleteArtists, deleteProjectById,
  getArtistUsers, saveArtistUsers, registerArtistUser,
  getLabelUsers, saveLabelUsers,
  getMgmtUsers, saveMgmtUsers,
  startRealtimeSync,
} from "./firebase/store";





// ═══════════════════════════════════════════
// QUESTION DATA — exact from Excel
// ═══════════════════════════════════════════
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


function flattenQuestions(blocks) {
  const qs = [];
  blocks.forEach(block => {
    block.subcats.forEach(sub => {
      sub.items.forEach(item => {
        qs.push({ ...item, blockId: block.id, blockLabel: block.label, subcatId: sub.id, subcatLabel: sub.label });
      });
    });
  });
  return qs;
}

const SONG_QUESTIONS = flattenQuestions(SONG_BLOCKS);

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function scoreColor(s) {
  if (s >= 75) return "#1B6AE8";
  if (s >= 50) return "#5B9EF0";
  if (s >= 25) return "#E8611B";
  return "#E8151B";
}

function scoreLabel(s) {
  if (s >= 75) return "Excelente";
  if (s >= 50) return "Bueno";
  if (s >= 25) return "Mejorable";
  return "Crítico";
}

// Red palette that evolves with progress
function bgColor(progress) {
  // Always Rimas red — shade slightly darker at start, full red by end
  const t = progress / 100;
  const r = Math.round(180 + (232 - 180) * t);
  const g = Math.round(8 + (21 - 8) * t);
  const b = Math.round(8 + (27 - 8) * t);
  return `rgb(${r},${g},${b})`;
}



// ═══════════════════════════════════════════
// RESET BUTTON — shown on every screen
// ═══════════════════════════════════════════
function ResetButton({ onReset }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ fontFamily:"Arial, sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.7)" }}>¿Seguro?</span>
      <button onClick={onReset} style={{ background:"#dc2626", border:"none", color:"white", fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"700", padding:"4px 10px", borderRadius:"6px", cursor:"pointer" }}>Sí</button>
      <button onClick={() => setConfirm(false)} style={{ background:"rgba(255,255,255,0.15)", border:"none", color:"white", fontFamily:"Arial, sans-serif", fontSize:"11px", padding:"4px 10px", borderRadius:"6px", cursor:"pointer" }}>No</button>
    </div>
  );
  return (
    <button onClick={() => setConfirm(true)} style={{ background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"rgba(255,255,255,0.8)", fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"600", padding:"5px 10px", borderRadius:"8px", cursor:"pointer" }}>
      ⟳ Inicio
    </button>
  );
}
function SwipeCard({ question, onAnswer, currentIndex, total, answers, blockLabel, subcatLabel, phase, phaseName, photo, onHome, onGoHome, onGoBlock }) {
  const [showHint, setShowHint] = useState(false);
  const cardRef = useRef(null);
  const startX = useRef(null);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [leaving, setLeaving] = useState(null);

  const hint = question && QUESTION_HINTS && QUESTION_HINTS[question.id];
  const answered = question ? answers[question.id] : undefined;

  const triggerAnswer = useCallback((yes) => {
    if (!question) return;
    setLeaving(yes ? "right" : "left");
    setTimeout(() => {
      setLeaving(null);
      setDragX(0);
      onAnswer(question.id, yes);
    }, 280);
  }, [question?.id, onAnswer]);

  if (!question) return null;

  // Touch handlers
  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    isDragging.current = true;
  };
  const onTouchMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.touches[0].clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  };
  const onTouchEnd = () => {
    isDragging.current = false;
    if (Math.abs(currentX.current) > 80) {
      triggerAnswer(currentX.current > 0);
    } else {
      setDragX(0);
    }
    currentX.current = 0;
  };

  // Mouse handlers (desktop)
  const onMouseDown = (e) => {
    startX.current = e.clientX;
    isDragging.current = true;
  };
  const onMouseMove = (e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - startX.current;
    currentX.current = dx;
    setDragX(dx);
  };
  const onMouseUp = () => {
    isDragging.current = false;
    if (Math.abs(currentX.current) > 80) {
      triggerAnswer(currentX.current > 0);
    } else {
      setDragX(0);
    }
    currentX.current = 0;
  };

  const rotation = dragX * 0.08;
  const opacity = leaving ? 0 : Math.max(0.3, 1 - Math.abs(dragX) / 300);
  let tx = dragX;
  if (leaving === "right") tx = 400;
  if (leaving === "left") tx = -400;

  const showYes = dragX > 30 || leaving === "right";
  const showNo = dragX < -30 || leaving === "left";

  const progress = Math.round((currentIndex / total) * 100);

  const t = theme(isDark());
  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100dvh", background:t.bg, position:"relative", overflow:"hidden" }}>

      {/* Progress bar — top */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"#f0f0f0", zIndex:10 }}>
        <div style={{ height:"100%", width:`${progress}%`, background:"#111", transition:"width 0.3s ease" }}/>
      </div>

      {/* Header — breadcrumb navigation */}
      <div style={{ padding:"20px 20px 0", paddingTop:"max(20px, env(safe-area-inset-top, 20px))", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onHome} style={{ background:"transparent", border:"none", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:0 }}>
          {onHome ? "← Volver" : ""}
        </button>
        {/* Breadcrumb: Artista/Canción › Bloque › Subcat */}
        <div style={{ display:"flex", alignItems:"center", gap:"4px", flex:1, justifyContent:"center" }}>
          {phaseName && (
            <button onClick={onGoHome} style={{ background:"transparent", border:"none", fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: onGoHome ? "#E8151B" : "#bbb", letterSpacing:"0.06em", textTransform:"uppercase", cursor: onGoHome ? "pointer" : "default", padding:"2px 4px", borderRadius:"6px" }}>
              {phaseName}
            </button>
          )}
          {blockLabel && phaseName && <span style={{ color:"#ccc", fontSize:"10px" }}>›</span>}
          {blockLabel && (
            <button onClick={onGoBlock} style={{ background:"transparent", border:"none", fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: onGoBlock ? "#111" : "#bbb", letterSpacing:"0.06em", textTransform:"uppercase", cursor: onGoBlock ? "pointer" : "default", padding:"2px 4px", borderRadius:"6px" }}>
              {blockLabel}
            </button>
          )}
          {subcatLabel && blockLabel && <span style={{ color:"#ccc", fontSize:"10px" }}>›</span>}
          {subcatLabel && (
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#bbb", letterSpacing:"0.06em", textTransform:"uppercase" }}>{subcatLabel}</span>
          )}
        </div>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", fontWeight:"700", color:"#aaa" }}>{currentIndex}/{total}</div>
      </div>

      {/* Swipe hint labels */}
      <div style={{ position:"absolute", top:"50%", left:"20px", transform:"translateY(-50%)", opacity: showNo ? 1 : 0, transition:"opacity 0.15s", background:"#E8151B", color:"white", fontFamily:"Arial,sans-serif", fontWeight:"700", fontSize:"16px", padding:"6px 14px", borderRadius:"8px" }}>NO</div>
      <div style={{ position:"absolute", top:"50%", right:"20px", transform:"translateY(-50%)", opacity: showYes ? 1 : 0, transition:"opacity 0.15s", background:"#111", color:"white", fontFamily:"Arial,sans-serif", fontWeight:"700", fontSize:"16px", padding:"6px 14px", borderRadius:"8px" }}>SÍ</div>

      {/* Card */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 20px" }}>
        <div
          ref={cardRef}
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
          style={{
            width:"100%", maxWidth:"380px",
            background:"#fff",
            borderRadius:"20px",
            padding:"32px 28px",
            boxShadow:"0 4px 40px rgba(0,0,0,0.08)",
            border:"1px solid #f0f0f0",
            transform:`translateX(${tx}px) rotate(${rotation}deg)`,
            transition: leaving ? "transform 0.28s ease, opacity 0.28s ease" : dragX === 0 ? "transform 0.3s ease" : "none",
            opacity,
            cursor:"grab",
            userSelect:"none",
            touchAction:"none",
            position:"relative",
          }}
        >
          {/* Block badge */}
          <div style={{ marginBottom:"24px" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:t?.text3 || "#bbb", letterSpacing:"0.12em", textTransform:"uppercase" }}>{blockLabel}</span>
          </div>

          {/* Question + hint */}
          <div style={{ position:"relative", marginBottom:"32px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"20px", fontWeight:"700", color:"#111", lineHeight:"1.35", paddingRight: hint ? "36px" : "0" }}>
              {question.q || question.label}
            </div>
            {hint && (
              <button onClick={() => setShowHint(!showHint)}
                style={{ position:"absolute", top:"2px", right:0, width:"26px", height:"26px", borderRadius:"50%", background:"#f5f5f5", border:"1px solid #e8e8e8", color:"#999", fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                ?
              </button>
            )}
            {hint && showHint && (
              <div style={{ marginTop:"12px", background:"#f8f8f8", color:"#444", fontFamily:"Arial,sans-serif", fontSize:"12px", lineHeight:"1.6", padding:"14px 16px", borderRadius:"12px", border:"1px solid #eee" }}>
                {hint}
              </div>
            )}
          </div>

          {/* Already answered indicator */}
          {answered !== undefined && (
            <div style={{ padding:"8px 12px", borderRadius:"8px", background: answered ? "#f0fdf4" : t.bg2, border:`1px solid ${answered ? "#86efac" : t.border}`, fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", color: answered ? "#15803d" : t.text2, textAlign:"center", marginBottom:"16px" }}>
              {answered ? "✓ SÍ" : "✗ NO"} — desliza para cambiar
            </div>
          )}

          {/* Swipe hint */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#888", fontWeight:"700" }}>← NO</span>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"10px", color:"#ccc" }}>desliza</span>
            <span style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", color:"#111", fontWeight:"700" }}>SÍ →</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ padding:"0 20px 16px" }}>
        <div style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
          <button onClick={() => triggerAnswer(false)}
            style={{ flex:1, padding:"16px", background:"#111", color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
            ✗ NO
          </button>
          <button onClick={() => triggerAnswer(true)}
            style={{ flex:1, padding:"16px", background:"#111", color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
            ✓ SÍ
          </button>
        </div>
        <div style={{ display:"flex", gap:"8px", justifyContent:"center" }}>
          {currentIndex > 1 && (
            <button onClick={() => onAnswer("__back__")}
              style={{ background:"transparent", border:"1px solid #e8e8e8", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:"10px 20px", borderRadius:"10px" }}>← Atrás</button>
          )}
          <button onClick={() => onAnswer("__skip__")}
            style={{ background:"transparent", border:"1px solid #e8e8e8", color:"#aaa", fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:"10px 20px", borderRadius:"10px" }}>Saltar →</button>
        </div>
      </div>

      <div style={{ paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))" }}/>
    </div>
  );
}


function FormScreen({ title, subtitle, fields, onSubmit, bgProgress=0, onBack=null }) {
  const t = theme(isDark());
  const [vals, setVals] = useState({});
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSubmit = () => {
    const required = fields.filter(f => f.required);
    for (const f of required) {
      if (!vals[f.id] || !vals[f.id].trim()) {
        alert(`Por favor rellena: ${f.label}`);
        return;
      }
    }
    onSubmit({ ...vals, photo });
  };

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      {/* Topbar */}
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top, 16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        {onBack
          ? <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
          : <div style={{ width:"60px" }}/>
        }
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>{title}</div>
        <div style={{ width:"60px" }}/>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"32px 24px" }}>
        {subtitle && (
          <div style={{ fontFamily:"Arial,sans-serif", fontSize:"13px", color:t.text3, marginBottom:"28px" }}>{subtitle}</div>
        )}

        {/* Photo upload */}
        {fields.some(f => f.id === 'photo') || (
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"32px" }}>
            <div onClick={() => fileRef.current.click()}
              style={{ width:"80px", height:"80px", borderRadius:"50%", background: photo ? "transparent" : t.bg2, border:`1.5px dashed ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}>
              {photo
                ? <img src={photo} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:"24px" }}>📷</span>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
          </div>
        )}

        {fields.map(f => (
          <div key={f.id} style={{ marginBottom:"28px" }}>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>{f.label}{f.required ? " *" : ""}</div>
            <input
              type={f.type || "text"}
              placeholder={f.placeholder || ""}
              value={vals[f.id] || ""}
              onChange={e => setVals(v => ({ ...v, [f.id]: e.target.value }))}
              style={{ display:"block", width:"100%", background:"transparent", border:"none", borderBottom:`1.5px solid ${t.border}`, padding:"10px 0", fontFamily:"Arial,sans-serif", fontSize:"17px", color:t.text, outline:"none", WebkitAppearance:"none" }}
            />
          </div>
        ))}
      </div>

      <div style={{ padding:"16px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", borderTop:`1px solid ${t.border}` }}>
        <button onClick={handleSubmit}
          style={{ display:"block", width:"100%", padding:"17px", background:t.text, color:t.bg, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// RESULT SCREEN
// ═══════════════════════════════════════════
function ResultScreen({ title, subtitle, score, blocks, answers, photo, onContinue, continueLabel, onSecondary, secondaryLabel, extra }) {
  return (
    <div style={{ minHeight:"100dvh", background: bgColor(100), display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"20px 20px 0", paddingTop:"max(20px, env(safe-area-inset-top, 20px))", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <img src={RIMAS_LOGO} alt="Ri+D" style={{ height:"28px", width:"28px", objectFit:"contain", filter: isDark() ? "invert(1)" : "none" }}/>
        <div style={{ fontFamily:"Arial, sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.6)" }}>Resultado</div>
      </div>
      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"20px" }}>
        {/* Score hero */}
        <div style={{ background:"white", borderRadius:"20px", padding:"24px 20px", marginBottom:"14px", textAlign:"center", boxShadow:"0 8px 30px rgba(0,0,0,0.15)" }}>
          {photo && <img src={photo} alt="" style={{ width:"64px", height:"64px", borderRadius:"50%", objectFit:"cover", margin:"0 auto 12px", display:"block", border:"3px solid #f0f0f0" }}/>}
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"13px", fontWeight:"700", color:"#999", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{subtitle}</div>
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"26px", fontWeight:"700", color:"#111", marginBottom:"16px" }}>{title}</div>
          <ScoreRing score={score}/>
          <div style={{ display:"inline-block", padding:"6px 16px", borderRadius:"20px", background: scoreColor(score) + "22", border:`1px solid ${scoreColor(score)}44`, fontFamily:"Arial, sans-serif", fontSize:"13px", fontWeight:"700", color: scoreColor(score), marginTop:"8px" }}>
            {scoreLabel(score)}
          </div>
        </div>

        {/* Block breakdown */}
        <div style={{ marginBottom:"14px" }}>
          <div style={{ fontFamily:"Arial, sans-serif", fontSize:"11px", fontWeight:"700", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"10px" }}>Desglose por bloque</div>
          <BlockScores blocks={blocks} answers={answers}/>
        </div>

        {extra && <div style={{ marginBottom:"14px" }}>{extra}</div>}
      </div>
      <div style={{ padding:"16px 20px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", background:"rgba(0,0,0,0.2)", display:"flex", flexDirection:"column", gap:"10px" }}>
        <button onClick={onContinue} style={{ display:"block", width:"100%", padding:"17px", background:"white", color:"#111", border:"none", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer" }}>
          {continueLabel}
        </button>
        {onSecondary && (
          <button onClick={onSecondary} style={{ display:"block", width:"100%", padding:"15px", background:"transparent", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer" }}>
            {secondaryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// HEX RADAR — 6 vertices (5 blocks + 1 total)
// Top=TOTAL, clockwise: DSPs, YT&Video, Authority, Rights, Social
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// ARTIST HOME SCREEN — hexagon nav
// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// BLOCK HOME SCREEN — sub-hexagon for block subcats
// ═══════════════════════════════════════════
function BlockHomeScreen({ block, artistAnswers, onSubcat, onBack, artistName, onGoHome }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;

  // Map subcats to hexagon vertices based on block id
  const getVertices = () => {
    if (block.id === 'dsps') return [
      { id:'result',       label:'Total',               angle: -90  },
      { id:'spotify',      label:'Spotify',             angle: -150 },
      { id:'apple_music',  label:'Apple Music',         angle: -30  },
      { id:'other_dsps',   label:'Other DSPs',          angle:  30  },
      { id:'soundcloud',   label:'SoundCloud & Beatport', angle:  90 },
      { id:'youtube_music',label:'YT Music',            angle:  150 },
    ];
    if (block.id === 'social') return [
      { id:'result',    label:'Puntuación',  angle: -90  },
      { id:'tiktok',    label:'TikTok',      angle: -30  },
      { id:'rrss_alt',  label:'RRSS Alt',    angle:  30  },
      { id:'web',       label:'Web',         angle:  90  },
      { id:'x',         label:'X',           angle:  150 },
      { id:'instagram', label:'Instagram',   angle: -150 },
    ];
    if (block.id === 'authority') return [
      { id:'result',      label:'Puntuación',      angle: -90  },
      { id:'wikipedia',   label:'Wikipedia',       angle: -30  },
      { id:'musicbrainz', label:'MusicBrainz&Co',  angle:  30  },
      { id:'composer',    label:'Composer',        angle:  90  },
      { id:'googlepanel', label:'Google Panel',    angle:  150 },
      { id:'lyrics',      label:'Lyrics',          angle: -150 },
    ];
    if (block.id === 'ytvideo') return [
      { id:'result',        label:'Puntuación',    angle: -90  },
      { id:'configuracion', label:'Configuración', angle: -30  },
      { id:'diseno',        label:'Diseño',        angle:  30  },
      { id:'contenido',     label:'Contenido',     angle:  90  },
      { id:'organizacion',  label:'Organización',  angle:  150 },
      { id:'accesos',       label:'Accesos',       angle: -150 },
    ];
    // Default: use subcats as vertices
    return [
      { id:'result', label:'Total', angle:-90 },
      ...block.subcats.map((s, i) => ({
        id: s.id, label: s.label, angle: -30 + i * 60
      }))
    ];
  };

  const vertices = getVertices();
  const S = 300, cx = S/2, cy = S/2, R = 105;

  const getSubcatScore = (subcatId) => {
    if (subcatId === 'result') {
      return Math.round(calcBlockScore(block, artistAnswers) * 10) / 10;
    }
    // Handle combined soundcloud+beatport
    if (subcatId === 'soundcloud') {
      const scSub = block.subcats.find(s => s.id === 'soundcloud');
      const bpSub = block.subcats.find(s => s.id === 'beatport');
      const subs = [scSub, bpSub].filter(Boolean);
      if (subs.length === 0) return null;
      const hasData = subs.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
      if (!hasData) return null;
      let total = 0;
      subs.forEach(s => {
        s.items.forEach(item => { if (artistAnswers[item.id] === true) total += item.w; });
      });
      return Math.min(100, Math.round(total * 10) / 10);
    }
    const sub = block.subcats.find(s => s.id === subcatId);
    if (!sub) return null;
    const hasData = sub.items.some(i => artistAnswers[i.id] !== undefined);
    if (!hasData) return null;
    let raw = 0;
    sub.items.forEach(item => { if (artistAnswers[item.id] === true) raw += item.w; });
    return Math.min(100, Math.round(raw * 10) / 10);
  };

  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  // Sorted by angle for clean ring paths (no crossing lines)
  const sortedPoints = [...vertices].sort((a,b) => a.angle - b.angle).map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));
  const hasAnyData = vertices.some(v => v.id !== 'result' && getSubcatScore(v.id) !== null);
  const dataPolygon = (() => {
    const pts = vertices.map(v => {
      let score;
      if (v.id === 'result') {
        const allAnswered = block.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
        if (!allAnswered) return null;
        score = calcBlockScore(block, artistAnswers);
      } else {
        score = getSubcatScore(v.id);
        if (score === null) return null;
      }
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Breadcrumb header */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <button onClick={onGoHome} style={{background:'transparent', border:'none', cursor: onGoHome ? 'pointer' : 'default', padding:'2px 8px', borderRadius:'8px', fontFamily:'Arial,sans-serif', fontSize:'13px', fontWeight:'600', color: onGoHome ? '#E8151B' : t.text3, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px', display:'block', margin:'0 auto 4px'}}>
          {artistName}
        </button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text}}>{block.label}</div>
      </div>

      {/* Hexagon */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33, 0.66, 1].map((scale, ri) => {
              const pts = sortedPoints.map(p => ({ x: cx+(p.x-cx)*scale, y: cy+(p.y-cy)*scale }));
              const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
              return <path key={ri} d={path} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {sortedPoints.map((p,i) => (
              <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>
            ))}
            {hasAnyData && dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
            {vertices.map(v => {
              const score = getSubcatScore(v.id);
              if (!score) return null;
              const pct = score / 100;
              const px = cx + R * pct * Math.cos(rad(v.angle));
              const py = cy + R * pct * Math.sin(rad(v.angle));
              return <circle key={v.id} cx={px.toFixed(1)} cy={py.toFixed(1)} r="4" fill="#E8151B"/>;
            })}
          </svg>

          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getSubcatScore(v.id);
            const isTotal = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id}
                onClick={() => !isTotal && onSubcat(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isTotal ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isTotal ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'5px 10px', cursor: isTotal ? 'default' : 'pointer',
                  minWidth:'58px', maxWidth:'88px',
                  boxShadow: hasScore||isTotal ? `0 2px 10px ${t.shadow}` : 'none', transition:'all 0.2s'}}>
                {!isTotal && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'8px', fontWeight:'700',
                    color: hasScore ? t.bg : t.text2, letterSpacing:'0.05em', textTransform:'uppercase',
                    whiteSpace:'nowrap', textAlign:'center', lineHeight:'1.2'}}>
                    {v.label}
                  </div>
                )}
                {(hasScore || isTotal) && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize: isTotal ? '18px' : '11px',
                    fontWeight:'700', color: isTotal?'#fff':t.bg, lineHeight:1}}>{score}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <div style={{padding:'16px 32px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))'}}>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'17px', background:'transparent',
            border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif',
            fontSize:'16px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← {artistName}
        </button>
      </div>
    </div>
  );
}

function ArtistHomeScreen({ artistData, artistAnswers, onBlock, onResult, onBack, profile, onCatalogue, onNewProject, onEdit, onPending, onProfile }) {
  const t = theme(isDark());

  // Top=Resultado, top-right=DSPs, bot-right=Social,
  // bottom=Video, bot-left=Authority, top-left=Rights
  const vertices = [
    { id:'result',    label:'Resultado', angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];

  const rad = (deg) => deg * Math.PI / 180;

  const getBlockScore = (id) => {
    if (id === 'result') {
      return Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10;
    }
    const block = ARTIST_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const hasAnswers = block.subcats.some(s => s.items.some(item => artistAnswers[item.id] !== undefined));
    return hasAnswers ? Math.round(calcBlockScore(block, artistAnswers)*10)/10 : null;
  };

  const S = 340, cx = S/2, cy = S/2, R = 120;

  // Data polygon — only for blocks with answers
  const dataPolygon = (() => {
    const sorted = [...vertices].sort((a, b) => a.angle - b.angle);
    const pts = sorted.map(v => {
      const score = getBlockScore(v.id);
      if (score === null) return null;
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length === 0) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();
  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));


  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>

      {/* Artist name — tappable to edit */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <button onClick={onEdit} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px 12px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
          {artistData.photo && (
            <img src={artistData.photo} alt="" style={{width:'36px', height:'36px', borderRadius:'50%', objectFit:'cover', flexShrink:0}}/>
          )}
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text, letterSpacing:'-0.5px', lineHeight:1}}>
              {artistData.name}
            </div>
            {(() => {
                const labels = artistData.labelUsers?.length > 0 ? artistData.labelUsers : [artistData.labelUser].filter(Boolean);
                return labels.length > 0 ? (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3, marginTop:'2px'}}>{labels.join(', ')}</div>
                ) : null;
              })()}
          </div>
          <span style={{fontSize:'14px', color:t.text3, marginLeft:'2px'}}>✎</span>
        </button>
      </div>

      {/* Three hexagons — vertical on mobile */}
      {(() => {
        const rad = (deg) => deg * Math.PI / 180;

        // Mini hex renderer
        const MiniHex = ({ title, score, vertices: verts, getScore, onClick, size = 200 }) => {
          const S = size, cxh = S/2, cyh = S/2, R = S * 0.30;
          const hexPts = verts.map(v => ({ x: cxh + R * Math.cos(rad(v.angle)), y: cyh + R * Math.sin(rad(v.angle)) }));
          const dataPoly = (() => {
            const pts = [...verts].sort((a,b)=>a.angle-b.angle).map(v => {
              const s = getScore(v.id); if (s===null) return null;
              const p = Math.max(0.01, s/100);
              return { x: cxh + R*p*Math.cos(rad(v.angle)), y: cyh + R*p*Math.sin(rad(v.angle)) };
            }).filter(Boolean);
            if (pts.length<2) return null;
            return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
          })();

          const inner = (
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'4px', background:'transparent', padding:'4px 8px', cursor: onClick ? 'pointer' : 'default'}}>
              <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, letterSpacing:'0.12em', textTransform:'uppercase'}}>{title}</div>
              <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
                <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0}}>
                  {[0.33,0.66,1].map((sc,ri) => {
                    const ps = hexPts.map(p => ({x:cxh+(p.x-cxh)*sc, y:cyh+(p.y-cyh)*sc}));
                    return <path key={ri} d={ps.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
                  })}
                  {hexPts.map((p,i) => <line key={i} x1={cxh} y1={cyh} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
                  {dataPoly && <path d={dataPoly} fill="rgba(232,21,27,0.12)" stroke="#E8151B" strokeWidth="1.5" strokeLinejoin="round"/>}
                </svg>
                {/* Vertex labels */}
                {verts.map(v => {
                  const s = getScore(v.id);
                  const px = cxh + R * Math.cos(rad(v.angle));
                  const py = cyh + R * Math.sin(rad(v.angle));
                  const isRes = v.id === 'result';
                  if (isRes) {
                    return s !== null ? (
                      <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                        background:t.accent, borderRadius:'20px', padding:'5px 12px',
                        fontFamily:'Arial,sans-serif', fontSize: S > 200 ? '18px' : '13px', fontWeight:'700', color:'#fff', pointerEvents:'none', whiteSpace:'nowrap'}}>
                        {s}
                      </div>
                    ) : null;
                  }
                  return (
                    <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                      background: s!==null ? t.text : t.bg2,
                      border:`1px solid ${s!==null ? t.text : t.border}`,
                      borderRadius:'14px', padding:'3px 7px',
                      fontFamily:'Arial,sans-serif', pointerEvents:'none', whiteSpace:'nowrap', textAlign:'center'}}>
                      <div style={{fontSize:'8px', fontWeight:'700', color: s!==null ? t.bg : t.text3, letterSpacing:'0.05em', textTransform:'uppercase'}}>{v.label}</div>
                      {s!==null && <div style={{fontSize:'10px', fontWeight:'700', color:t.bg, lineHeight:1}}>{s}</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );

          return onClick
            ? <button onClick={onClick} style={{background:'transparent', border:'none', padding:0}}>{inner}</button>
            : <div>{inner}</div>;
        };

        // Scores
        const artistScore = Object.keys(artistAnswers).length > 0 ? Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10 : null;
        const artistProjects = _projects.filter(p => p.artistId === artistData?.id);
        const projScores = artistProjects.map(p => {
          const ans = p.answers||{}; return Object.keys(ans).length>0 ? calcTotalScore(SONG_BLOCKS, ans) : null;
        }).filter(s=>s!==null);
        const catAvg = projScores.length>0 ? Math.round(projScores.reduce((a,b)=>a+b,0)/projScores.length*10)/10 : null;
        const generalScore = (() => {
          if (catAvg!==null && artistScore!==null) return Math.round((catAvg*0.7+artistScore*0.3)*10)/10;
          if (catAvg!==null) return catAvg;
          if (artistScore!==null) return artistScore;
          return null;
        })();

        // Block score getters
        const getArtistBlockScore = (id) => {
          if (id==='result') return artistScore;
          const b = ARTIST_BLOCKS.find(x=>x.id===id); if (!b) return null;
          const has = b.subcats.some(s=>s.items.some(i=>artistAnswers[i.id]!==undefined));
          return has ? Math.round(calcBlockScore(b,artistAnswers)*10)/10 : null;
        };
        const getCatBlockScore = (id) => {
          if (id==='result') return catAvg;
          const b = SONG_BLOCKS.find(x=>x.id===id); if (!b) return null;
          const scores = artistProjects.map(p => {
            const ans=p.answers||{}; const has=b.subcats.some(s=>s.items.some(i=>ans[i.id]!==undefined));
            return has ? calcBlockScore(b,ans) : null;
          }).filter(s=>s!==null);
          return scores.length>0 ? Math.round(scores.reduce((a,c)=>a+c,0)/scores.length*10)/10 : null;
        };
        const getGeneralBlockScore = (id) => {
          if (id==='result') return generalScore;
          const a = getArtistBlockScore(id); const c = getCatBlockScore(id);
          if (a!==null && c!==null) return Math.round((c*0.7+a*0.3)*10)/10;
          if (c!==null) return c; if (a!==null) return a; return null;
        };

        const artistVerts = [
          {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
          {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
          {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
        ];
        const songVerts = [
          {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
          {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
          {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
        ];

        return (
          <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8px 16px', gap:'8px', overflowY:'auto', width:'100%'}}>
            {/* General only */}
            <MiniHex title="General" score={generalScore} vertices={artistVerts} getScore={getGeneralBlockScore} size={Math.min(window.innerWidth * 0.86, 400)}/>
          </div>
        );
      })()}

      {/* Action buttons */}
      <div style={{padding:'12px 24px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))', display:'flex', flexDirection:'column', gap:'10px'}}>
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={onProfile}
            style={{flex:1, padding:'16px', background:t.card, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 2px 8px ${t.shadow}`}}>
            Perfil
          </button>
          <button onClick={onCatalogue}
            style={{flex:1, padding:'16px', background:t.card, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', boxShadow:`0 2px 8px ${t.shadow}`}}>
            Catálogo
          </button>
        </div>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'14px', background:'transparent', border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← Roster
        </button>
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST PROFILE SCREEN — single hexagon with all 6 blocks
// ═══════════════════════════════════════════
function ArtistProfileScreen({ artistData, artistAnswers, onBack, onBlock, onResult, onPending }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;
  const vertices = [
    { id:'result',    label:'Resultado', angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];
  const getBlockScore = (id) => {
    if (id === 'result') {
      const has = ARTIST_BLOCKS.some(b => b.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined)));
      return has ? Math.round(calcTotalScore(ARTIST_BLOCKS, artistAnswers)*10)/10 : null;
    }
    const block = ARTIST_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const has = block.subcats.some(s => s.items.some(i => artistAnswers[i.id] !== undefined));
    return has ? Math.round(calcBlockScore(block, artistAnswers)*10)/10 : null;
  };
  const S = 340, cx = S/2, cy = S/2, R = 120;
  const hexPoints = vertices.map(v => ({ x: cx + R * Math.cos(rad(v.angle)), y: cy + R * Math.sin(rad(v.angle)) }));
  const dataPolygon = (() => {
    const pts = [...vertices].sort((a,b)=>a.angle-b.angle).map(v => {
      const s = getBlockScore(v.id); if (s===null) return null;
      const p = Math.max(0.01, s/100);
      return { x: cx + R*p*Math.cos(rad(v.angle)), y: cy + R*p*Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length<2) return null;
    return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Volver</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Perfil · {artistData.name}</div>
        <div style={{width:'60px'}}/>
      </div>
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33,0.66,1].map((scale,ri) => {
              const pts = hexPoints.map(p => ({x:cx+(p.x-cx)*scale, y:cy+(p.y-cy)*scale}));
              return <path key={ri} d={pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {hexPoints.map((p,i) => <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
            {dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
          </svg>
          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getBlockScore(v.id);
            const isResult = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id} onClick={() => isResult ? onResult() : onBlock(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isResult ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isResult ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'6px 12px', cursor:'pointer', minWidth:'62px',
                  boxShadow: hasScore||isResult ? `0 2px 10px ${t.shadow}` : 'none'}}>
                {!isResult && <div style={{fontFamily:'Arial,sans-serif', fontSize:'9px', fontWeight:'700', color: hasScore ? t.bg : t.text2, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap'}}>{v.label}</div>}
                {(hasScore || isResult) && <div style={{fontFamily:'Arial,sans-serif', fontSize: isResult?'20px':'12px', fontWeight:'700', color: isResult?'#fff':t.bg, lineHeight:1}}>{score}</div>}
              </button>
            );
          })}
        </div>
      </div>
      {onPending && (
        <div style={{padding:'12px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))'}}>
          <button onClick={onPending}
            style={{width:'100%', padding:'15px', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
            <span style={{fontSize:'16px'}}>📋</span> Tareas pendientes
          </button>
        </div>
      )}
    </div>
  );
}

function HexRadarTotal({ blocks, answers }) {
  const S = 320, cx = S/2, cy = S/2 + 10, maxR = S * 0.30;
  const ang = (i) => Math.PI * 2 * i / 6 - Math.PI / 2;
  const ptXY = (i, pct) => [
    cx + (Math.max(0,pct)/100) * maxR * Math.cos(ang(i)),
    cy + (Math.max(0,pct)/100) * maxR * Math.sin(ang(i))
  ];
  const outerXY = (i) => [cx + maxR*Math.cos(ang(i)), cy + maxR*Math.sin(ang(i))];

  const bs = {};
  blocks.forEach(b => { bs[b.id] = Math.round(calcBlockScore(b,answers)*10)/10; });
  const total = Math.round(calcTotalScore(blocks,answers)*10)/10;

  // 0=TOTAL(top), 1=DSPs(top-right), 2=YT&Video(bot-right),
  // 3=Authority(bottom), 4=Rights(bot-left), 5=Social(top-left)
  const vals   = [total, bs.dsps||0, bs.ytvideo||0, bs.authority||0, bs.rights||0, bs.social||0];
  const labels = ["TOTAL","DSPs","YT&VIDEO","AUTHORITY","RIGHTS","SOCIAL"];

  const rings = [100,75,50,25];
  const ringFills = ["#252525","#2c2c2c","#333","#3a3a3a"];

  const hexPath = (pct) => rings && Array.from({length:6},(_,i)=>ptXY(i,pct))
    .map(([x,y],i)=>`${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ")+" Z";

  const dataPath = vals.map((v,i)=>{
    const [x,y]=ptXY(i,Math.max(1,v));
    return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ")+" Z";

  const labelR = maxR + 34;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{overflow:"visible",maxWidth:"100%"}}>
        {/* Grid rings outer→inner */}
        {rings.map((pct,ri)=>(
          <path key={pct} d={hexPath(pct)} fill={ringFills[ri]} stroke="#555" strokeWidth="0.8"/>
        ))}
        {/* Spokes */}
        {Array.from({length:6},(_,i)=>{
          const [x2,y2]=outerXY(i);
          return <line key={i} x1={cx.toFixed(1)} y1={cy.toFixed(1)} x2={x2.toFixed(1)} y2={y2.toFixed(1)} stroke="#666" strokeWidth="0.8"/>;
        })}
        {/* Data fill */}
        <path d={dataPath} fill="rgba(255,102,120,0.20)" stroke="#ff6678" strokeWidth="2.5" strokeLinejoin="round"/>
        {/* Dots */}
        {vals.map((v,i)=>{
          const [x,y]=ptXY(i,Math.max(1,v));
          return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={i===0?"5":"4"} fill="#ff6678" stroke={i===0?"#fff":"none"} strokeWidth="1.5"/>;
        })}
        {/* Labels */}
        {labels.map((lbl,i)=>{
          const lx=cx+labelR*Math.cos(ang(i));
          const ly=cy+labelR*Math.sin(ang(i));
          const anchor=lx<cx-8?"end":lx>cx+8?"start":"middle";
          return (
            <g key={i}>
              <text x={lx.toFixed(1)} y={(ly-7).toFixed(1)} textAnchor={anchor} dominantBaseline="middle"
                fontSize={i===0?"11":"9"} fontWeight="700" fontFamily="Arial,sans-serif"
                fill={i===0?"#ffffff":"#cccccc"}>
                {lbl}
              </text>
              <text x={lx.toFixed(1)} y={(ly+7).toFixed(1)} textAnchor={anchor} dominantBaseline="middle"
                fontSize={i===0?"13":"11"} fontWeight="700" fontFamily="Arial,sans-serif"
                fill="#ff6678">
                {vals[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════
// HOME BUTTON — fixed on every screen
// ═══════════════════════════════════════════
function HomeButton({ onHome, dark }) {
  const t = theme(isDark());
  const [confirm, setConfirm] = useState(false);
  if (confirm) return (
    <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
      <span style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text2}}>¿Ir al inicio?</span>
      <button onClick={onHome} style={{background:t.accent, border:'none', color:'#fff', fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', padding:'4px 10px', borderRadius:'6px', cursor:'pointer'}}>Sí</button>
      <button onClick={() => setConfirm(false)} style={{background:t.bg3, border:`1px solid ${t.border}`, color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'11px', padding:'4px 10px', borderRadius:'6px', cursor:'pointer'}}>No</button>
    </div>
  );
  return (
    <button onClick={() => setConfirm(true)} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px', display:'flex', alignItems:'center', gap:'4px'}}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.text2} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </button>
  );
}

// ═══════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════
function SplashScreen({ onDone }) {
  const t = theme(isDark());
  const [scale, setScale] = useState(0.3);
  const [opacity, setOpacity] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => { setScale(1); setOpacity(1); }, 50);
    // Fade out after 2.2s
    setTimeout(() => setFadeOut(true), 1000);
    setTimeout(() => onDone(), 1300);
  }, []);

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9999,
      background: t.bg,
      display:'flex', alignItems:'center', justifyContent:'center',
      opacity: fadeOut ? 0 : 1,
      transition: fadeOut ? 'opacity 0.5s ease' : 'none',
    }}>
      <img
        src={RIMAS_LOGO}
        alt="Ri+D"
        style={{
          width:'180px',
          height:'180px',
          objectFit:'contain',
          transform: `scale(${scale})`,
          opacity,
          transition:'transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.4s ease',
          filter: isDark() ? 'invert(1)' : 'none',
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════
// PROFILE SELECTION
// ═══════════════════════════════════════════

function ProfileSelect({ onSelect }) {
  const t = theme(isDark());
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('name'); // 'name' | 'password'
  const [error, setError] = useState('');

  const handleEnter = () => {
    const n = name.trim();
    if (!n) { setError('Escribe tu nombre'); return; }

    if (n.toLowerCase() === 'admin') {
      if (step === 'name') {
        setStep('password');
        setError('');
        return;
      }
      // password step
      if (password === 'Fedora') {
        onSelect({ type: 'admin', name: 'Admin' });
      } else {
        setError('Contraseña incorrecta');
      }
      return;
    }

    // All other profiles disabled for now
    setError('Acceso no disponible. Contacta con el administrador.');
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px', paddingTop:'max(40px,env(safe-area-inset-top,40px))'}}>

      <img src={RIMAS_LOGO} alt="Ri+D" style={{width:'56px', height:'56px', objectFit:'contain', marginBottom:'56px', filter: isDark() ? 'invert(1)' : 'none'}}/>

      <div style={{width:'100%', maxWidth:'320px'}}>
        {step === 'name' ? (
          <input
            key="name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="¿Quién eres?"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        ) : (
          <input
            key="password"
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleEnter()}
            placeholder="Contraseña"
            autoFocus
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${error ? '#E8151B' : t.border}`, borderRadius:0, padding:'12px 0', fontFamily:'Arial,sans-serif', fontSize:'24px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', boxSizing:'border-box', textAlign:'center'}}
          />
        )}

        {error && (
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'10px', textAlign:'center'}}>{error}</div>
        )}

        <button onClick={handleEnter} style={{display:'block', margin:'40px auto 0', background:'transparent', border:'none', cursor:'pointer', padding:'8px'}}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke={t.text3} strokeWidth="1.5"/>
            <path d="M13 16h8M17 12l4 4-4 4" stroke={t.text} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {step === 'password' && (
          <button onClick={() => { setStep('name'); setPassword(''); setError(''); }}
            style={{display:'block', margin:'16px auto 0', background:'transparent', border:'none', color:t.text3, fontFamily:'Arial,sans-serif', fontSize:'13px', cursor:'pointer'}}>
            ← Volver
          </button>
        )}
      </div>
    </div>
  );
}
// Shows: block score + subcategory breakdown (no hex)
// ═══════════════════════════════════════════

// ═══════════════════════════════════════════
// ARTIST LIST SCREEN
// ═══════════════════════════════════════════
function ArtistListScreen({ profile, onBack, onSelect, onCreate, liveArtists }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [editingManagement, setEditingManagement] = useState(null);
  const [mgmtInput, setMgmtInput] = useState('');
  const allArtists = liveArtists || getArtists();
  const artists = profile.type === 'admin'
    ? allArtists
    : profile.type === 'label'
    ? allArtists.filter(a => a.labelUser === profile.name || (a.labelUsers && a.labelUsers.includes(profile.name)))
    : profile.type === 'management'
    ? allArtists.filter(a => a.management && a.management.split(';').map(m => m.trim().toLowerCase()).includes(profile.name.toLowerCase()))
    : allArtists.filter(a => a.name?.toLowerCase() === profile.name?.toLowerCase());

  const canEdit = profile.type === 'label' || profile.type === 'admin';

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDelete = () => {
    deleteArtists(selected);
    setSelected([]);
    setEditMode(false);
  };

  const [selectedLabels, setSelectedLabels] = useState([]);
  useEffect(() => {
    if (editingManagement) {
      setSelectedLabels(editingManagement.labelUsers || [editingManagement.labelUser].filter(Boolean));
    }
  }, [editingManagement?.id]);
  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleSaveManagement = (extraLabelUsers) => {
    const managers = mgmtInput.split(';').map(m => m.trim()).filter(Boolean);
    try {
      const existing = getMgmtUsers();
      managers.forEach(m => { existing[m] = true; });
      saveMgmtUsers(existing);
    } catch(e) {}
    const updated = { ...editingManagement, management: managers.join('; '), labelUsers: extraLabelUsers };
    saveOneArtist(updated);
    setEditingManagement(null);
    setMgmtInput('');
  };

  // Management edit modal
  if (editingManagement) {
    const allLabelUsers = Object.keys(getLabelUsers());

    return (
      <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
        <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
          <button onClick={() => setEditingManagement(null)} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{editingManagement.name}</div>
          <div style={{width:'60px'}}/>
        </div>

        <div style={{flex:1, overflowY:'auto', padding:'32px 24px'}}>
          {/* Management */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
            <input value={mgmtInput} onChange={e => setMgmtInput(e.target.value)}
              placeholder="Nombre del manager"
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'18px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}/>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para añadir más de un manager</div>
          </div>

          {/* Label co-owners */}
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(name => {
                const isSelected = selectedLabels.includes(name);
                return (
                  <button key={name} onClick={() => toggleLabel(name)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{name}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
          <button onClick={() => handleSaveManagement(selectedLabels)}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Guardar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Roster</div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          {canEdit && !editMode && (
            <button onClick={() => setEditMode(true)}
              style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"14px", cursor:"pointer", padding:0 }}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{ background:"transparent", border:"none", color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"700", cursor: selected.length > 0 ? "pointer" : "default", padding:0 }}>
              Eliminar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onCreate}
              style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px" }}>
        {artists.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎤</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"10px" }}>No tienes artistas en tu Roster todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:t.text2, marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Añade tu primer artista al Roster para empezar a evaluar</div>
            <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
              + Nuevo artista
            </button>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {artists.map((artist, i) => (
              <button key={artist.id || i}
                onClick={() => editMode ? toggleSelect(artist.id) : onSelect(artist)}
                style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:t.card, border:`1px solid ${editMode && selected.includes(artist.id) ? '#E8151B' : t.border}`, borderRadius:"16px", cursor:"pointer", textAlign:"left", width:"100%", boxShadow:`0 2px 8px ${t.shadow}` }}>

                {/* Checkbox in edit mode */}
                {editMode && (
                  <div style={{ width:"22px", height:"22px", borderRadius:"50%", border:`2px solid ${selected.includes(artist.id) ? '#E8151B' : t.border}`, background: selected.includes(artist.id) ? '#E8151B' : 'transparent', display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    {selected.includes(artist.id) && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                  </div>
                )}

                {artist.photo ? (
                  <img src={artist.photo} alt="" style={{ width:"48px", height:"48px", borderRadius:"50%", objectFit:"cover", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:t.bg2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"22px" }}>🎤</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"2px" }}>{artist.name}</div>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2 }}>
                    {(artist.labelUsers?.length > 0 ? artist.labelUsers : [artist.labelUser].filter(Boolean)).join(', ') || "Sin label manager"}
                  </div>
                </div>
                {!editMode && (() => {
                  const ans = artist.answers || {};
                  const answered = Object.keys(ans).length;
                  if (answered === 0) return null;
                  const score = Math.round(calcTotalScore(ARTIST_BLOCKS, ans) * 10) / 10;
                  return <div style={{ fontFamily:"Arial,sans-serif", fontSize:"18px", fontWeight:"700", color:scoreColor(score), flexShrink:0, marginRight:'4px' }}>{score}</div>;
                })()}
                {!editMode && canEdit && (
                  <button onClick={e => { e.stopPropagation(); setEditingManagement(artist); setMgmtInput(artist.management || ''); }}
                    style={{ background:"transparent", border:"none", color:t.text3, fontFamily:"Arial,sans-serif", fontSize:"12px", cursor:"pointer", padding:"4px 8px", flexShrink:0 }}>
                    ✎
                  </button>
                )}
                {!editMode && <div style={{ color:t.text3, fontSize:"18px" }}>›</div>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT (SONG) LIST SCREEN
// ═══════════════════════════════════════════
function ProjectListScreen({ profile, onBack, onCreate, onSelect }) {
  const t = theme(isDark());
  useFirebaseStore();
  const allArtists = getArtists();
  const myArtists = profile.type === 'admin'
    ? allArtists
    : profile.type === 'label'
    ? allArtists.filter(a => a.labelUser === profile.name || (a.labelUsers && a.labelUsers.includes(profile.name)))
    : profile.type === 'management'
    ? allArtists.filter(a => a.management && a.management.split(';').map(m => m.trim().toLowerCase()).includes(profile.name.toLowerCase()))
    : allArtists.filter(a => a.name?.toLowerCase() === profile.name?.toLowerCase());

  const myArtistIds = new Set(myArtists.map(a => a.id));
  const allProjects = _projects
    .filter(p => myArtistIds.has(p.artistId))
    .map(p => {
      const artist = myArtists.find(a => a.id === p.artistId);
      return { ...p, artistName: artist?.name || p.artistName, artistPhoto: artist?.photo || null };
    })
    .sort((a, b) => {
      const da = a.date ? new Date(a.date) : a.createdAt ? new Date(a.createdAt) : new Date(0);
      const db2 = b.date ? new Date(b.date) : b.createdAt ? new Date(b.createdAt) : new Date(0);
      return db2 - da;
    });

  return (
    <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
      <div style={{ padding:"16px 20px", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${t.border}` }}>
        <button onClick={onBack} style={{ background:"transparent", border:"none", color:t.text2, fontFamily:"Arial,sans-serif", fontSize:"15px", cursor:"pointer", padding:0 }}>← Atrás</button>
        <div style={{ fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", color:t.text }}>Catálogo</div>
        {(profile.type === 'label' || profile.type === 'admin') ? (
          <button onClick={onCreate} style={{ background:"transparent", border:"none", color:t.accent, fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer", padding:0 }}>+ Nuevo</button>
        ) : <div style={{width:'50px'}}/>}
      </div>

      <div style={{ flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"24px 20px" }}>
        {allProjects.length === 0 ? (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", textAlign:"center" }}>
            <div style={{ fontSize:"56px", marginBottom:"20px" }}>🎵</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, marginBottom:"10px" }}>No tienes canciones todavía</div>
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"14px", color:t.text2, marginBottom:"32px", maxWidth:"260px", lineHeight:"1.5" }}>Crea tu primera canción para empezar a evaluar su presencia digital</div>
            {(profile.type === 'label' || profile.type === 'admin') && (
              <button onClick={onCreate} style={{ padding:"16px 32px", background:t.accent, color:"white", border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
                + Nuevo proyecto
              </button>
            )}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            {allProjects.map((p, i) => (
              <button key={p.id || i} onClick={() => onSelect && onSelect(p)}
                style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px", background:t.card, border:`1px solid ${t.border}`, borderRadius:"16px", boxShadow:`0 2px 8px ${t.shadow}`, cursor:"pointer", textAlign:"left", width:"100%" }}>
                {p.photo ? (
                  <img src={p.photo} alt="" style={{ width:"48px", height:"48px", borderRadius:"10px", objectFit:"cover", flexShrink:0 }}/>
                ) : (
                  <div style={{ width:"48px", height:"48px", borderRadius:"10px", background:t.bg2, border:`1px solid ${t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:"22px" }}>🎵</div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text, marginBottom:"2px" }}>{p.title || "Sin título"}</div>
                  <div style={{ fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2 }}>{p.artistName}{p.date ? ` · ${p.date}` : ""}</div>
                </div>
                {(() => {
                  const liveScore = p.score !== undefined ? p.score : (p.answers && Object.keys(p.answers).length > 0 ? Math.round(calcTotalScore(SONG_BLOCKS, p.answers) * 10) / 10 : null);
                  return liveScore !== null ? (
                    <div style={{ fontFamily:"Arial,sans-serif", fontSize:"20px", fontWeight:"700", color:scoreColor(liveScore), flexShrink:0 }}>{liveScore}</div>
                  ) : null;
                })()}
                <div style={{ color:t.text3, fontSize:"18px" }}>›</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW ARTIST FORM — 3 steps
// ═══════════════════════════════════════════
function NewArtistForm({ profile, onBack, onSave }) {
  const t = theme(isDark());
  const [step, setStep] = useState(1); // 1=nombre, 2=management, 3=label managers, 4=foto
  const [artistName, setArtistName] = useState('');
  const [management, setManagement] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([profile.name].filter(Boolean));
  const [photo, setPhoto] = useState(null);
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (name) => setSelectedLabels(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    // Auto-register artist as a user profile
    registerArtistUser(artistName.trim());
    onSave({
      name: artistName.trim(),
      management: managers.join('; '),
      photo,
      labelUser: profile.name,
      labelUsers: selectedLabels.filter(n => n === profile.name || allLabelUsers.includes(n)),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
  };

  const steps = ['Nombre', 'Management', 'Label', 'Foto'];
  const canNext = step === 1 ? !!artistName.trim() : true;

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Topbar */}
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => step > 1 ? setStep(s => s-1) : onBack()}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>{steps[step-1]}</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>{step}/4</div>
      </div>

      {/* Progress dots */}
      <div style={{display:'flex', justifyContent:'center', gap:'6px', padding:'16px 0 0'}}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{width: i === step ? '20px' : '6px', height:'6px', borderRadius:'3px', background: i <= step ? t.text : t.border, transition:'all 0.3s ease'}}/>
        ))}
      </div>

      {/* Step content */}
      <div style={{flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 32px'}}>

        {step === 1 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && artistName.trim() && setStep(2)}
              placeholder="Nombre del artista"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
          </div>
        )}

        {step === 2 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={management}
              onChange={e => setManagement(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && setStep(3)}
              placeholder="Management"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de un manager</div>
          </div>
        )}

        {step === 3 && (
          <div style={{width:'100%', maxWidth:'320px'}}>
            <input
              value={selectedLabels.filter(n => n !== profile.name).join('; ')}
              onChange={e => {
                const names = e.target.value.split(';').map(m => m.trim()).filter(Boolean);
                setSelectedLabels([profile.name, ...names]);
              }}
              onKeyDown={e => e.key === 'Enter' && setStep(4)}
              placeholder="Otro label manager"
              autoFocus
              style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none', textAlign:'center'}}
            />
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, textAlign:'center', marginTop:'10px'}}>Separa con ; para añadir más de uno</div>
            {/* Validate — show warning if name doesn't exist */}
            {selectedLabels.filter(n => n !== profile.name).map(name => {
              const exists = allLabelUsers.includes(name);
              return (
                <div key={name} style={{fontFamily:'Arial,sans-serif', fontSize:'12px', marginTop:'8px', textAlign:'center', color: exists ? '#16a34a' : '#E8151B'}}>
                  {name}: {exists ? '✓ encontrado' : '✗ no existe como Label Manager'}
                </div>
              );
            })}
          </div>
        )}

        {step === 4 && (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:'24px'}}>
            <div onClick={() => fileRef.current.click()}
              style={{width:'120px', height:'120px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
              {photo
                ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                : <span style={{fontSize:'36px'}}>📷</span>
              }
            </div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text3}}>
              {photo ? 'Toca para cambiar' : 'Toca para añadir foto'}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
          </div>
        )}

      </div>

      {/* Bottom button */}
      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        {step < 4 ? (
          <button onClick={() => canNext && setStep(s => s+1)}
            style={{display:'block', width:'100%', padding:'17px', background: canNext ? t.text : t.bg2, color: canNext ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: canNext ? 'pointer' : 'default', transition:'all 0.2s'}}>
            Siguiente →
          </button>
        ) : (
          <button onClick={handleSave}
            style={{display:'block', width:'100%', padding:'17px', background:t.text, color:t.bg, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
            Crear artista
          </button>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT FORM — with artist linkage
// ═══════════════════════════════════════════
function ProjectForm({ profile, songNum, onBack, onSubmit, prefilledArtist }) {
  const t = theme(isDark());
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [participants, setParticipants] = useState('');
  const [artistInput, setArtistInput] = useState(prefilledArtist?.name || '');
  const [linkedArtist, setLinkedArtist] = useState(prefilledArtist || null);
  const [artistError, setArtistError] = useState('');

  const allArtists = getArtists();

  const handleArtistChange = (val) => {
    setArtistInput(val);
    setArtistError('');
    const found = allArtists.find(a => a.name && a.name.toLowerCase() === val.toLowerCase());
    setLinkedArtist(found || null);
    if (val.trim() && !found) setArtistError('Artista no encontrado');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title, date, participants, artistName: linkedArtist?.name || artistInput, linkedArtist });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Nuevo proyecto</div>
        <div style={{width:'60px'}}/>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Artista */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
          <input
            value={artistInput}
            onChange={e => handleArtistChange(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${artistError ? '#E8151B' : linkedArtist ? '#16a34a' : t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          {linkedArtist && (
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#16a34a', marginTop:'6px', display:'flex', alignItems:'center', gap:'6px'}}>
              {linkedArtist.photo && <img src={linkedArtist.photo} alt="" style={{width:'20px', height:'20px', borderRadius:'50%', objectFit:'cover'}}/>}
              ✓ Vinculado a {linkedArtist.name}
            </div>
          )}
          {artistError && <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:'#E8151B', marginTop:'6px'}}>{artistError}</div>}
        </div>

        {/* Título */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Fecha */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participantes */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes / Featurings</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Nombres separados por coma"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSubmit} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Continuar →
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT HOME SCREEN — hexagon nav for songs
// ═══════════════════════════════════════════
function ProjectHomeScreen({ songData, songAnswers, onBlock, onResult, onBack, onEdit, onPending }) {
  const t = theme(isDark());
  const rad = (deg) => deg * Math.PI / 180;

  const vertices = [
    { id:'result',    label:'Total',     angle: -90 },
    { id:'social',    label:'Social',    angle: -30 },
    { id:'ytvideo',   label:'Video',     angle:  30 },
    { id:'rights',    label:'Rights',    angle:  90 },
    { id:'authority', label:'Authority', angle: 150 },
    { id:'dsps',      label:'DSPs',      angle: 210 },
  ];

  const S = 340, cx = S/2, cy = S/2, R = 120;

  const getBlockScore = (id) => {
    if (id === 'result') {
      return Math.round(calcTotalScore(SONG_BLOCKS, songAnswers) * 10) / 10;
    }
    const block = SONG_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const hasAnswers = block.subcats.some(s => s.items.some(i => songAnswers[i.id] !== undefined));
    return hasAnswers ? Math.round(calcBlockScore(block, songAnswers) * 10) / 10 : null;
  };

  const hexPoints = vertices.map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  const sortedPoints = [...vertices].sort((a,b) => a.angle - b.angle).map(v => ({
    x: cx + R * Math.cos(rad(v.angle)),
    y: cy + R * Math.sin(rad(v.angle)),
  }));

  const dataPolygon = (() => {
    const sorted = [...vertices].sort((a, b) => a.angle - b.angle);
    const pts = sorted.map(v => {
      const score = getBlockScore(v.id);
      if (score === null) return null;
      const pct = Math.max(0.01, score / 100);
      return { x: cx + R * pct * Math.cos(rad(v.angle)), y: cy + R * pct * Math.sin(rad(v.angle)) };
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      {/* Title */}
      <div style={{padding:'32px 24px 0', paddingTop:'max(32px,env(safe-area-inset-top,32px))', textAlign:'center'}}>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'13px', fontWeight:'600', color:t.text3, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'4px'}}>Catálogo</div>
        <button onClick={onEdit} style={{background:'transparent', border:'none', cursor:'pointer', padding:'4px 12px', borderRadius:'12px', display:'inline-flex', alignItems:'center', gap:'8px'}}>
          {songData?.photo && (
            <img src={songData.photo} alt="" style={{width:'32px', height:'32px', borderRadius:'8px', objectFit:'cover', flexShrink:0}}/>
          )}
          <div style={{textAlign:'left'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'28px', fontWeight:'700', color:t.text, lineHeight:1}}>{songData?.title || 'Sin título'}</div>
            {songData?.artistName && (
              <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginTop:'2px'}}>{songData.artistName}</div>
            )}
          </div>
          <span style={{fontSize:'14px', color:t.text3}}>✎</span>
        </button>
      </div>

      {/* Hexagon */}
      <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px'}}>
        <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
          <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0, pointerEvents:'none'}}>
            {[0.33, 0.66, 1].map((scale, ri) => {
              const pts = sortedPoints.map(p => ({ x: cx+(p.x-cx)*scale, y: cy+(p.y-cy)*scale }));
              const path = pts.map((p,i) => `${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
              return <path key={ri} d={path} fill="none" stroke={t.border} strokeWidth="1"/>;
            })}
            {sortedPoints.map((p,i) => (
              <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>
            ))}
            {dataPolygon && <path d={dataPolygon} fill="rgba(232,21,27,0.15)" stroke="#E8151B" strokeWidth="2" strokeLinejoin="round"/>}
            {vertices.map(v => {
              const score = getBlockScore(v.id);
              if (!score) return null;
              const pct = score / 100;
              const px = cx + R * pct * Math.cos(rad(v.angle));
              const py = cy + R * pct * Math.sin(rad(v.angle));
              return <circle key={v.id} cx={px.toFixed(1)} cy={py.toFixed(1)} r="4" fill="#E8151B"/>;
            })}
          </svg>

          {vertices.map(v => {
            const px = cx + R * Math.cos(rad(v.angle));
            const py = cy + R * Math.sin(rad(v.angle));
            const score = getBlockScore(v.id);
            const isResult = v.id === 'result';
            const hasScore = score !== null;
            return (
              <button key={v.id} onClick={() => isResult ? onResult() : onBlock(v.id)}
                style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  display:'flex', flexDirection:'column', alignItems:'center', gap:'2px',
                  background: isResult ? t.accent : hasScore ? t.text : t.bg,
                  border:`1.5px solid ${isResult ? t.accent : hasScore ? t.text : t.border}`,
                  borderRadius:'20px', padding:'6px 12px', cursor:'pointer', minWidth:'62px',
                  boxShadow: hasScore||isResult ? `0 2px 10px ${t.shadow}` : 'none', transition:'all 0.2s'}}>
                {!isResult && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'9px', fontWeight:'700',
                    color: hasScore ? t.bg : t.text2, letterSpacing:'0.06em', textTransform:'uppercase', whiteSpace:'nowrap'}}>
                    {v.label}
                  </div>
                )}
                {(hasScore || isResult) && (
                  <div style={{fontFamily:'Arial,sans-serif', fontSize: isResult ? '20px' : '12px',
                    fontWeight:'700', color: isResult?'#fff':t.bg, lineHeight:1}}>{score}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Back button */}
      <div style={{padding:'12px 32px', paddingBottom:'max(24px,env(safe-area-inset-bottom,24px))', display:'flex', flexDirection:'column', gap:'10px'}}>
        <button onClick={onPending}
          style={{width:'100%', padding:'15px', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color:t.text, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}>
          <span style={{fontSize:'16px'}}>📋</span> Tareas pendientes
        </button>
        <button onClick={onBack}
          style={{display:'block', width:'100%', padding:'17px', background:'transparent', border:`1.5px solid ${t.border}`, borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'600', color:t.text2, cursor:'pointer'}}>
          ← Catálogo
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PENDING TASKS SCREEN
// ═══════════════════════════════════════════
function PendingTasksScreen({ blocks, answers, title, onBack, onGoToQuestion }) {
  const t = theme(isDark());

  // Build pending tasks grouped by block > subcat
  // Pending = answered NO (false) OR not yet answered (undefined)
  const groups = blocks.map(block => {
    const subcats = block.subcats.map(sub => {
      const pending = sub.items.filter(item => answers[item.id] !== true);
      return { ...sub, pending };
    }).filter(s => s.pending.length > 0);
    return { ...block, subcats };
  }).filter(b => b.subcats.length > 0);

  const totalPending = groups.reduce((acc, b) => acc + b.subcats.reduce((a, s) => a + s.pending.length, 0), 0);

  // Build a flat index map: itemId → question index
  const questionIndex = {};
  let idx = 0;
  blocks.forEach(block => {
    block.subcats.forEach(sub => {
      sub.items.forEach(item => {
        questionIndex[item.id] = idx++;
      });
    });
  });

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Volver</button>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Tareas pendientes</div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3}}>{title}</div>
        </div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'700', color:'#E8151B'}}>{totalPending}</div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'16px 20px'}}>
        {groups.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', textAlign:'center'}}>
            <div style={{fontSize:'56px', marginBottom:'16px'}}>✅</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Todo al día</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2}}>No hay tareas pendientes</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
            {groups.map(block => (
              <div key={block.id}>
                {/* Block header */}
                <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'12px', paddingTop:'8px'}}>
                  {block.label}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {block.subcats.map(sub => (
                    <div key={sub.id}>
                      {/* Subcat label */}
                      <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', color:t.text2, marginBottom:'8px', marginTop:'12px', paddingLeft:'2px'}}>
                        {sub.label}
                      </div>
                      {/* Tasks */}
                      {sub.pending.map(item => (
                        <button key={item.id}
                          onClick={() => onGoToQuestion(questionIndex[item.id])}
                          style={{display:'flex', alignItems:'center', gap:'12px', width:'100%', padding:'14px 14px', background:t.card, border:`1px solid ${answers[item.id] === false ? '#E8151B44' : t.border}`, borderRadius:'12px', cursor:'pointer', textAlign:'left', marginBottom:'6px'}}>
                          <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${answers[item.id] === false ? '#E8151B' : t.border}`, background: answers[item.id] === false ? '#E8151B18' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                            {answers[item.id] === false
                              ? <span style={{color:'#E8151B', fontSize:'10px', fontWeight:'700'}}>✗</span>
                              : <span style={{color:t.text3, fontSize:'10px'}}>○</span>
                            }
                          </div>
                          <div style={{flex:1, fontFamily:'Arial,sans-serif', fontSize:'13px', color:t.text, lineHeight:'1.4'}}>{item.q}</div>
                          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, flexShrink:0}}>{item.w}pts</div>
                          <div style={{color:t.text3, fontSize:'16px'}}>›</div>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SUBCAT SUMMARY SCREEN — shown after each subcategory
// ═══════════════════════════════════════════
function SubcatSummaryScreen({ subcatInfo, photo, phaseName, onContinue, onBack }) {
  const t = theme(isDark());
  const { subcat, block, answers, isBlockEnd } = subcatInfo || {};

  // Calculate subcat score
  const subcatScore = (() => {
    if (!subcat || !answers) return 0;
    let raw = 0;
    subcat.items.forEach(item => { if (answers[item.id] === true) raw += item.w; });
    return Math.min(100, Math.round(raw * 10) / 10);
  })();

  const color = scoreColor(subcatScore);
  const label = scoreLabel(subcatScore);

  // Item breakdown
  const items = subcat?.items || [];
  const answered = items.filter(i => answers?.[i.id] !== undefined);
  const correct = items.filter(i => answers?.[i.id] === true);
  const missed = items.filter(i => answers?.[i.id] === false);

  // Ring animation
  const circumference = 2 * Math.PI * 44;
  const strokeDashoffset = circumference - (subcatScore / 100) * circumference;

  return (
    <div style={{minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column", overflow:"hidden"}}>

      {/* Colored accent bar top */}
      <div style={{height:"3px", background:`linear-gradient(90deg, ${color}, ${color}88)`}}/>

      {/* Header */}
      <div style={{padding:"14px 20px", paddingTop:"max(14px, env(safe-area-inset-top,14px))", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <button onClick={onBack} style={{background:"transparent", border:"none", color:t.text3, fontFamily:"Arial,sans-serif", fontSize:"13px", cursor:"pointer", padding:0}}>← Revisar</button>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.1em", textTransform:"uppercase"}}>{phaseName}</div>
        <div style={{width:"60px"}}/>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"8px 24px 16px"}}>

        {/* Block > Subcat breadcrumb */}
        <div style={{display:"flex", alignItems:"center", gap:"6px", marginBottom:"20px"}}>
          <span style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.08em", textTransform:"uppercase"}}>{block?.label}</span>
          <span style={{color:t.text3, fontSize:"10px"}}>›</span>
          <span style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:color, letterSpacing:"0.08em", textTransform:"uppercase"}}>{subcat?.label}</span>
        </div>

        {/* Score ring + number */}
        <div style={{display:"flex", alignItems:"center", gap:"24px", marginBottom:"28px", padding:"20px", background:t.bg2, borderRadius:"20px", border:`1px solid ${t.border}`}}>
          <div style={{position:"relative", flexShrink:0}}>
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke={t.bg3} strokeWidth="8"/>
              <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 50 50)"
                style={{transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}
              />
            </svg>
            <div style={{position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
              <div style={{fontFamily:"Arial,sans-serif", fontSize:"26px", fontWeight:"700", color:t.text, lineHeight:1}}>{subcatScore}</div>
              <div style={{fontFamily:"Arial,sans-serif", fontSize:"9px", color:t.text3}}>/100</div>
            </div>
          </div>
          <div style={{flex:1, minWidth:0}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"22px", fontWeight:"700", color:t.text, lineHeight:1.1, marginBottom:"6px"}}>{subcat?.label}</div>
            <div style={{display:"inline-block", padding:"3px 12px", borderRadius:"20px", background:color+"18", border:`1px solid ${color}44`, fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color, marginBottom:"8px"}}>{label}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:t.text3}}>{correct.length}/{items.length} completadas</div>
          </div>
        </div>

        {/* Item breakdown */}
        <div style={{marginBottom:"16px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose</div>
          <div style={{display:"flex", flexDirection:"column", gap:"6px"}}>
            {items.map(item => {
              const isYes = answers?.[item.id] === true;
              const isNo = answers?.[item.id] === false;
              const isUnanswered = answers?.[item.id] === undefined;
              return (
                <div key={item.id} style={{display:"flex", alignItems:"center", gap:"10px", padding:"10px 12px", background:t.card, border:`1px solid ${isYes ? color+"44" : t.border}`, borderRadius:"10px"}}>
                  <div style={{width:"20px", height:"20px", borderRadius:"50%", background: isYes ? color+"22" : t.bg2, border:`1.5px solid ${isYes ? color : t.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                    <span style={{fontSize:"10px", color: isYes ? color : t.text3}}>{isYes ? "✓" : isNo ? "✗" : "–"}</span>
                  </div>
                  <div style={{flex:1, minWidth:0, fontFamily:"Arial,sans-serif", fontSize:"12px", color: isUnanswered ? t.text3 : t.text, lineHeight:"1.3"}}>{item.q}</div>
                  <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color: isYes ? color : t.text3, flexShrink:0}}>{isYes ? `+${item.w}` : `${item.w}pts`}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block end note */}
        {isBlockEnd && (
          <div style={{padding:"12px 14px", background:t.bg2, borderRadius:"12px", border:`1px solid ${t.border}`, marginBottom:"8px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"2px"}}>Bloque completado</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text2}}>Has terminado todas las preguntas de {block?.label}</div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{padding:"12px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom,16px))", borderTop:`1px solid ${t.border}`}}>
        <button onClick={onContinue}
          style={{display:"block", width:"100%", padding:"17px", background:t.text, color:t.bg, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", cursor:"pointer"}}>
          {isBlockEnd ? `Ver resumen · ${block?.label}` : "Continuar →"}
        </button>
      </div>
    </div>
  );
}

function BlockSummaryScreen({ block, answers, blockIndex, totalBlocks, phaseName, photo, onContinue, onBack }) {
  const t = theme(isDark());
  const blockScore = Math.round(calcBlockScore(block, answers)*10)/10;

  // subcategory scores
  const subcatScores = block.subcats.map(sub => {
    let raw = 0;
    sub.items.forEach(item => { if (answers[item.id] === true) raw += item.w; });
    return { label: sub.label, score: Math.min(100, Math.round(raw*10)/10), weight: sub.subcatWeight };
  });

  return (
    <div style={{minHeight:"100dvh", background:bgColor(70), display:"flex", flexDirection:"column"}}>
      {/* Header */}
      <div style={{padding:"16px 20px 0", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase"}}>{phaseName}</div>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)"}}>Bloque {blockIndex}/{totalBlocks}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"16px 20px 8px"}}>
        {/* Block title */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px"}}>
          {photo && <img src={photo} alt="" style={{width:"40px",height:"40px",borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.3)"}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em", textTransform:"uppercase"}}>Resumen · Bloque {blockIndex}</div>
            <div style={{fontFamily:"'Arial Black',Arial,sans-serif", fontSize:"22px", fontWeight:"900", color:"white", textTransform:"uppercase"}}>{block.label}</div>
          </div>
        </div>

        {/* Block score big */}
        <div style={{textAlign:"center", marginBottom:"20px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"rgba(0,0,0,0.35)", borderRadius:"18px", padding:"16px 32px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"56px", fontWeight:"700", color:scoreColor(blockScore), lineHeight:1}}>{blockScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)", marginTop:"4px"}}>/ 100 &nbsp;·&nbsp; peso {Math.round(block.blockWeight*100)}%</div>
          </div>
        </div>

        {/* Subcategory breakdown */}
        <div style={{background:"rgba(0,0,0,0.25)", borderRadius:"14px", padding:"14px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose por subcategoría</div>
          {subcatScores.map((s,i) => (
            <div key={i} style={{marginBottom:"10px"}}>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px"}}>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:"rgba(255,255,255,0.85)", fontWeight:"600"}}>{s.label}</div>
                <div style={{fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"700", color:scoreColor(s.score)}}>{s.score}</div>
              </div>
              {/* Progress bar */}
              <div style={{height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden"}}>
                <div style={{height:"100%", width:`${s.score}%`, background:scoreColor(s.score), borderRadius:"2px", transition:"width 0.6s ease"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px, env(safe-area-inset-bottom,12px))", display:"flex", gap:"10px"}}>
        <button onClick={onBack} style={{flex:1, padding:"14px", background:"rgba(0,0,0,0.5)", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"12px", fontFamily:"Arial,sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer"}}>← Revisar</button>
        <button onClick={onContinue} style={{flex:2, padding:"14px", background:t.bg, color:t.accent, border:"none", borderRadius:"12px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"700", cursor:"pointer"}}>
          {blockIndex < totalBlocks ? "Siguiente bloque →" : "Ver resultado →"}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TOTAL SUMMARY SCREEN — after all blocks
// Shows hex radar + all block scores
// ═══════════════════════════════════════════
function TotalSummaryScreen({ blocks, answers, title, subtitle, photo, onContinue, continueLabel, onSecondary, secondaryLabel }) {
  const t = theme(isDark());
  const totalScore = Math.round(calcTotalScore(blocks, answers)*10)/10;
  return (
    <div style={{minHeight:"100dvh", background:bgColor(100), display:"flex", flexDirection:"column"}}>
      <div style={{padding:"16px 20px 0", paddingTop:"max(16px, env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
        <div style={{fontFamily:"Arial,sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", textTransform:"uppercase"}}>{subtitle}</div>
      </div>

      <div style={{flex:1, overflowY:"auto", WebkitOverflowScrolling:"touch", padding:"16px 20px 8px"}}>
        {/* Name + photo */}
        <div style={{display:"flex", alignItems:"center", gap:"12px", marginBottom:"12px"}}>
          {photo && <img src={photo} alt="" style={{width:"48px",height:"48px",borderRadius:"50%",objectFit:"cover",border:"2px solid rgba(255,255,255,0.4)"}}/>}
          <div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.5)", letterSpacing:"0.15em", textTransform:"uppercase"}}>Resultado final</div>
            <div style={{fontFamily:"'Arial Black',Arial,sans-serif", fontSize:"20px", fontWeight:"900", color:"white"}}>{title}</div>
          </div>
        </div>

        {/* Total score */}
        <div style={{textAlign:"center", marginBottom:"16px"}}>
          <div style={{display:"inline-flex", flexDirection:"column", alignItems:"center", background:"rgba(0,0,0,0.35)", borderRadius:"18px", padding:"14px 32px"}}>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"62px", fontWeight:"700", color:scoreColor(totalScore), lineHeight:1}}>{totalScore}</div>
            <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", fontWeight:"700", color:"rgba(255,255,255,0.5)", marginTop:"4px"}}>{scoreLabel(totalScore)}</div>
          </div>
        </div>

        {/* Hex Radar */}
        <div style={{background:"#1e1e1e", borderRadius:"16px", padding:"16px 8px", marginBottom:"16px", display:"flex", justifyContent:"center"}}>
          <HexRadarTotal blocks={blocks} answers={answers}/>
        </div>

        {/* Block scores list */}
        <div style={{background:"rgba(0,0,0,0.25)", borderRadius:"14px", padding:"14px", marginBottom:"12px"}}>
          <div style={{fontFamily:"Arial,sans-serif", fontSize:"10px", fontWeight:"700", color:"rgba(255,255,255,0.4)", letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px"}}>Desglose por bloque</div>
          {blocks.map(b => {
            const bs = Math.round(calcBlockScore(b, answers)*10)/10;
            return (
              <div key={b.id} style={{marginBottom:"10px"}}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px"}}>
                  <div>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"13px", color:"white", fontWeight:"700"}}>{b.label}</span>
                    <span style={{fontFamily:"Arial,sans-serif", fontSize:"10px", color:"rgba(255,255,255,0.4)", marginLeft:"6px"}}>×{Math.round(b.blockWeight*100)}%</span>
                  </div>
                  <div style={{fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:scoreColor(bs)}}>{bs}</div>
                </div>
                <div style={{height:"4px", background:"rgba(255,255,255,0.1)", borderRadius:"2px", overflow:"hidden"}}>
                  <div style={{height:"100%", width:`${bs}%`, background:scoreColor(bs), borderRadius:"2px"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{padding:"12px 20px", paddingBottom:"max(12px, env(safe-area-inset-bottom,12px))", display:"flex", flexDirection:"column", gap:"10px"}}>
        <button onClick={onContinue} style={{display:"block", width:"100%", padding:"17px", background:t.bg, color:t.accent, border:"none", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"17px", fontWeight:"700", cursor:"pointer"}}>{continueLabel}</button>
        {onSecondary && <button onClick={onSecondary} style={{display:"block", width:"100%", padding:"14px", background:"transparent", color:"rgba(255,255,255,0.8)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:"14px", fontFamily:"Arial,sans-serif", fontSize:"15px", fontWeight:"600", cursor:"pointer"}}>{secondaryLabel}</button>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST CATALOGUE SCREEN
// ═══════════════════════════════════════════
function ArtistCatalogueScreen({ artistData, profile, onBack, onNewProject, onOpenProject, liveArtists }) {
  const t = theme(isDark());
  useFirebaseStore(); // re-render on Firebase changes
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);

  const allArtists = getArtists();
  // Always read fresh from store — artistData prop may be stale
  const liveArtist = _artistsMeta.find(a => a.id === artistData?.id) || artistData;
  const linkedProjects = _projects
    .filter(p => p.artistId === artistData?.id)
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date) : a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.date ? new Date(b.date) : b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

  const isLabelOrAdmin = profile?.type === 'label' || profile?.type === 'admin';

  const toggleSelect = (id) => setSelected(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
  );

  const handleDelete = () => {
    selected.forEach(id => deleteProjectById(id));
    setSelected([]);
    setEditMode(false);
  };

  // Calculate catalogue block scores (avg across all projects)
  const rad = (deg) => deg * Math.PI / 180;
  const songVerts = [
    {id:'result',label:'Resultado',angle:-90},{id:'social',label:'Social',angle:-30},
    {id:'ytvideo',label:'Video',angle:30},{id:'rights',label:'Rights',angle:90},
    {id:'authority',label:'Authority',angle:150},{id:'dsps',label:'DSPs',angle:210},
  ];
  const getCatBlockScore = (id) => {
    const projects = linkedProjects.filter(p => p.answers && Object.keys(p.answers).length > 0);
    if (projects.length === 0) return null;
    if (id === 'result') {
      const scores = projects.map(p => calcTotalScore(SONG_BLOCKS, p.answers));
      return Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10;
    }
    const block = SONG_BLOCKS.find(b => b.id === id);
    if (!block) return null;
    const scores = projects.map(p => {
      const has = block.subcats.some(s => s.items.some(i => p.answers[i.id] !== undefined));
      return has ? calcBlockScore(block, p.answers) : null;
    }).filter(s => s !== null);
    return scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10 : null;
  };
  const catAvg = getCatBlockScore('result');
  const S = Math.min(window.innerWidth * 0.86, 360), cxh = S/2, cyh = S/2, R = S * 0.30;
  const hexPts = songVerts.map(v => ({x: cxh + R*Math.cos(rad(v.angle)), y: cyh + R*Math.sin(rad(v.angle))}));
  const catDataPoly = (() => {
    const pts = [...songVerts].sort((a,b)=>a.angle-b.angle).map(v => {
      const s = getCatBlockScore(v.id); if (s===null) return null;
      const p = Math.max(0.01, s/100);
      return {x: cxh + R*p*Math.cos(rad(v.angle)), y: cyh + R*p*Math.sin(rad(v.angle))};
    }).filter(Boolean);
    if (pts.length < 2) return null;
    return pts.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z';
  })();

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          {editMode ? 'Cancelar' : '← Volver'}
        </button>
        <div style={{textAlign:'center'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Catálogo</div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3}}>{artistData.name}</div>
        </div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {!editMode && linkedProjects.length > 0 && (
            <button onClick={() => setEditMode(true)}
              style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', padding:0}}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{background:'transparent', border:'none', color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', cursor: selected.length > 0 ? 'pointer' : 'default', padding:0}}>
              Borrar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            isLabelOrAdmin
              ? <button onClick={onNewProject} style={{background:'transparent', border:'none', color:t.accent, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', padding:0}}>+ Nuevo</button>
              : <div style={{width:'50px'}}/>
          )}
        </div>
      </div>

      {/* Catalogue hexagon — shown when there are projects with answers */}
      {catAvg !== null && (
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 20px 0', borderBottom:`1px solid ${t.border}`}}>
          <div style={{position:'relative', width:`${S}px`, height:`${S}px`}}>
            <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{position:'absolute', inset:0}}>
              {[0.33,0.66,1].map((sc,ri) => {
                const ps = hexPts.map(p => ({x:cxh+(p.x-cxh)*sc, y:cyh+(p.y-cyh)*sc}));
                return <path key={ri} d={ps.map((p,i)=>`${i===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')+' Z'} fill="none" stroke={t.border} strokeWidth="1"/>;
              })}
              {hexPts.map((p,i) => <line key={i} x1={cxh} y1={cyh} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke={t.border} strokeWidth="1"/>)}
              {catDataPoly && <path d={catDataPoly} fill="rgba(232,21,27,0.12)" stroke="#E8151B" strokeWidth="1.5" strokeLinejoin="round"/>}
            </svg>
            {/* Vertex labels */}
            {songVerts.map(v => {
              const s = getCatBlockScore(v.id);
              const px = cxh + R * Math.cos(rad(v.angle));
              const py = cyh + R * Math.sin(rad(v.angle));
              const isRes = v.id === 'result';
              if (isRes) return (
                <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  background:t.accent, borderRadius:'16px', padding:'4px 12px',
                  fontFamily:'Arial,sans-serif', fontSize:'18px', fontWeight:'700', color:'#fff', pointerEvents:'none'}}>
                  {s}
                </div>
              );
              return (
                <div key={v.id} style={{position:'absolute', left:`${px}px`, top:`${py}px`, transform:'translate(-50%,-50%)',
                  background: s!==null ? t.text : t.bg2, border:`1px solid ${s!==null ? t.text : t.border}`,
                  borderRadius:'12px', padding:'3px 7px', textAlign:'center', pointerEvents:'none', whiteSpace:'nowrap'}}>
                  <div style={{fontFamily:'Arial,sans-serif', fontSize:'8px', fontWeight:'700', color: s!==null ? t.bg : t.text3, letterSpacing:'0.05em', textTransform:'uppercase'}}>{v.label}</div>
                  {s!==null && <div style={{fontFamily:'Arial,sans-serif', fontSize:'10px', fontWeight:'700', color:t.bg, lineHeight:1}}>{s}</div>}
                </div>
              );
            })}
          </div>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3, marginBottom:'12px'}}>{linkedProjects.filter(p=>p.answers&&Object.keys(p.answers).length>0).length} proyectos evaluados</div>
        </div>
      )}

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {linkedProjects.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Vacío</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3, marginBottom:'32px'}}>No hay proyectos asignados a {artistData.name}</div>
            {isLabelOrAdmin && (
              <button onClick={onNewProject} style={{padding:'16px 32px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', cursor:'pointer'}}>
                + Nuevo proyecto
              </button>
            )}
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
            {linkedProjects.map((p, i) => {
              const isSelected = selected.includes(p.id);
              return (
                <button key={p.id || i}
                  onClick={() => {
                    if (editMode) { toggleSelect(p.id); return; }
                    onOpenProject(p);
                  }}
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:t.card, border:`1px solid ${editMode && isSelected ? '#E8151B' : t.border}`, borderRadius:'16px', cursor:'pointer', textAlign:'left', width:'100%', boxShadow:`0 2px 8px ${t.shadow}`, transition:'border-color 0.15s'}}>
                  {editMode && (
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${isSelected ? '#E8151B' : t.border}`, background: isSelected ? '#E8151B' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.15s'}}>
                      {isSelected && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                    </div>
                  )}
                  {p.photo ? (
                    <img src={p.photo} alt="" style={{width:'48px', height:'48px', borderRadius:'10px', objectFit:'cover', flexShrink:0}}/>
                  ) : (
                    <div style={{width:'48px', height:'48px', borderRadius:'10px', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'22px'}}>🎵</div>
                  )}
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text, marginBottom:'2px'}}>{p.title || 'Sin título'}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text2}}>{p.date || 'Sin fecha'}</div>
                  </div>
                  {!editMode && (() => {
                    const liveScore = p.score !== undefined ? p.score : (p.answers && Object.keys(p.answers).length > 0 ? Math.round(calcTotalScore(SONG_BLOCKS, p.answers) * 10) / 10 : null);
                    return liveScore !== null ? (
                      <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:scoreColor(liveScore), flexShrink:0}}>{liveScore}</div>
                    ) : null;
                  })()}
                  {!editMode && <div style={{color:t.text3, fontSize:'18px'}}>›</div>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// ═══════════════════════════════════════════
// CLIENTS LIST SCREEN — all managers
// ═══════════════════════════════════════════
function ClientsListScreen({ onBack, onSelectArtist, liveArtists }) {
  const t = theme(isDark());

  // Collect all unique managers from all artists
  const allArtists = liveArtists || getArtists();
  const clientMap = {};
  allArtists.forEach(a => {
    if (!a.management) return;
    const managers = a.management.split(';').map(m => m.trim()).filter(Boolean);
    managers.forEach(m => {
      if (!clientMap[m]) clientMap[m] = [];
      clientMap[m].push(a);
    });
  });
  const clients = Object.entries(clientMap).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Atrás</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Clientes</div>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{clients.length}</div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {clients.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin clientes</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3}}>Cuando añadas management a tus artistas aparecerán aquí</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {clients.map(([managerName, artists]) => (
              <div key={managerName} style={{padding:'16px', background:t.card, border:`1px solid ${t.border}`, borderRadius:'14px', boxShadow:`0 2px 8px ${t.shadow}`}}>
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom: artists.length > 0 ? '12px' : 0}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>🤝</div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{managerName}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artists.length} artista{artists.length !== 1 ? 's' : ''}</div>
                  </div>
                </div>
                {artists.length > 0 && (
                  <div style={{display:'flex', flexWrap:'wrap', gap:'6px', paddingLeft:'52px'}}>
                    {artists.map(a => (
                      <button key={a.id} onClick={() => onSelectArtist(a)}
                        style={{display:'flex', alignItems:'center', gap:'6px', padding:'4px 10px', background:t.bg2, border:`1px solid ${t.border}`, borderRadius:'20px', cursor:'pointer'}}>
                        {a.photo && <img src={a.photo} alt="" style={{width:'18px', height:'18px', borderRadius:'50%', objectFit:'cover'}}/>}
                        <span style={{fontFamily:'Arial,sans-serif', fontSize:'12px', fontWeight:'600', color:t.text}}>{a.name}</span>
                        <span style={{color:t.text3, fontSize:'10px'}}>›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LABEL MANAGERS LIST SCREEN
// ═══════════════════════════════════════════
function LabelManagersListScreen({ onBack, onNew }) {
  const t = theme(isDark());
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [managers, setManagers] = useState(() => Object.keys(getLabelUsers()));

  const toggleSelect = (name) => setSelected(prev =>
    prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
  );

  const handleDelete = () => {
    const users = getLabelUsers();
    selected.forEach(name => { delete users[name]; });
    saveLabelUsers(users);
    setManagers(Object.keys(getLabelUsers()));
    setSelected([]);
    setEditMode(false);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={() => { if (editMode) { setEditMode(false); setSelected([]); } else onBack(); }}
          style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>
          {editMode ? 'Cancelar' : '← Atrás'}
        </button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Label Managers</div>
        <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
          {!editMode && managers.length > 0 && (
            <button onClick={() => setEditMode(true)}
              style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', padding:0}}>
              Editar
            </button>
          )}
          {editMode ? (
            <button onClick={handleDelete} disabled={selected.length === 0}
              style={{background:'transparent', border:'none', color: selected.length > 0 ? '#E8151B' : t.text3, fontFamily:'Arial,sans-serif', fontSize:'14px', fontWeight:'700', cursor: selected.length > 0 ? 'pointer' : 'default', padding:0}}>
              Borrar{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          ) : (
            <button onClick={onNew}
              style={{background:'transparent', border:'none', color:t.accent, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor:'pointer', padding:0}}>
              + Nuevo
            </button>
          )}
        </div>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'24px 20px'}}>
        {managers.length === 0 ? (
          <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', textAlign:'center'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'48px', fontWeight:'700', color:t.border, marginBottom:'12px'}}>—</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Sin Label Managers</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text3, marginBottom:'32px'}}>Añade el primero con el botón de arriba</div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
            {managers.map((name, i) => {
              const isSelected = selected.includes(name);
              const artistCount = getArtists().filter(a =>
                (a.labelUsers && a.labelUsers.includes(name)) || a.labelUser === name
              ).length;
              return (
                <button key={i}
                  onClick={() => editMode && toggleSelect(name)}
                  style={{display:'flex', alignItems:'center', gap:'14px', padding:'16px', background:t.card, border:`1px solid ${editMode && isSelected ? '#E8151B' : t.border}`, borderRadius:'14px', cursor: editMode ? 'pointer' : 'default', textAlign:'left', width:'100%', boxShadow:`0 2px 8px ${t.shadow}`, transition:'border-color 0.15s'}}>
                  {editMode && (
                    <div style={{width:'22px', height:'22px', borderRadius:'50%', border:`2px solid ${isSelected ? '#E8151B' : t.border}`, background: isSelected ? '#E8151B' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
                      {isSelected && <span style={{color:'white', fontSize:'12px', fontWeight:'700'}}>✓</span>}
                    </div>
                  )}
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:t.bg2, border:`1px solid ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'18px'}}>👤</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', color:t.text}}>{name}</div>
                    <div style={{fontFamily:'Arial,sans-serif', fontSize:'12px', color:t.text3}}>{artistCount} artista{artistCount !== 1 ? 's' : ''}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// NEW LABEL MANAGER SCREEN
// ═══════════════════════════════════════════
function NewLabelManagerScreen({ onBack, onDone }) {
  const t = theme(isDark());
  const [newName, setNewName] = useState('');
  const [done, setDone] = useState(false);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const users = getLabelUsers();
    users[newName.trim()] = true;
    saveLabelUsers(users);
    setDone(true);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px'}}>
      <div style={{width:'100%', maxWidth:'360px'}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'14px', cursor:'pointer', marginBottom:'32px', padding:0}}>← Atrás</button>
        {done ? (
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px', marginBottom:'16px'}}>✅</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'20px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Creado</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'24px'}}><strong>{newName}</strong> ya puede entrar como Label Manager</div>
            <button onClick={onDone} style={{display:'block', width:'100%', padding:'16px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'16px', fontWeight:'700', cursor:'pointer'}}>Volver al inicio</button>
          </div>
        ) : (
          <>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'26px', fontWeight:'700', color:t.text, marginBottom:'8px'}}>Nuevo Label Manager</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'14px', color:t.text2, marginBottom:'28px'}}>Escribe el nombre con el que entrará.</div>
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="Nombre del Label Manager"
              autoFocus
              style={{display:'block', width:'100%', background:t.bg2, border:`1.5px solid ${t.border}`, borderRadius:'12px', padding:'16px 18px', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', marginBottom:'16px', WebkitAppearance:'none', boxSizing:'border-box'}}
            />
            <button onClick={handleCreate} style={{display:'block', width:'100%', padding:'17px', background:t.accent, color:'#fff', border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor:'pointer'}}>
              Crear →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ARTIST EDIT SCREEN
// ═══════════════════════════════════════════
function ArtistEditScreen({ artistData, onBack, onSave }) {
  const t = theme(isDark());
  const [name, setName] = useState(artistData.name || '');
  const [management, setManagement] = useState(artistData.management || '');
  const [photo, setPhoto] = useState(artistData.photo || null);
  const [selectedLabels, setSelectedLabels] = useState(
    artistData.labelUsers || [artistData.labelUser].filter(Boolean)
  );
  const fileRef = useRef();

  const allLabelUsers = Object.keys(getLabelUsers());

  const toggleLabel = (n) => setSelectedLabels(prev =>
    prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]
  );

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const managers = management.split(';').map(m => m.trim()).filter(Boolean);
    if (managers.length > 0) {
      try {
        const existing = getMgmtUsers();
        managers.forEach(m => { existing[m] = true; });
        saveMgmtUsers(existing);
      } catch(e) {}
    }
    const updated = {
      ...artistData,
      name: name.trim(),
      management: managers.join('; '),
      photo,
      labelUsers: selectedLabels,
      labelUser: selectedLabels[0] || artistData.labelUser,
    };
    saveOneArtist(updated);
    onSave(updated);
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar artista</div>
        <button onClick={handleSave} disabled={!name.trim()} style={{background:'transparent', border:'none', color: name.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'50%', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>📷</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Name */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Nombre *</div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre del artista"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Management */}
        <div style={{marginBottom:'32px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Management</div>
          <input
            value={management}
            onChange={e => setManagement(e.target.value)}
            placeholder="Nombre del manager"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', color:t.text3, marginTop:'6px'}}>Separa con ; para más de un manager</div>
        </div>

        {/* Label Managers */}
        {allLabelUsers.length > 0 && (
          <div style={{marginBottom:'32px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'14px'}}>Label Managers con acceso</div>
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
              {allLabelUsers.map(n => {
                const isSelected = selectedLabels.includes(n);
                return (
                  <button key={n} onClick={() => toggleLabel(n)}
                    style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: isSelected ? t.text : t.bg2, border:`1px solid ${isSelected ? t.text : t.border}`, borderRadius:'12px', cursor:'pointer', transition:'all 0.2s'}}>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'600', color: isSelected ? t.bg : t.text}}>{n}</span>
                    <span style={{fontFamily:'Arial,sans-serif', fontSize:'13px', color: isSelected ? t.bg : t.text3}}>{isSelected ? '✓' : '+'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!name.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: name.trim() ? t.text : t.bg2, color: name.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: name.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PROJECT EDIT SCREEN
// ═══════════════════════════════════════════
function ProjectEditScreen({ songData, onBack, onSave }) {
  const t = theme(isDark());
  const [title, setTitle] = useState(songData?.title || '');
  const [date, setDate] = useState(songData?.date || '');
  const [participants, setParticipants] = useState(songData?.participants || '');
  const [photo, setPhoto] = useState(songData?.photo || null);
  const fileRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ ...songData, title: title.trim(), date, participants, photo });
  };

  return (
    <div style={{minHeight:'100dvh', background:t.bg, display:'flex', flexDirection:'column'}}>
      <div style={{padding:'16px 20px', paddingTop:'max(16px,env(safe-area-inset-top,16px))', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${t.border}`}}>
        <button onClick={onBack} style={{background:'transparent', border:'none', color:t.text2, fontFamily:'Arial,sans-serif', fontSize:'15px', cursor:'pointer', padding:0}}>← Cancelar</button>
        <div style={{fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', color:t.text}}>Editar proyecto</div>
        <button onClick={handleSave} disabled={!title.trim()} style={{background:'transparent', border:'none', color: title.trim() ? t.accent : t.text3, fontFamily:'Arial,sans-serif', fontSize:'15px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', padding:0}}>Guardar</button>
      </div>

      <div style={{flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'32px 24px'}}>

        {/* Photo */}
        <div style={{display:'flex', justifyContent:'center', marginBottom:'36px'}}>
          <div onClick={() => fileRef.current.click()}
            style={{width:'90px', height:'90px', borderRadius:'14px', background: photo ? 'transparent' : t.bg2, border:`1.5px dashed ${t.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', overflow:'hidden'}}>
            {photo
              ? <img src={photo} alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
              : <span style={{fontSize:'28px'}}>🎵</span>
            }
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={handleFile}/>
        </div>

        {/* Title */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Título *</div>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Nombre del proyecto"
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'22px', fontWeight:'700', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Artista (read-only) */}
        {songData?.artistName && (
          <div style={{marginBottom:'28px'}}>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Artista</div>
            <div style={{fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text2, padding:'10px 0', borderBottom:`1.5px solid ${t.border}`}}>{songData.artistName}</div>
          </div>
        )}

        {/* Release date */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Fecha de lanzamiento</div>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

        {/* Participants */}
        <div style={{marginBottom:'28px'}}>
          <div style={{fontFamily:'Arial,sans-serif', fontSize:'11px', fontWeight:'700', color:t.text3, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'10px'}}>Participantes</div>
          <input
            value={participants}
            onChange={e => setParticipants(e.target.value)}
            placeholder="Productores, feats, etc."
            style={{display:'block', width:'100%', background:'transparent', border:'none', borderBottom:`1.5px solid ${t.border}`, padding:'10px 0', fontFamily:'Arial,sans-serif', fontSize:'17px', color:t.text, outline:'none', WebkitAppearance:'none'}}
          />
        </div>

      </div>

      <div style={{padding:'16px 24px', paddingBottom:'max(16px,env(safe-area-inset-bottom,16px))', borderTop:`1px solid ${t.border}`}}>
        <button onClick={handleSave} disabled={!title.trim()}
          style={{display:'block', width:'100%', padding:'17px', background: title.trim() ? t.text : t.bg2, color: title.trim() ? t.bg : t.text3, border:'none', borderRadius:'14px', fontFamily:'Arial,sans-serif', fontSize:'17px', fontWeight:'700', cursor: title.trim() ? 'pointer' : 'default', transition:'all 0.2s'}}>
          Guardar cambios
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const dark = useDarkMode();
  const t = theme(dark);
  const [showSplash, setShowSplash] = useState(true);
  const [profile, setProfile] = useState(null); // never persisted — always ask on load
  const saveProfile = (p) => { setProfile(p); };
  const [phase, setPhase] = useState("welcome");
  const [artistData, setArtistData] = useState({});
  const [artistAnswers, setArtistAnswers] = useState({});
  const [artistQIdx, setArtistQIdx] = useState(0);
  const [currentBlockIdx, setCurrentBlockIdx] = useState(0);
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [songQIdx, setSongQIdx] = useState(0);
  const [currentSongAnswers, setCurrentSongAnswers] = useState({});

  const [syncing, setSyncing] = useState(true);
  // Force re-render when Firebase data changes
  const [, forceUpdate] = useState(0);
  const [, forceRender] = useState(0);
  useEffect(() => {
    const unsub = subscribeStore(() => forceUpdate(n => n + 1));
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = startRealtimeSync(() => {
      setSyncing(false);
      if (saved && saved.phase && saved.phase !== "welcome") {
      }
    });
    return unsub;
  }, []);



  function resetAll() {
    setPhase("welcome"); setArtistData({}); setArtistAnswers({}); setArtistQIdx(0); setCurrentBlockIdx(0); setSongs([]); setCurrentSong(null); setSongQIdx(0);
  }

  useEffect(() => {
    if (phase === "welcome") return;
  }, [phase, artistData, artistAnswers, artistQIdx, currentBlockIdx, songs, currentSong, songQIdx]);

  // ── Block boundary helpers ──
  // Build cumulative question counts per block
  const ARTIST_BLOCK_ENDS = (() => {
    let c = 0; return ARTIST_BLOCKS.map(b => { b.subcats.forEach(s => { c += s.items.length; }); return c - 1; });
  })();
  const SONG_BLOCK_ENDS = (() => {
    let c = 0; return SONG_BLOCKS.map(b => { b.subcats.forEach(s => { c += s.items.length; }); return c - 1; });
  })();

  // ── Subcat boundary helpers ──
  const ARTIST_SUBCAT_ENDS = (() => {
    const ends = [];
    let c = 0;
    ARTIST_BLOCKS.forEach((b, bi) => {
      b.subcats.forEach((s, si) => {
        c += s.items.length;
        ends.push({ endIdx: c - 1, blockId: b.id, blockLabel: b.label, blockWeight: b.blockWeight, subcatId: s.id, subcatLabel: s.label, subcatWeight: s.subcatWeight, blockIdx: bi, subcatIdx: si, block: b, subcat: s });
      });
    });
    return ends;
  })();
  const SONG_SUBCAT_ENDS = (() => {
    const ends = [];
    let c = 0;
    SONG_BLOCKS.forEach((b, bi) => {
      b.subcats.forEach((s, si) => {
        c += s.items.length;
        ends.push({ endIdx: c - 1, blockId: b.id, blockLabel: b.label, blockWeight: b.blockWeight, subcatId: s.id, subcatLabel: s.label, subcatWeight: s.subcatWeight, blockIdx: bi, subcatIdx: si, block: b, subcat: s });
      });
    });
    return ends;
  })();

  const [currentSubcatInfo, setCurrentSubcatInfo] = useState(null);

  const globalProgress = (() => {
    const totalQs = ARTIST_QUESTIONS.length + (songs.length + 1) * SONG_QUESTIONS.length;
    const doneQs = artistQIdx + songs.reduce((a) => a + SONG_QUESTIONS.length, 0) + (currentSong ? songQIdx : 0);
    return Math.min(100, Math.round((doneQs / Math.max(1, totalQs)) * 100));
  })();

  // ── ARTIST QUESTIONS ──
  function handleArtistAnswer(id, val) {
    if (id === "__back__") { if (artistQIdx > 0) setArtistQIdx(i => i-1); return; }
    if (id === "__skip__") {
      const next = artistQIdx + 1;
      if (next >= ARTIST_QUESTIONS.length) { setPhase("artist-result"); return; }
      const blockEnd = ARTIST_BLOCK_ENDS.find(e => e === artistQIdx);
      if (blockEnd !== undefined) { const bi = ARTIST_BLOCK_ENDS.indexOf(blockEnd); setCurrentBlockIdx(bi); setArtistQIdx(next); setPhase("artist-block-summary"); return; }
      setArtistQIdx(next); return;
    }
    const newAnswers = { ...artistAnswers, [id]: val };
    setArtistAnswers(newAnswers);
    // Persist answers to Firebase
    if (artistData?.id) {
      const target = getArtists().find(a => a.id === artistData.id);
      if (target) saveOneArtist({ ...target, answers: newAnswers });
    }
    const next = artistQIdx + 1;
    // Check if this was the last question of a subcat
    const subcatEndInfo = ARTIST_SUBCAT_ENDS.find(e => e.endIdx === artistQIdx);
    const blockEndIdx = ARTIST_BLOCK_ENDS.indexOf(artistQIdx);
    if (subcatEndInfo) {
      setCurrentSubcatInfo({ ...subcatEndInfo, answers: newAnswers, isBlockEnd: blockEndIdx !== -1 });
      setCurrentBlockIdx(subcatEndInfo.blockIdx);
      if (next >= ARTIST_QUESTIONS.length) { setPhase("artist-subcat-summary"); return; }
      setArtistQIdx(next);
      setPhase("artist-subcat-summary");
    } else if (next >= ARTIST_QUESTIONS.length) {
      setPhase("artist-result");
    } else {
      setArtistQIdx(next);
    }
  }

  // ── SONG QUESTIONS ──
  function handleSongAnswer(id, val) {
    if (id === "__back__") { if (songQIdx > 0) setSongQIdx(i => i-1); return; }
    if (id === "__skip__") {
      const next = songQIdx + 1;
      if (next >= SONG_QUESTIONS.length) { finishCurrentSong(); return; }
      const blockEnd = SONG_BLOCK_ENDS.find(e => e === songQIdx);
      if (blockEnd !== undefined) { const bi = SONG_BLOCK_ENDS.indexOf(blockEnd); setCurrentBlockIdx(bi); setSongQIdx(next); setPhase("song-block-summary"); return; }
      setSongQIdx(next); return;
    }
    const newAnswers = { ...(currentSong?.answers || {}), [id]: val };
    setCurrentSong(s => ({ ...s, answers: newAnswers }));
    syncProjectToArtist(currentSong?.data, newAnswers);
    const next = songQIdx + 1;
    // Check if this was the last question of a subcat
    const subcatEndInfo = SONG_SUBCAT_ENDS.find(e => e.endIdx === songQIdx);
    const blockEndIdx = SONG_BLOCK_ENDS.indexOf(songQIdx);
    if (subcatEndInfo) {
      setCurrentSubcatInfo({ ...subcatEndInfo, answers: newAnswers, isBlockEnd: blockEndIdx !== -1 });
      setCurrentBlockIdx(subcatEndInfo.blockIdx);
      if (next >= SONG_QUESTIONS.length) { finishCurrentSong(newAnswers); return; }
      setSongQIdx(next);
      setPhase("song-subcat-summary");
    } else if (next >= SONG_QUESTIONS.length) {
      finishCurrentSong(newAnswers);
    } else {
      setSongQIdx(next);
    }
  }

  // Helper — persist current project answers/score back to artist record
  function syncProjectToArtist(projectData, answers, score) {
    if (!projectData?.id) return;
    const artistId = projectData?.artistId || projectData?.linkedArtist?.id || artistData?.id;
    if (!artistId) { console.warn("syncProjectToArtist: no artistId"); return; }
    const updated = { ...projectData, answers, ...(score !== undefined ? { score } : {}) };
    saveProject(updated, artistId);
  }

  // ── Derive songs from current artist's Firebase data ──
  const firebaseArtist = getArtists().find(a => a.id === artistData?.id);
  const firebaseProjects = firebaseArtist?.projects || [];

  function finishCurrentSong(answers) {
    const finalAnswers = answers || currentSong.answers;
    const score = calcTotalScore(SONG_BLOCKS, finalAnswers);
    setCurrentSong(s => ({ ...s, answers: finalAnswers, score }));
    syncProjectToArtist(currentSong?.data, finalAnswers, score);
    setPhase("song-result");
  }

  // ── FINAL SCORES ──
  const artistScore = calcTotalScore(ARTIST_BLOCKS, artistAnswers);
  const currentSongScore = currentSong ? calcTotalScore(SONG_BLOCKS, currentSong.answers) : 0;
  const allSongs = currentSong && phase === "song-result" ? [...songs, { ...currentSong, score: currentSongScore }] : songs;
  const songAvg = allSongs.length > 0 ? Math.round(allSongs.reduce((a, s) => a + s.score, 0) / allSongs.length * 10) / 10 : 0;
  const finalScore = Math.round((songAvg * 0.70 + artistScore * 0.30) * 10) / 10;

  // ══════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════

  // SPLASH
  if (showSplash || syncing) return <SplashScreen onDone={() => setShowSplash(false)}/>;

  // FIREBASE ERROR BANNER
  const fbError = getFirebaseError();
  const errorBanner = fbError ? (
    <div style={{position:'fixed', top:0, left:0, right:0, zIndex:9999, background:'#E8151B', color:'white', padding:'10px 16px', fontFamily:'Arial,sans-serif', fontSize:'12px', textAlign:'center', cursor:'pointer'}}
      onClick={() => { clearFirebaseError(); forceRender(n=>n+1); }}>
      ⚠️ Firebase error: {fbError} — toca para cerrar
    </div>
  ) : null;
  if (!profile) return <ProfileSelect onSelect={(p) => {
    saveProfile(p);
    if (p.type === 'artist') {
      const artists = getArtists();
      const found = artists.find(a => a.name && a.name.toLowerCase() === p.name.toLowerCase());
      if (found) {
        setArtistData(found);
        setArtistAnswers(found.answers || {});
        setArtistQIdx(0);
        setCurrentBlockIdx(0);
        setPhase("artist-home");
        return;
      }
    }
    setPhase("welcome");
  }}/>;

  // HOME function
  const goHome = () => {
    setPhase("welcome");
  };

  // WELCOME
  if (phase === "welcome") {
    return (
      <div style={{ minHeight:"100dvh", background:t.bg, display:"flex", flexDirection:"column" }}>
        {errorBanner}
        <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px 24px", paddingTop:"max(32px, env(safe-area-inset-top, 32px))" }}>

          <img src={RIMAS_LOGO} alt="Ri+D" style={{ width:"180px", height:"180px", objectFit:"contain", marginBottom:"40px", filter: dark ? "invert(1)" : "none" }}/>

          <div style={{ width:"100%", maxWidth:"360px", marginBottom:"20px" }}>

            {/* BLOQUE 1 — TRABAJAR */}
            <div style={{ fontFamily:"Arial,sans-serif", fontSize:"11px", fontWeight:"700", color:t.text3, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:"10px" }}>Abrir</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
              {[
                { label:"Roster", icon: ICON_ARTISTA, action: () => setPhase("artist-list") },
                { label:"Catálogo", icon: ICON_PROYECTO, action: () => setPhase("song-list") },
              ].map((btn, i) => (
                <button key={i} onClick={btn.action}
                  style={{ display:"flex", alignItems:"center", justifyContent:"flex-start", gap:"14px", padding:"18px", background:t.card, border:`1px solid ${t.border}`, borderRadius:"14px", cursor:"pointer", textAlign:"left", width:"100%", boxShadow:`0 2px 8px ${t.shadow}` }}>
                  <img src={btn.icon} alt="" style={{ width:"36px", height:"36px", objectFit:"contain", flexShrink:0 }}/>
                  <span style={{ fontFamily:"Arial,sans-serif", fontSize:"16px", fontWeight:"700", color:t.text }}>{btn.label}</span>
                </button>
              ))}
            </div>

          </div>

          <div style={{fontFamily:"Arial,sans-serif", fontSize:"12px", color:t.text3}}>
            {profile.type === 'admin' ? '⚡ Admin · acceso completo' : `${profile.name} · ${profile.type}`}
          </div>

        </div>
        <div style={{ padding:"16px 24px", paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))", display:"flex", flexDirection:"column", gap:"10px" }}>
          {profile.type === 'admin' && (
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setPhase("label-managers-list")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                Equipo
              </button>
              <button onClick={() => setPhase("clients-list")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                Clientes
              </button>
              <button onClick={() => setPhase("new-label-manager")} style={{ flex:1, padding:"13px", background:"transparent", color:t.text2, border:`1px solid ${t.border}`, borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"14px", fontWeight:"600", cursor:"pointer" }}>
                + Nuevo
              </button>
            </div>
          )}

          <button onClick={() => saveProfile(null)} style={{ display:"block", width:"100%", padding:"13px", background:"transparent", color:t.text3, border:"none", borderRadius:"14px", fontFamily:"Arial, sans-serif", fontSize:"13px", cursor:"pointer" }}>
            Cambiar perfil
          </button>
        </div>
      </div>
    );
  }

  // NEW LABEL MANAGER
  if (phase === "clients-list") {
    return <ClientsListScreen
      liveArtists={getArtists()}
      onBack={() => setPhase("welcome")}
      onSelectArtist={(artist) => {
        setArtistData(artist);
        setArtistAnswers(artist.answers || {});
        setArtistQIdx(0);
        setCurrentBlockIdx(0);
        setPhase("artist-home");
      }}
    />;
  }

  if (phase === "label-managers-list") {
    return (
      <LabelManagersListScreen
        onBack={() => setPhase("welcome")}
        onNew={() => setPhase("new-label-manager")}
      />
    );
  }

  if (phase === "new-label-manager") {
    return <NewLabelManagerScreen onBack={() => setPhase("welcome")} onDone={() => setPhase("welcome")} />;
  }

  // PROJECT LIST
  if (phase === "song-list") {
    return (
      <ProjectListScreen
        profile={profile}
        onBack={() => setPhase("welcome")}
        onCreate={() => setPhase("song-form")}
        onSelect={(p) => {
          // Find the artist for this project
          const artist = getArtists().find(a => a.id === p.artistId);
          if (artist) {
            setArtistData(artist);
            setArtistAnswers(artist.answers || {});
          }
          setCurrentSong({ data: { ...p, linkedArtist: { id: p.artistId, name: p.artistName } }, answers: p.answers || {} });
          setSongQIdx(0);
          setPhase("song-home");
        }}
      />
    );
  }

  // ARTIST LIST
  if (phase === "artist-list") {
    return (
      <ArtistListScreen
        liveArtists={getArtists()}
        profile={profile}
        onBack={() => setPhase("welcome")}
        onSelect={(artist) => {
          setArtistData(artist);
          setArtistAnswers(artist.answers || {});
          setArtistQIdx(0);
          setCurrentBlockIdx(0);
          setPhase("artist-home");
        }}
        onCreate={() => setPhase("artist-form")}
      />
    );
  }

  // ARTIST FORM
  if (phase === "artist-form") {
    return <NewArtistForm
      profile={profile}
      onBack={() => setPhase("artist-list")}
      onSave={(artistWithMeta) => {
        saveOneArtist(artistWithMeta);
        setArtistData(artistWithMeta);
        setArtistAnswers({});
        setArtistQIdx(0);
        setPhase("artist-list");
      }}
    />;
  }

  // PROJECT EDIT
  if (phase === "project-edit") {
    return (
      <ProjectEditScreen
        songData={currentSong?.data}
        onBack={() => setPhase("song-home")}
        onSave={async (updated) => {
          setCurrentSong(s => ({ ...s, data: updated }));
          const artistId = updated?.linkedArtist?.id || updated?.artistId || artistData?.id;
          if (artistId && updated?.id) {
            await saveProject(updated, artistId);
          } else {
            // fallback: search all artists
            const found = getArtists().find(a => (a.projects||[]).some(p => p.id === updated?.id));
            if (found) await saveProject(updated, found.id);
          }
          setPhase("song-home");
        }}
      />
    );
  }

  // SONG HOME — project hexagon
  if (phase === "song-home") {
    return (
      <>
        {errorBanner}
        <ProjectHomeScreen
          songData={currentSong?.data}
          songAnswers={currentSong?.answers || {}}
          onBack={() => setPhase("welcome")}
          onEdit={() => setPhase("project-edit")}
          onResult={() => setPhase("song-result")}
          onPending={() => setPhase("song-pending")}
          onBlock={(blockId) => {
            const idx = SONG_BLOCKS.findIndex(b => b.id === blockId);
            if (idx === -1) { console.warn("Block not found:", blockId); return; }
            setCurrentBlockIdx(idx);
            setPhase("song-block-home");
          }}
        />
      </>
    );
  }

  // SONG PENDING TASKS
  if (phase === "song-pending") {
    return (
      <PendingTasksScreen
        blocks={SONG_BLOCKS}
        answers={currentSong?.answers || {}}
        title={currentSong?.data?.title || "Proyecto"}
        onBack={() => setPhase("song-home")}
        onGoToQuestion={(qIdx) => {
          setSongQIdx(qIdx);
          let count = 0;
          for (let i = 0; i < SONG_BLOCKS.length; i++) {
            SONG_BLOCKS[i].subcats.forEach(s => { count += s.items.length; });
            if (qIdx < count) { setCurrentBlockIdx(i); break; }
          }
          setPhase("song-questions");
        }}
      />
    );
  }

  // SONG BLOCK HOME — sub-hexagon for song block subcats
  if (phase === "song-block-home") {
    const block = SONG_BLOCKS[currentBlockIdx];
    if (!block) { setPhase("song-home"); return null; }
    return (
      <BlockHomeScreen
        block={block}
        artistAnswers={currentSong?.answers || {}}
        artistName={currentSong?.data?.title || "Proyecto"}
        onBack={() => setPhase("song-home")}
        onGoHome={() => setPhase("song-home")}
        onSubcat={(subcatId) => {
          let startIdx = 0;
          let foundBlock = null;
          for (const b of SONG_BLOCKS) {
            for (const sub of b.subcats) {
              if (b.id === block.id && sub.id === subcatId) {
                const blockIdx = SONG_BLOCKS.findIndex(x => x.id === b.id);
                setCurrentBlockIdx(blockIdx);
                setSongQIdx(startIdx);
                setPhase("song-questions");
                return;
              }
              startIdx += sub.items.length;
            }
          }
          // fallback — start at block beginning
          let blockStart = 0;
          for (const b of SONG_BLOCKS) {
            if (b.id === block.id) break;
            b.subcats.forEach(s => { blockStart += s.items.length; });
          }
          setSongQIdx(blockStart);
          setPhase("song-questions");
        }}
      />
    );
  }

  // BLOCK HOME — sub-hexagon for block subcats
  if (phase === "block-home") {
    const block = ARTIST_BLOCKS[currentBlockIdx];
    if (!block) { setPhase("artist-home"); return null; }
    return (
      <BlockHomeScreen
        block={block}
        artistAnswers={artistAnswers}
        artistName={artistData.name}
        onBack={() => setPhase("artist-home")}
        onGoHome={() => setPhase("artist-home")}
        onSubcat={(subcatId) => {
          let startIdx = 0;
          for (const b of ARTIST_BLOCKS) {
            for (const sub of b.subcats) {
              if (b.id === block.id && sub.id === subcatId) {
                setArtistQIdx(startIdx);
                setPhase("artist-questions");
                return;
              }
              startIdx += sub.items.length;
            }
          }
          // fallback — start at block beginning
          let blockStart = 0;
          for (const b of ARTIST_BLOCKS) {
            if (b.id === block.id) break;
            b.subcats.forEach(s => { blockStart += s.items.length; });
          }
          setArtistQIdx(blockStart);
          setPhase("artist-questions");
        }}
      />
    );
  }

  // ARTIST EDIT
  if (phase === "artist-edit") {
    return (
      <ArtistEditScreen
        artistData={artistData}
        onBack={() => setPhase("artist-home")}
        onSave={(updated) => {
          setArtistData(updated);
          setPhase("artist-home");
        }}
      />
    );
  }

  // ARTIST HOME — hexagon screen
  if (phase === "artist-home") {
    return (
      <ArtistHomeScreen
        artistData={artistData}
        artistAnswers={artistAnswers}
        profile={profile}
        onBack={() => setPhase("artist-list")}
        onResult={() => setPhase("artist-result")}
        onEdit={() => setPhase("artist-edit")}
        onCatalogue={() => setPhase("artist-catalogue")}
        onPending={() => setPhase("artist-pending")}
        onProfile={() => setPhase("artist-profile")}
        onNewProject={() => {
          setCurrentSong({ data: { artistName: artistData.name, linkedArtist: artistData }, answers: {} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        onBlock={(blockId) => {
          const idx = ARTIST_BLOCKS.findIndex(b => b.id === blockId);
          if (idx === -1) return;
          setCurrentBlockIdx(idx);
          setPhase("block-home");
        }}
      />
    );
  }

  // ARTIST PROFILE — single hexagon with all 6 blocks
  if (phase === "artist-profile") {
    return (
      <ArtistProfileScreen
        artistData={artistData}
        artistAnswers={artistAnswers}
        onBack={() => setPhase("artist-home")}
        onResult={() => setPhase("artist-result")}
        onPending={() => setPhase("artist-pending")}
        onBlock={(blockId) => {
          const idx = ARTIST_BLOCKS.findIndex(b => b.id === blockId);
          if (idx === -1) return;
          setCurrentBlockIdx(idx);
          setPhase("block-home");
        }}
      />
    );
  }

  // ARTIST PENDING TASKS
  if (phase === "artist-pending") {
    return (
      <PendingTasksScreen
        blocks={ARTIST_BLOCKS}
        answers={artistAnswers}
        title={artistData.name}
        onBack={() => setPhase("artist-home")}
        onGoToQuestion={(qIdx) => {
          setArtistQIdx(qIdx);
          // Set current block based on question index
          let count = 0;
          for (let i = 0; i < ARTIST_BLOCKS.length; i++) {
            ARTIST_BLOCKS[i].subcats.forEach(s => { count += s.items.length; });
            if (qIdx < count) { setCurrentBlockIdx(i); break; }
          }
          setPhase("artist-questions");
        }}
      />
    );
  }

  // ARTIST CATALOGUE — songs linked to this artist
  if (phase === "artist-catalogue") {
    return (
      <ArtistCatalogueScreen
        artistData={artistData}
        profile={profile}
        onBack={() => setPhase("artist-home")}
        onNewProject={() => {
          setCurrentSong({ data: { artistName: artistData.name, linkedArtist: { ...artistData } }, answers: {} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        onOpenProject={(p) => {
          setCurrentSong({
            data: { ...p, artistId: p.artistId || artistData?.id, linkedArtist: p.linkedArtist || { id: artistData?.id, name: artistData?.name } },
            answers: p.answers || {}
          });
          setSongQIdx(0);
          setPhase("song-home");
        }}
      />
    );
  }

  // ARTIST QUESTIONS
  if (phase === "artist-questions") {
    const q = ARTIST_QUESTIONS[artistQIdx];
    if (!q) { setPhase("block-home"); return null; }
    return (
      <SwipeCard
        question={q}
        onAnswer={handleArtistAnswer}
        currentIndex={artistQIdx + 1}
        total={ARTIST_QUESTIONS.length}
        answers={artistAnswers}
        blockLabel={q.blockLabel}
        subcatLabel={q.subcatLabel}
        phase="artist"
        phaseName={artistData.name || "Artista"}
        photo={artistData.photo}
        onHome={() => setPhase("block-home")}
        onGoHome={() => setPhase("artist-home")}
        onGoBlock={() => setPhase("block-home")}
      />
    );
  }

  // ARTIST SUBCAT SUMMARY
  if (phase === "artist-subcat-summary") {
    return (
      <SubcatSummaryScreen
        subcatInfo={currentSubcatInfo}
        photo={artistData.photo}
        phaseName={`Artista · ${artistData.name || ""}`}
        onBack={() => {
          // Go back to last question of this subcat
          const subcatEndIdx = currentSubcatInfo?.endIdx ?? (artistQIdx - 1);
          setArtistQIdx(subcatEndIdx);
          setPhase("artist-questions");
        }}
        onContinue={() => {
          if (currentSubcatInfo?.isBlockEnd) {
            setPhase("artist-block-summary");
          } else {
            setPhase("artist-questions");
          }
        }}
      />
    );
  }

  // ARTIST BLOCK SUMMARY
  if (phase === "artist-block-summary") {
    const block = ARTIST_BLOCKS[currentBlockIdx];
    const isLast = currentBlockIdx === ARTIST_BLOCKS.length - 1;
    return (
      <BlockSummaryScreen
        block={block}
        answers={artistAnswers}
        blockIndex={currentBlockIdx + 1}
        totalBlocks={ARTIST_BLOCKS.length}
        phaseName={`Artista · ${artistData.name || ""}`}
        photo={artistData.photo}
        onBack={() => {
          setArtistQIdx(ARTIST_BLOCK_ENDS[currentBlockIdx]);
          setPhase("artist-questions");
        }}
        onContinue={() => setPhase("artist-home")}
      />
    );
  }

  // ARTIST RESULT — total summary with hex radar
  if (phase === "artist-result") {
    return (
      <TotalSummaryScreen
        blocks={ARTIST_BLOCKS}
        answers={artistAnswers}
        title={artistData.name || "Artista"}
        subtitle="Resultado Artista"
        photo={artistData.photo}
        onContinue={() => setPhase("artist-home")}
        continueLabel="← Volver al artista"
        onSecondary={() => { setCurrentSong({ data: {}, answers: {} }); setSongQIdx(0); setPhase("song-form"); }}
        secondaryLabel="Evaluar canción →"
      />
    );
  }

  // SONG FORM
  if (phase === "song-form") {
    // Always get fresh artist from live store
    const liveArtist = artistData?.id ? (getArtists().find(a => a.id === artistData.id) || artistData) : null;
    return <ProjectForm
      profile={profile}
      songNum={songs.length + 1}
      prefilledArtist={liveArtist}
      onBack={() => setPhase(liveArtist ? "artist-catalogue" : "welcome")}
      onSubmit={async (data) => {
        // Resolve artistId from every possible source
        const artistId = data.linkedArtist?.id || data.artistId || artistData?.id || null;
        console.log("🎵 song-form submit — artistId:", artistId, "linkedArtist:", data.linkedArtist?.name, "artistData:", artistData?.name);
        if (data.linkedArtist) setArtistData(data.linkedArtist);
        const projectId = Date.now().toString();
        const projectEntry = { ...data, id: projectId, artistId, answers: {}, createdAt: new Date().toISOString() };
        if (artistId) {
          await saveProject(projectEntry, artistId);
        } else {
          console.error("❌ No artistId found — project NOT saved to Firebase");
        }
        setCurrentSong({ data: projectEntry, answers: {} });
        setCurrentSongAnswers({});
        setSongQIdx(0);
        setPhase("song-home");
      }}
    />;
  }

  // SONG QUESTIONS
  if (phase === "song-questions") {
    const q = SONG_QUESTIONS[songQIdx];
    if (!q) { setPhase("song-block-home"); return null; }
    return (
      <SwipeCard
        question={q}
        onAnswer={handleSongAnswer}
        currentIndex={songQIdx + 1}
        total={SONG_QUESTIONS.length}
        answers={currentSong?.answers || {}}
        blockLabel={q.blockLabel}
        subcatLabel={q.subcatLabel}
        phase="song"
        phaseName={currentSong?.data?.title || "Canción"}
        photo={currentSong?.data?.photo}
        onHome={() => setPhase("song-block-home")}
        onGoHome={() => setPhase("song-home")}
        onGoBlock={() => setPhase("song-block-home")}
      />
    );
  }

  // SONG SUBCAT SUMMARY
  if (phase === "song-subcat-summary") {
    return (
      <SubcatSummaryScreen
        subcatInfo={currentSubcatInfo}
        photo={currentSong?.data?.photo}
        phaseName={`Catálogo · ${currentSong?.data?.title || ""}`}
        onBack={() => {
          const subcatEndIdx = currentSubcatInfo?.endIdx ?? (songQIdx - 1);
          setSongQIdx(subcatEndIdx);
          setPhase("song-questions");
        }}
        onContinue={() => {
          if (currentSubcatInfo?.isBlockEnd) {
            setPhase("song-block-summary");
          } else {
            setPhase("song-questions");
          }
        }}
      />
    );
  }

  // SONG BLOCK SUMMARY
  if (phase === "song-block-summary") {
    const block = SONG_BLOCKS[currentBlockIdx];
    return (
      <BlockSummaryScreen
        block={block}
        answers={currentSong?.answers || {}}
        blockIndex={currentBlockIdx + 1}
        totalBlocks={SONG_BLOCKS.length}
        phaseName={`Catálogo · ${currentSong?.data?.title || ""}`}
        photo={currentSong?.data?.photo}
        onBack={() => {
          setSongQIdx(SONG_BLOCK_ENDS[currentBlockIdx]);
          setPhase("song-questions");
        }}
        onContinue={() => setPhase("song-home")}
      />
    );
  }

  // SONG RESULT — total summary with hex radar
  if (phase === "song-result") {
    const songScore = calcTotalScore(SONG_BLOCKS, currentSong?.answers || {});
    const allWithCurrent = [...songs, { ...currentSong, score: songScore }];
    const avg = Math.round(allWithCurrent.reduce((a,s) => a + s.score, 0) / allWithCurrent.length * 10) / 10;
    return (
      <TotalSummaryScreen
        blocks={SONG_BLOCKS}
        answers={currentSong?.answers || {}}
        title={currentSong?.data?.title || `Canción ${songs.length + 1}`}
        subtitle={`Canción ${songs.length + 1} · Media actual: ${avg}`}
        photo={currentSong?.data?.photo}
        onContinue={() => {
          setSongs(prev => [...prev, { ...currentSong, score: songScore }]);
          setCurrentSong({ data:{}, answers:{} });
          setSongQIdx(0);
          setPhase("song-form");
        }}
        continueLabel="+ Añadir otra canción"
        onSecondary={() => {
          setSongs(prev => [...prev, { ...currentSong, score: songScore }]);
          setCurrentSong(null);
          setPhase("final");
        }}
        secondaryLabel="Ver resultado final →"
      />
    );
  }

  // FINAL
  if (phase === "final") {
    const avg = songs.length > 0 ? Math.round(songs.reduce((a,s) => a+s.score,0)/songs.length*10)/10 : 0;
    const final = Math.round((avg*0.70 + artistScore*0.30)*10)/10;
    const color = scoreColor(final);
    return (
      <div style={{minHeight:"100dvh", background:bgColor(100), display:"flex", flexDirection:"column"}}>
        <div style={{padding:"16px 20px 0", paddingTop:"max(16px,env(safe-area-inset-top,16px))", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <img src={RIMAS_LOGO} alt="RI+D" style={{height:"28px",width:"28px",objectFit:"contain",borderRadius:"6px"}}/>
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"12px",color:"rgba(255,255,255,0.6)"}}>Resultado Final</div>
        </div>

        <div style={{flex:1,overflowY:"auto",WebkitOverflowScrolling:"touch",padding:"14px 18px"}}>

          {/* Score total hero */}
          <div style={{background:"rgba(0,0,0,0.35)",borderRadius:"18px",padding:"20px",marginBottom:"14px",textAlign:"center"}}>
            {artistData.photo && <img src={artistData.photo} alt="" style={{width:"60px",height:"60px",borderRadius:"50%",objectFit:"cover",margin:"0 auto 10px",display:"block",border:"2px solid rgba(255,255,255,0.3)"}}/>}
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"11px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"4px"}}>Score Total · {artistData.name||"Artista"}</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"72px",fontWeight:"700",color,lineHeight:1,marginBottom:"6px"}}>{final}</div>
            <div style={{display:"inline-block",padding:"4px 16px",borderRadius:"20px",background:color+"22",border:`1px solid ${color}44`,fontFamily:"Arial,sans-serif",fontSize:"13px",fontWeight:"700",color,marginBottom:"10px"}}>{scoreLabel(final)}</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"11px",color:"rgba(255,255,255,0.4)"}}>Canciones {avg} ×0.70 + Artista {artistScore} ×0.30</div>
          </div>

          {/* Proyectos evaluadas */}
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"8px"}}>Canciones evaluadas</div>
          {songs.map((s,i) => (
            <div key={i} style={{background:"rgba(0,0,0,0.3)",borderRadius:"12px",padding:"12px 14px",marginBottom:"8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                {s.data?.photo && <img src={s.data.photo} alt="" style={{width:"34px",height:"34px",borderRadius:"8px",objectFit:"cover"}}/>}
                <div>
                  <div style={{fontFamily:"Arial,sans-serif",fontSize:"13px",fontWeight:"700",color:"white"}}>{s.data?.title||`Canción ${i+1}`}</div>
                  {s.data?.date && <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.4)"}}>{s.data.date}</div>}
                </div>
              </div>
              <div style={{fontFamily:"Arial,sans-serif",fontSize:"22px",fontWeight:"700",color:scoreColor(s.score)}}>{s.score}</div>
            </div>
          ))}
          <div style={{background:"rgba(0,0,0,0.2)",borderRadius:"10px",padding:"10px 14px",marginBottom:"16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"12px",fontWeight:"700",color:"rgba(255,255,255,0.6)"}}>Media canciones</div>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"18px",fontWeight:"700",color:scoreColor(avg)}}>{avg}</div>
          </div>

          {/* Artista hex radar */}
          <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.5)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"8px"}}>Radar artista</div>
          <div style={{background:"#1e1e1e",borderRadius:"16px",padding:"12px 8px",marginBottom:"14px",display:"flex",justifyContent:"center"}}>
            <HexRadarTotal blocks={ARTIST_BLOCKS} answers={artistAnswers}/>
          </div>

          {/* Artista block scores */}
          <div style={{background:"rgba(0,0,0,0.25)",borderRadius:"14px",padding:"14px",marginBottom:"12px"}}>
            <div style={{fontFamily:"Arial,sans-serif",fontSize:"10px",fontWeight:"700",color:"rgba(255,255,255,0.4)",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:"10px"}}>Desglose artista</div>
            {ARTIST_BLOCKS.map(b => {
              const bs = Math.round(calcBlockScore(b,artistAnswers)*10)/10;
              return (
                <div key={b.id} style={{marginBottom:"10px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"4px"}}>
                    <div>
                      <span style={{fontFamily:"Arial,sans-serif",fontSize:"13px",color:"white",fontWeight:"700"}}>{b.label}</span>
                      <span style={{fontFamily:"Arial,sans-serif",fontSize:"10px",color:"rgba(255,255,255,0.4)",marginLeft:"6px"}}>×{Math.round(b.blockWeight*100)}%</span>
                    </div>
                    <div style={{fontFamily:"Arial,sans-serif",fontSize:"16px",fontWeight:"700",color:scoreColor(bs)}}>{bs}</div>
                  </div>
                  <div style={{height:"4px",background:"rgba(255,255,255,0.1)",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${bs}%`,background:scoreColor(bs),borderRadius:"2px"}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{padding:"12px 18px",paddingBottom:"max(12px,env(safe-area-inset-bottom,12px))"}}>
          <button onClick={()=>{saveProfile(null);setPhase("welcome");setArtistData({});setArtistAnswers({});setArtistQIdx(0);setCurrentBlockIdx(0);setSongs([]);setCurrentSong(null);setSongQIdx(0);}}
            style={{display:"block",width:"100%",padding:"17px",background:"white",color:"#E8151B",border:"none",borderRadius:"14px",fontFamily:"Arial,sans-serif",fontSize:"17px",fontWeight:"700",cursor:"pointer"}}>
            Nueva evaluación
          </button>
        </div>
      </div>
    );
  }

  return null;
}
// v1777864922
