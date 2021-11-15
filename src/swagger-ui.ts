import { Context, HttpRequest } from "@azure/functions"
import { OpenRoute } from "."

export const buildHTML = (spec: object): string => {
    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Flyweight Swagger UI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.css" integrity="sha512-sFCybMLlCEgtHSq/iUUG/HL4PKfg5l/qlA2scyRpDWTZU8hWOomj/CrOTxpi9+w8rODDy+crxi2VxhLZ+gehWg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link href="https://static1.smartbear.co/swagger/media/assets/swagger_fav.png" type="image/png" rel="icon">
    <style>
      html
      {
        box-sizing: border-box;
        overflow: -moz-scrollbars-vertical;
        overflow-y: scroll;
      }

      *,
      *:before,
      *:after
      {
        box-sizing: inherit;
      }

      body
      {
        margin:0;
        background: #fafafa;
      }
    </style>
  </head>

  <body>
    <div id="swagger-ui"></div>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-bundle.js" integrity="sha512-eMCaaS1NeViiTEtjn6m1xogOzNaIEuZ55WXHiTVo5V0ZipQSgs1lOn4ry7MRO34YlK2peQA4cZGUbVEvyfg/4w==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui-standalone-preset.js" integrity="sha512-tgEpXQXe1VQOK8Yu3LRVgaxH1tDpBv0gxC6/tZcDQSiTARrLZz/AwM9kZM7VWkab/8CEv47ZpAh4eHUJfxcYHA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script>
    window.onload = function() {
      // Begin Swagger UI call region
      const ui = SwaggerUIBundle({
        spec: ${JSON.stringify(spec, null, 2)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
      // End Swagger UI call region

      window.ui = ui;
    };
  </script>
  </body>
</html>
  `
}

export const buildSwaggerUiRoute = (openRoute: OpenRoute): (_context: Context, _req: HttpRequest) => void => {
    return (context: Context, req: HttpRequest) => {
        const spec = openRoute.generateOpenApi("2", req);
        const html = buildHTML(spec)
        return context.res = {
            headers: Object.assign(context.res.headers, { "Content-Type": "text/html" }),
            body: html,
        }
    }
}
