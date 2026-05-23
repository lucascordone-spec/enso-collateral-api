# @enso-collateral/mcp-server

Este paquete implementa un servidor **MCP (Model Context Protocol)** para exponer las operaciones de apalancamiento y desapalancamiento de colateral (a través de Enso Finance y con cobro de comisión del 0.1%) como herramientas (tools) listas para ser consumidas por agentes de IA o LLMs.

## Características

- Expone la herramienta `build_collateral_leverage` para armar posiciones apalancadas.
- Expone la herramienta `dismantle_collateral_leverage` para desmontar posiciones de colateral.
- Se conecta automáticamente a la API Gateway en ejecución (`http://localhost:3000`) para generar las transacciones y enrutar las comisiones del 0.1% a tu Metamask.

## Instalación y Construcción

1. Instala las dependencias en la raíz del monorepo:
   ```bash
   npm install
   ```
2. Compila el servidor MCP:
   ```bash
   npm run build --workspace=packages/mcp-server
   ```

## Configuración en Clientes MCP (ej. Claude Desktop)

Para que un cliente MCP como Claude Desktop pueda conectarse a este servidor y usar las herramientas, debes agregarlo a tu configuración de Claude.

### En Windows:
Abre o crea el archivo `%APPDATA%\Claude\claude_desktop_config.json` y agrega lo siguiente bajo la clave `mcpServers`:

```json
{
  "mcpServers": {
    "enso-collateral": {
      "command": "node",
      "args": [
        "c:/Users/Lucas/OneDrive/Escritorio/bot atomico cuantico/unified-agent-router/Nueva carpeta/enso-collateral-api/packages/mcp-server/dist/index.js"
      ],
      "env": {
        "API_GATEWAY_URL": "http://localhost:3000"
      }
    }
  }
}
```

*Nota: Asegúrate de tener la API Gateway (`apps/api`) corriendo en `http://localhost:3000` para que el servidor MCP pueda resolver las peticiones correctamente.*
