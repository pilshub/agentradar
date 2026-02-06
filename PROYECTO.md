# AgentRadar - Monitor de Prensa Deportiva

## Descripción General
Dashboard profesional de monitorización de prensa deportiva diseñado para **representantes de futbolistas**. Permite seguir las menciones en medios de comunicación de jugadores del Real Betis y Sevilla FC, analizar sentimiento, y obtener insights relevantes para la gestión de sus carreras.

## URLs
- **Producción**: https://agentradar.vercel.app
- **Local**: http://localhost:3005
- **GitHub**: https://github.com/pilshub/agentradar

## Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Charts**: Recharts (AreaChart, LineChart, BarChart)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Notifications**: Sonner (toasts)
- **PDF Export**: jsPDF + html2canvas
- **Command Palette**: cmdk (⌘K)

## Estructura de Archivos Principales

```
src/
├── app/
│   ├── page.tsx              # Dashboard principal (1076+ líneas)
│   ├── dashboard/page.tsx    # Dashboard específico de Lukebakio
│   ├── player/[id]/page.tsx  # Vista detallada de jugador
│   ├── globals.css           # Design system "Dark Glass Pro"
│   ├── layout.tsx            # Layout con Toaster
│   └── api/
│       ├── player-image/     # Proxy para imágenes (ya no se usa, fotos locales)
│       ├── analyze/          # Análisis AI de noticias (OpenAI)
│       ├── players/          # API de jugadores
│       └── players/[id]/     # news, social, calendar, stats
├── data/
│   ├── players.ts            # 16 jugadores (8 Betis, 8 Sevilla)
│   ├── player-extended.ts    # Datos extendidos (contrato, stats, etc.)
│   ├── noticias.json         # Noticias scrapeadas
│   └── lukebakio-complete.json # Datos completos de Lukebakio
├── components/ui/            # shadcn/ui components
└── lib/utils.ts              # Utilidades (cn function)

public/
└── players/                  # 16 fotos PNG de jugadores (locales)
```

## Jugadores Monitorizados

### Real Betis (8)
| Jugador | ID | SofaScore ID | Posición |
|---------|-----|--------------|----------|
| Isco | isco | 103417 | Centrocampista |
| Lo Celso | lo-celso | 796362 | Centrocampista |
| Chimy Ávila | chimy-avila | 858498 | Delantero |
| Abde | abde | 1011375 | Extremo |
| Rui Silva | rui-silva | 344407 | Portero |
| Marc Bartra | marc-bartra | 99519 | Defensa |
| William Carvalho | william-carvalho | 137978 | Centrocampista |
| Johnny Cardoso | johnny-cardoso | 990169 | Centrocampista |

### Sevilla FC (8)
| Jugador | ID | SofaScore ID | Posición |
|---------|-----|--------------|----------|
| Lukebakio | lukebakio | 823631 | Extremo |
| Saúl | saul | 116955 | Centrocampista |
| Isaac Romero | isaac-romero | 993636 | Delantero |
| Jesús Navas | jesus-navas | 11869 | Lateral (Retirado) |
| En-Nesyri | en-nesyri | 862069 | Delantero |
| Gudelj | gudelj | 68332 | Centrocampista |
| Loïc Badé | loic-bade | 934258 | Defensa |
| Djibril Sow | djibril-sow | 799054 | Centrocampista |

## Funcionalidades Actuales

### Dashboard Principal (page.tsx)
- **Selector de jugadores** en sidebar izquierdo
- **6 pestañas**: Resumen, Contrato, Stats, Social, Rumores, Alertas
- **Command Palette** (⌘K) para búsqueda rápida
- **Atajos de teclado**: 1-9 para seleccionar jugadores
- **Export PDF** del perfil completo
- **Análisis de sentimiento** de noticias
- **Gráfico de valor de mercado** (Recharts)

### Funcionalidades por pestaña:
1. **Resumen**: Sentimiento, noticias recientes, métricas
2. **Contrato**: Info de contrato, salario, cláusula (DATOS MOCK - QUITAR)
3. **Stats**: Estadísticas de temporada, historial
4. **Social**: Seguidores, engagement (DATOS MOCK - MEJORAR)
5. **Rumores**: Equipos interesados (DATOS MOCK)
6. **Alertas**: Sistema de alertas (DATOS MOCK)

## Design System: "Dark Glass Pro"

### Colores principales
- Background: `oklch(0.08 0 0)` (#0a0a0a aprox)
- Cards: `bg-white/[0.03]` con `backdrop-blur-xl`
- Borders: `border-white/[0.06]`
- Brand gradient: `from-blue-500 to-cyan-400`

### Animaciones CSS (globals.css)
- `fadeIn`, `slideUp` - Entrada de elementos
- `shimmer` - Loading skeleton
- `radar` - Logo animado
- `pulseGlow` - Alertas
- `stagger-1` a `stagger-8` - Animaciones escalonadas

### Clases utilitarias
- `.glass-card` - Glassmorphism base
- `.glass-card-hover` - Hover effects
- `.gradient-text-brand` - Texto con gradiente
- `.team-betis` / `.team-sevilla` - Colores de equipo

## APIs y Credenciales

### OpenAI (para análisis AI de noticias)
```
OPENAI_API_KEY=sk-proj-tf984jDI5MET3N6GgQmtVLKR-...
```
Usado en: `/api/analyze/route.ts`

### Fotos de Jugadores
- **Fuente**: SofaScore (descargadas localmente)
- **Ubicación**: `/public/players/{id}.png`
- **Script de descarga**: `/scripts/download-photos.js`

## Estado Actual y Problemas Resueltos

### Resuelto ✅
- Fotos de jugadores funcionando (16/16)
- IDs de SofaScore corregidos
- Build compila sin errores
- Deploy en Vercel funcionando
- Design system completo
- Animaciones y transiciones

### Datos Mock (no reales) ⚠️
- Información de contratos
- Salarios y cláusulas
- Estadísticas de redes sociales
- Rumores de fichajes
- Sistema de alertas

## Próximos Pasos Discutidos

### Prioridad Alta: Análisis de RRSS
El usuario quiere:
1. **Quitar la pestaña de Contrato** (datos inventados, no útiles)
2. **Mejorar análisis de RRSS**:
   - Analizar cuentas de Twitter/Instagram de jugadores
   - Analizar menciones sobre jugadores en RRSS
   - Sentimiento de las menciones
   - Usuarios influyentes que hablan de ellos
   - Tendencias y picos de menciones

### APIs sugeridas para RRSS:
| Servicio | Tier Gratis | Uso |
|----------|-------------|-----|
| Twitter API v2 | 1500 tweets/mes | Búsqueda menciones |
| RapidAPI Social Searcher | 100/día | Multi-plataforma |
| Google Trends | Gratis | Interés temporal |
| NewsAPI | 100 req/día | Noticias |

### Implementación propuesta:
1. Integrar Twitter API para buscar menciones
2. Análisis de sentimiento con OpenAI
3. Dashboard de menciones en tiempo real
4. Alertas de picos de menciones
5. Identificar influencers que hablan del jugador

## Scripts Útiles

```bash
# Desarrollo
npm run dev -- -p 3005

# Build
npm run build

# Deploy a Vercel
vercel --prod --yes

# Descargar fotos de jugadores
node scripts/download-photos.js
```

## Archivos de Configuración

- `vercel.json` - No existe (usa defaults)
- `.vercel/project.json` - Project ID de Vercel
- `components.json` - Config de shadcn/ui
- `tailwind.config.ts` - Tailwind v4

## Notas Importantes

1. **Jesús Navas se retiró** el 1 de enero de 2025 - considerar quitarlo o marcarlo como retirado

2. **William Carvalho y Johnny Cardoso** se fueron del Betis en 2025 - actualizar plantilla

3. **Las noticias en noticias.json** son estáticas - implementar scraping automático

4. **El proxy de imágenes** (`/api/player-image`) ya no se usa - fotos locales funcionan mejor

## Historial de Cambios Recientes

### 2026-02-06
- ✅ Descargadas 16 fotos de jugadores localmente
- ✅ Corregidos IDs de SofaScore (Abde, Isco, Saúl, etc.)
- ✅ Design system "Dark Glass Pro" completo
- ✅ Deploy v3 a Vercel con todas las mejoras
- 📝 Discutido: quitar Contrato, mejorar RRSS

---

*Última actualización: 6 de febrero de 2026*
