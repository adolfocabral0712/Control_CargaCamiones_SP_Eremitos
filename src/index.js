export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/datos") {
      return obtenerDatos(env);
    }

    if (url.pathname.startsWith("/api/")) {
      return respuestaJson(
        {
          error: "Ruta de API no encontrada."
        },
        404
      );
    }

    return env.ASSETS.fetch(request);
  }
};


async function obtenerDatos(env) {
  const origenJson =
    env.CONTROL_CHOFERES_JSON_URL;

  if (!origenJson) {
    return respuestaJson(
      {
        error:
          "Falta configurar el Secret CONTROL_CHOFERES_JSON_URL."
      },
      500
    );
  }

  try {
    const respuesta = await fetch(
      origenJson,
      {
        method: "GET",

        headers: {
          Accept: "application/json"
        },

        cf: {
          cacheTtl: 0,
          cacheEverything: false
        }
      }
    );

    if (!respuesta.ok) {
      return respuestaJson(
        {
          error:
            `No se pudo obtener el JSON. HTTP ${respuesta.status}.`
        },
        502
      );
    }

    const contenido =
      await respuesta.text();

    JSON.parse(contenido);

    return new Response(
      contenido,
      {
        status: 200,

        headers: {
          "Content-Type":
            "application/json; charset=UTF-8",

          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0",

          Pragma: "no-cache",
          Expires: "0",

          "X-Content-Type-Options":
            "nosniff"
        }
      }
    );

  } catch (error) {
    return respuestaJson(
      {
        error:
          "No fue posible cargar o validar el JSON.",

        detalle:
          error instanceof Error
            ? error.message
            : String(error)
      },
      502
    );
  }
}


function respuestaJson(
  datos,
  estado = 200
) {
  return new Response(
    JSON.stringify(datos, null, 2),
    {
      status: estado,

      headers: {
        "Content-Type":
          "application/json; charset=UTF-8",

        "Cache-Control":
          "no-store",

        "X-Content-Type-Options":
          "nosniff"
      }
    }
  );
}
