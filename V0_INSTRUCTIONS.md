# AgentRadar - Instrucciones para v0

## Descripción del Proyecto

**AgentRadar** es una herramienta profesional de monitoreo de prensa para representantes de futbolistas. Permite seguir noticias, redes sociales, valor de mercado, lesiones, contrato y calendario de un jugador.

## Backend API (Ya desplegado)

Base URL: `https://agentradar.vercel.app`

---

## Endpoints Disponibles

### 1. Lista de Jugadores
```
GET /api/players
```

**Respuesta:**
```json
{
  "success": true,
  "count": 1,
  "players": [
    {
      "id": "lukebakio",
      "name": "Lukebakio",
      "fullName": "Dodi Lukebakio",
      "team": "Sevilla FC",
      "position": "Extremo derecho",
      "nationality": "Bélgica",
      "photo": "https://images.fotmob.com/image_resources/playerimages/672498.png",
      "number": 17
    }
  ]
}
```

---

### 2. Datos del Jugador
```
GET /api/players/{id}
```

**Ejemplo:** `/api/players/lukebakio`

**Respuesta:**
```json
{
  "success": true,
  "player": {
    "id": "lukebakio",
    "name": "Lukebakio",
    "fullName": "Dodi Lukebakio",
    "team": "Sevilla FC",
    "teamId": 559,
    "nationality": "Bélgica",
    "position": "Extremo derecho",
    "number": 17,
    "birthDate": "1997-09-24",
    "height": "1.87m",
    "foot": "Derecho",
    "photo": "https://images.fotmob.com/image_resources/playerimages/672498.png",
    "social": {
      "twitter": "@DLukebakio",
      "instagram": "dodilukebakio"
    },
    "transfermarktUrl": "https://www.transfermarkt.es/..."
  },
  "stats": {
    "total": 228,
    "last7Days": 15,
    "porSentimiento": { "positivo": 45, "negativo": 12, "neutral": 171 },
    "porPais": { "España": 89, "Bélgica": 34, "Francia": 28, ... },
    "rumores": 8
  },
  "alerts": {
    "newNews": 3,
    "newRumors": 1,
    "newCountries": ["España", "Bélgica"]
  }
}
```

---

### 3. Noticias (con filtros)
```
GET /api/players/{id}/news
```

**Query Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `region` | string | `spain_national`, `spain_local`, `belgium`, `france`, `uk`, `italy`, `germany`, `international` |
| `country` | string | `España`, `Bélgica`, `Francia`, `Reino Unido`, `Italia`, `Alemania`, `Internacional` |
| `sentiment` | string | `positivo`, `negativo`, `neutral` |
| `language` | string | `es`, `en`, `fr`, `nl`, `de`, `it` |
| `days` | number | Últimos N días (ej: 7, 30) |
| `limit` | number | Máximo de resultados |
| `rumorsOnly` | boolean | `true` para solo rumores de fichaje |

**Ejemplos:**
- `/api/players/lukebakio/news?region=spain_national&limit=10`
- `/api/players/lukebakio/news?sentiment=positivo&days=7`
- `/api/players/lukebakio/news?country=Bélgica`
- `/api/players/lukebakio/news?rumorsOnly=true`

**Respuesta:**
```json
{
  "success": true,
  "count": 50,
  "totalAvailable": 228,
  "filters": {
    "availableRegions": ["spain_national", "belgium", "france", ...],
    "availableCountries": ["España", "Bélgica", "Francia", ...]
  },
  "summary": {
    "byRegion": { "spain_national": 89, "belgium": 34, ... },
    "byCountry": { "España": 89, "Bélgica": 34, ... },
    "bySentiment": { "positivo": 45, "negativo": 12, "neutral": 171 }
  },
  "news": [
    {
      "id": "abc123",
      "titulo": "Lukebakio vuelve a los entrenamientos",
      "descripcion": "El extremo belga...",
      "fuente": "Marca",
      "url": "https://...",
      "fecha": "2026-02-03T10:00:00Z",
      "imagen": "https://...",
      "sentimiento": { "tipo": "positivo", "score": 2 },
      "esRumor": false,
      "alcance": 5000000,
      "idioma": "es",
      "region": "spain_national",
      "pais": "España",
      "topics": ["injury", "training"]
    }
  ]
}
```

---

### 4. Redes Sociales
```
GET /api/players/{id}/social
```

**Query Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `platform` | string | `twitter`, `instagram`, `all` (default) |

**Respuesta:**
```json
{
  "success": true,
  "totalReach": 323400,
  "engagementRate": 4.2,
  "platforms": {
    "twitter": {
      "handle": "@DLukebakio",
      "followers": 89400,
      "following": 312,
      "tweets": 1243,
      "sentiment": { "positive": 67, "neutral": 28, "negative": 5 },
      "recentMentions": [
        {
          "user": "@SevillaFC",
          "text": "🔝 @DLukebakio vuelve a los entrenamientos",
          "likes": 4523,
          "retweets": 342,
          "date": "2026-02-01T10:30:00Z"
        }
      ]
    },
    "instagram": {
      "handle": "dodilukebakio",
      "followers": 234000,
      "posts": 287,
      "avgLikes": 15400,
      "avgComments": 342,
      "recentPosts": [
        {
          "caption": "Back on track 💪🏾 #SFC",
          "likes": 24500,
          "comments": 567,
          "date": "2026-02-01T18:00:00Z",
          "type": "image"
        }
      ]
    }
  }
}
```

---

### 5. Calendario de Partidos
```
GET /api/players/{id}/calendar
```

**Query Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `type` | string | `club`, `national`, `all` (default) |
| `limit` | number | Máximo de partidos |

**Respuesta:**
```json
{
  "success": true,
  "count": 5,
  "team": { "name": "Sevilla FC", "id": 559 },
  "nationalTeam": {
    "country": "Belgium",
    "caps": 12,
    "goals": 2,
    "lastCallUp": "2025-11-15"
  },
  "matches": [
    {
      "id": 123,
      "date": "2026-02-08T18:30:00Z",
      "competition": "La Liga",
      "homeTeam": "Sevilla FC",
      "awayTeam": "Real Madrid",
      "isHome": true,
      "type": "club",
      "status": "SCHEDULED"
    }
  ]
}
```

---

### 6. Estadísticas Completas
```
GET /api/players/{id}/stats
```

**Query Parameters:**
| Param | Tipo | Descripción |
|-------|------|-------------|
| `section` | string | `marketValue`, `injuries`, `contract`, `performance`, `all` (default) |

**Respuesta:**
```json
{
  "success": true,
  "marketValue": {
    "current": "15M €",
    "peak": "25M €",
    "peakDate": "2023-06",
    "history": [
      { "date": "2019-01", "value": 3.5, "valueFormatted": "3.5M €" },
      { "date": "2019-06", "value": 8, "valueFormatted": "8M €" },
      { "date": "2020-01", "value": 12, "valueFormatted": "12M €" },
      ...
    ],
    "transferHistory": [
      { "date": "2017", "from": "Anderlecht", "to": "Watford", "fee": "Free" },
      { "date": "2019", "from": "Watford", "to": "Hertha BSC", "fee": "€20M" },
      { "date": "2022", "from": "Hertha BSC", "to": "Sevilla FC", "fee": "€10M" }
    ]
  },
  "injuries": {
    "current": null,
    "history": [
      {
        "type": "Lesión muscular",
        "area": "Muslo derecho",
        "startDate": "2025-12-15",
        "endDate": "2026-01-28",
        "missedGames": 5,
        "status": "Recuperado"
      }
    ],
    "totalDaysOut": 67,
    "totalMissedGames": 9
  },
  "contract": {
    "expiryDate": "2027-06-30",
    "yearsRemaining": 1.4,
    "estimatedSalary": "€3M/year",
    "releaseClause": "€40M",
    "agent": "Jorge Mendes (Gestifute)"
  },
  "performance": {
    "currentSeason": {
      "season": "2025/26",
      "appearances": 18,
      "goals": 5,
      "assists": 3,
      "minutesPlayed": 1234,
      "yellowCards": 2,
      "redCards": 0,
      "rating": 7.1,
      "passAccuracy": 82,
      "shotsPerGame": 2.3,
      "form": ["W", "D", "L", "W", "W"]
    },
    "seasonHistory": [
      { "season": "2024/25", "team": "Sevilla FC", "apps": 34, "goals": 8, "assists": 5 },
      { "season": "2023/24", "team": "Sevilla FC", "apps": 31, "goals": 11, "assists": 4 }
    ],
    "international": {
      "country": "Belgium",
      "caps": 12,
      "goals": 2,
      "lastCallUp": "2025-11-15"
    }
  }
}
```

---

## Diseño Sugerido para v0

### Layout Principal
```
┌─────────────────────────────────────────────────────────────┐
│  🔍 AgentRadar            [Jugador ▼]         [🔔] [⚙️]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  PERFIL DEL JUGADOR                                 │   │
│  │  ┌──────┐  Dodi Lukebakio          Sevilla FC      │   │
│  │  │ FOTO │  Extremo • Bélgica • #17                 │   │
│  │  └──────┘  📍 @DLukebakio  📷 dodilukebakio        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │ Resumen  │ Noticias │  RRSS    │Calendario│   Stats  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                                                             │
│  [Contenido de cada pestaña...]                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Pestaña: Resumen
- **Cards de resumen**: Total noticias, últimos 7 días, rumores activos
- **Gráfico de sentimiento**: Donut chart (positivo/negativo/neutral)
- **Alertas del día**: Nuevas noticias, nuevos países, rumores
- **Valor de mercado**: Mini chart con tendencia

### Pestaña: Noticias
- **Filtros**: Por país, región, sentimiento, idioma
- **Grid de noticias**: Cards con título, fuente, fecha, badge de sentimiento
- **Agrupación**: Nacional vs Internacional expandible
- **Ordenar por**: Fecha, relevancia, alcance

### Pestaña: RRSS
- **Tabs**: Twitter | Instagram
- **Stats cards**: Seguidores, engagement, sentimiento
- **Timeline**: Menciones recientes con métricas
- **Gráfico**: Sentimiento de menciones (barras)

### Pestaña: Calendario
- **Vista calendario**: Mes actual con partidos marcados
- **Lista próximos**: 5 partidos con Home/Away badge
- **Selección nacional**: Info de convocatorias

### Pestaña: Stats
- **Valor de mercado**: Line chart completo con hover
- **Historial de lesiones**: Timeline visual
- **Contrato**: Info card con countdown
- **Rendimiento**: Stats de temporada + histórico

---

## Prompt para v0

Copia y pega esto en v0.dev:

```
Crea un dashboard profesional para "AgentRadar", una herramienta de monitoreo de prensa deportiva para representantes de futbolistas.

IMPORTANTE: Usa estas APIs reales que ya están desplegadas:
- Base URL: https://agentradar.vercel.app
- GET /api/players - lista de jugadores
- GET /api/players/lukebakio - datos del jugador
- GET /api/players/lukebakio/news - noticias con filtros (?region=, ?sentiment=, ?days=, ?country=)
- GET /api/players/lukebakio/social - redes sociales
- GET /api/players/lukebakio/calendar - próximos partidos
- GET /api/players/lukebakio/stats - valor de mercado, lesiones, contrato, rendimiento

DISEÑO:
1. Header con logo "AgentRadar" y selector de jugador
2. Perfil del jugador (foto, nombre, equipo, posición, redes)
3. 5 pestañas: Resumen, Noticias, RRSS, Calendario, Stats

RESUMEN:
- Cards: total noticias, últimos 7 días, rumores, sentimiento general
- Mini chart de valor de mercado (trend)
- Alertas del día

NOTICIAS:
- Filtros: país, sentimiento, idioma, días
- Cards de noticias con: título, fuente, fecha, badge de sentimiento (verde/rojo/gris)
- Separación Nacional vs Internacional
- Ordenadas por fecha (más reciente primero)

RRSS:
- Tabs Twitter/Instagram
- Stats: seguidores, tweets/posts, engagement
- Gráfico de sentimiento (% positivo/neutral/negativo)
- Lista de menciones recientes con likes/retweets

CALENDARIO:
- Lista de próximos partidos
- Badge Home (verde) / Away (naranja)
- Competición, fecha, rival
- Info de selección nacional

STATS:
- Gráfico de valor de mercado (línea, 2019-2026)
- Timeline de lesiones con severidad
- Card de contrato (fecha fin, cláusula, agente)
- Stats de temporada (partidos, goles, asistencias)
- Historial de temporadas (tabla)

ESTILO:
- Dark theme profesional
- Colores: fondo #0a0a0a, cards #1a1a1a, accent #3b82f6
- Fuente: Inter o similar
- Bordes redondeados, sombras sutiles
- Responsive (mobile-first)
- Usar shadcn/ui components
- Charts con Recharts

Haz fetch real a las APIs. Los datos son reales y están actualizados.
```

---

## Testing de APIs

Prueba las APIs en tu navegador:

1. https://agentradar.vercel.app/api/players
2. https://agentradar.vercel.app/api/players/lukebakio
3. https://agentradar.vercel.app/api/players/lukebakio/news?limit=5
4. https://agentradar.vercel.app/api/players/lukebakio/news?sentiment=positivo
5. https://agentradar.vercel.app/api/players/lukebakio/social
6. https://agentradar.vercel.app/api/players/lukebakio/calendar
7. https://agentradar.vercel.app/api/players/lukebakio/stats

---

## Notas

- Las APIs tienen CORS habilitado (Next.js default)
- Los datos son reales, scrapeados de Google News
- El valor de mercado y redes sociales son datos estimados (mock)
- Para añadir más jugadores, crear archivos `{id}-complete.json` en `/src/data/`
