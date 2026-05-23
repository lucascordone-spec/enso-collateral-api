# Guía de Publicación en Directorios DeFi y Agentes de IA

Esta guía detalla los pasos exactos y plantillas requeridas para registrar tu plataforma (Dashboard, API y Servidor MCP) en los directorios más importantes del ecosistema cripto e inteligencia artificial para maximizar la visibilidad y el uso por otros agentes.

---

## 1. DappRadar (Directorio de DApps #1)

DappRadar es el catálogo principal que consultan los usuarios de Web3 para descubrir nuevas aplicaciones.

### Pasos para listar:
1. Regístrate en la consola de desarrolladores en **[DappRadar Developer Console](https://developer.dappradar.com/)**.
2. Haz clic en **"Submit New Dapp"**.
3. Completa el formulario con los siguientes datos:
   * **Dapp Name:** Enso Collateral AI Gateway
   * **Website URL:** *[Aquí pones la URL donde hostees tu Dashboard, ej: https://tu-dashboard.com]*
   * **Logo:** *[Sube el logo o captura de pantalla de la app]*
   * **Category:** DeFi (Finanzas Descentralizadas) o Developer Tools (Herramientas de Desarrollador).
   * **Short Description:** Atomic leverage and deleverage gateway using Enso flash loans, custom-built for AI agents and yield farmers.
   * **Full Description:** Enso Collateral provides an API, an Eliza OS plugin, and a Model Context Protocol (MCP) server that allows users and autonomous AI agents to build and dismantle leveraged collateral positions atomically. It uses Enso's advanced flash loan routing to secure execution and processes transactions in a single block, routing a 0.1% fee directly to the platform creator. Includes a cyberpunk-style Matrix dashboard for analytics.
   * **Supported Blockchains:** Arbitrum, Ethereum, Polygon, Optimism, Base.
   * **Smart Contracts (Optional):** Dado que utilizamos los contratos de Enso, no es necesario listar contratos propios.

---

## 2. DeFiLlama (Analíticas DeFi y tracking de volumen)

Aparecer en DeFiLlama es fundamental para que el volumen y las tarifas (fees) generadas por tu plataforma sean públicas y den prestigio al proyecto.

### Pasos para listar:
1. Una vez que tu API empiece a procesar transacciones reales en mainnet, ingresa a la documentación de DeFiLlama: **[DeFiLlama List Protocol](https://docs.llama.fi/list-your-project/listing-a-protocol)**.
2. DeFiLlama requiere crear un "Adapter" (un script sencillo en JS/TS que consulte tu volumen de transacciones). Puedes clonar su repositorio oficial `defillama-adapters` en GitHub.
3. El adapter para tu proyecto simplemente debe sumar el volumen de transacciones procesadas llamando a la API de Enso filtrando por tu dirección de fee receiver (`0x8f7670EA615910D0A86320e84A611577F68E3908`).
4. Abre un Pull Request en su repositorio y su equipo técnico lo listará en la sección **"Yield / Leverage"**.

---

## 3. Smithery.ai (Registro de Servidores MCP)

Permite que cualquier agente instale tu servidor MCP con un solo clic.

### Pasos para listar:
1. Ve a **[Smithery.ai](https://smithery.ai)** y haz clic en **"Submit a Server"**.
2. Vincula tu cuenta de GitHub y selecciona el repositorio: `lucascordone-spec/enso-collateral-api`.
3. Completa los datos:
   * **Name:** enso-collateral
   * **Description:** An MCP server for atomic collateral leverage & deleverage using Enso Finance flash loans.
   * **Installation Command:** `npx @smithery/cli install enso-collateral` (Smithery genera este comando automáticamente).

---

## 4. Directorios MCP.so y Glama.ai

### Pasos para listar:
1. Ingresa a **[mcp.so](https://mcp.so/)** o **[glama.ai/mcp](https://glama.ai/mcp)**.
2. Haz clic en **"Add Tool"** o **"Submit MCP Server"**.
3. Pega la URL del repositorio de GitHub: `https://github.com/lucascordone-spec/enso-collateral-api`.
4. Los servidores leerán tu archivo `packages/mcp-server/mcp-manifest.json` de manera automática y cargarán tus herramientas públicas en sus buscadores.
