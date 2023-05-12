To add a new request type to the client and server, run

```bash
yarn insert-api-snippets
```

## Configuring the templates

`template/insert-api/template--insert-api--server.laravel-api.txt`
`template/insert-api/template--insert-api--laravel.controller.method.txt`
`template/insert-api/template--insert-api--client.store-request.method.txt`


each Template is represented by a manifest
{
  "variables": {
    "MY_VAR": "my_value",
  },
  "files": [
    {
      "path": "../../simple-file.ts",
      "token": "// END DYNAMIC UPDATES",
      "template": "template/minimal/template--minimal--simple.txt"
    },
  ]
}
