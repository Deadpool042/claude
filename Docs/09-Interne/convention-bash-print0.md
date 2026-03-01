# Convention Bash — format `print0` (scalable)

Objectif : standardiser les échanges de données "structurées" (maps/arrays) entre fonctions Bash **sans `local -n`**, sans `eval`, et avec un comportement stable sous ShellCheck.

## Principe

- Une fonction productrice termine par le suffixe `_print0`.
- Elle écrit sur stdout un flux **séparé par NUL** (`\0`).
- Une fonction "loader" du core consomme ce flux et remplit une structure locale.

Ce format est robuste face aux espaces, guillemets, et au caractère `=`.

## Formats

### Map (tableau associatif)

Flux : `key\0value\0key\0value\0...`

Chargement :

```bash
declare -A m=()
sf_map_load_print0 m < <(ma_fonction_print0 "arg1" "arg2")
```

### Array (tableau indexé)

Flux : `tok0\0tok1\0tok2\0...`

Chargement :

```bash
local args=()
sf_array_load_print0 args < <(printf '%s\0' a b c)
```

## Helpers core disponibles

Dans `lib/site-factory/core/utils.sh` :

- `sf_map_load_print0 <out_name>` : charge une map depuis stdin.
- `sf_array_load_print0 <out_name>` : charge un array depuis stdin.
- `sf_parse_set_args_print0 "$@"` : parse `--set key=value` et émet une map en `print0`.

## Exemple complet (pattern recommandé)

```bash
# 1) Parse overrides (--set)
declare -A overrides=()
sf_map_load_print0 overrides < <(sf_parse_set_args_print0 "$@")

# 2) Defaults via print0
declare -A cm=()
sf_map_load_print0 cm < <(clients_defaults_client_meta_print0 "$slug" "$id" "$ts")

# 3) Overrides appliqués ensuite
clients_apply_overrides overrides cm em sc
```

## Limites

- Le caractère NUL (`\0`) ne peut pas apparaître dans les clés/valeurs (cas très rare en pratique).
- Les clés de map ne doivent pas contenir `]` (sinon l’affectation `arr["$k"]` devient ambiguë).
