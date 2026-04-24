# Sections life-web : backing backend

| Section UI | Backend | Notes |
|------------|---------|-------|
| Dashboard | `/health`, `/stats`, `/goose/stats` | Polling → SSE via P5 |
| Projects | `/projects` | OK |
| Chat | `/models`, `/models/catalog`, `/api/chat` | Filtre capability via P6 |
| Search | `/api/search` | OK |
| Providers | `/api/providers` | Ajouté par P7 |
| RAG | `/rag/stats`, `/rag/search`, `/rag/documents` | OK — `/rag` racine n'existe pas par design |
| Traces | `/traces/services`, `/traces/recent` | OK — `/traces/list` n'existe pas |
| Infra | `/infra/containers\|storage\|network\|machines` | OK |
| Governance | `/api/audit/status\|report` | OK |
| Monitoring | `/infra/machines\|gpu\|activepieces` | Étendu à 5 hôtes via P3 |
| **Schematic** | **aucun** | **FRONT-ONLY** — uploader drag-drop + gateway `cad.saillant.cc` |
| Config | `/config/providers\|platform\|preferences` | OK |
| Goose | `/goose/*` | OK |
| Datasheets | `/api/datasheets/*` + MCP `DATASHEET_MCP_URL` | OK |
| **Workflow** | **externe : `engine.saillant.cc`** | Bearer token séparé, pas life-core |

## Règle pour ajouter une nouvelle section

1. Vérifier que l'endpoint backend existe **et** retourne la shape attendue.
2. Si l'endpoint doit être ajouté, commencer par un test TDD dans life-core.
3. Si la section est front-only, documenter explicitement dans ce tableau pour éviter qu'un futur diagnostic la liste comme "backend manquant".
